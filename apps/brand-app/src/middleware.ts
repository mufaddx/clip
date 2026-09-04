import { NextResponse, type NextRequest } from "next/server";
import {
  verifySessionToken,
  refreshSessionAtEdge,
  buildCookieHeader,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@clip/utilities";
import { BRAND_ROLES } from "@clip/types";

/**
 * Role gate for brand.domain.in — see docs/architecture/DOMAIN_ARCHITECTURE.md
 * "Routing enforcement". UX convenience only; the API re-verifies every
 * request — see docs/architecture/SECURITY_ARCHITECTURE.md.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/forbidden") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  let session = await verifySessionToken(accessToken, process.env.AUTH_SECRET ?? "");

  // The access token is short-lived (15m) by design; the 30d refresh token
  // is what should actually keep someone logged in until they log out
  // themselves — see docs/users/AUTHENTICATION_FLOW.md "Silent refresh".
  // Without this, every navigation after 15 minutes bounced straight to
  // /login even with a perfectly valid session.
  let refreshedTokens: { accessToken: string; refreshToken: string } | null = null;
  if (!session) {
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const authSecret = process.env.AUTH_SECRET;
    if (refreshToken && apiUrl && authSecret) {
      const refreshed = await refreshSessionAtEdge(apiUrl, refreshToken, authSecret);
      if (refreshed) {
        session = refreshed.session;
        refreshedTokens = { accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken };
      }
    }
  }

  if (!session) {
    const publicUrl = process.env.NEXT_PUBLIC_PUBLIC_APP_URL ?? "http://localhost:3000";
    return NextResponse.redirect(`${publicUrl}/login`);
  }

  let response: NextResponse;
  if (!BRAND_ROLES.includes(session.role)) {
    response = NextResponse.redirect(new URL("/forbidden", request.url));
  } else if (!session.onboardingComplete && pathname !== "/onboarding") {
    response = NextResponse.redirect(new URL("/onboarding", request.url));
  } else if (refreshedTokens) {
    // response.cookies.set() below only reaches the browser's *next*
    // request — forward the fresh token to this request's own Server
    // Components too, or they'd still read the expired one via cookies().
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(
      "cookie",
      buildCookieHeader(request.headers.get("cookie"), {
        [ACCESS_TOKEN_COOKIE]: refreshedTokens.accessToken,
        [REFRESH_TOKEN_COOKIE]: refreshedTokens.refreshToken,
      })
    );
    response = NextResponse.next({ request: { headers: requestHeaders } });
  } else {
    response = NextResponse.next();
  }

  if (refreshedTokens) {
    applyRefreshedCookies(response, refreshedTokens.accessToken, refreshedTokens.refreshToken);
  }

  return response;
}

function applyRefreshedCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  const common = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    domain: process.env.AUTH_COOKIE_DOMAIN ?? ".localhost",
    path: "/",
  };
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, { ...common, maxAge: 15 * 60 });
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, { ...common, maxAge: 30 * 24 * 60 * 60 });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js|map)$).*)"],
};

import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, ACCESS_TOKEN_COOKIE } from "@clip/utilities";
import { CLIPPER_ROLES } from "@clip/types";

/**
 * Role gate for clipper.domain.in — see docs/architecture/DOMAIN_ARCHITECTURE.md
 * "Routing enforcement" and docs/users/AUTHENTICATION_FLOW.md "Unauthorized
 * cross-app access". This is a UX convenience; the API independently
 * re-verifies role/permission on every request regardless of what this
 * middleware decided — see docs/architecture/SECURITY_ARCHITECTURE.md.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/forbidden") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const session = await verifySessionToken(token, process.env.AUTH_SECRET ?? "");

  if (!session) {
    const publicUrl = process.env.NEXT_PUBLIC_PUBLIC_APP_URL ?? "http://localhost:3000";
    return NextResponse.redirect(`${publicUrl}/login`);
  }

  if (!CLIPPER_ROLES.includes(session.role)) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  if (!session.onboardingComplete && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

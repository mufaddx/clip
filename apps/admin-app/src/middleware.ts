import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, ACCESS_TOKEN_COOKIE } from "@clip/utilities";
import { ADMIN_ROLES } from "@clip/types";

/**
 * Role gate for admin.domain.in — see docs/architecture/DOMAIN_ARCHITECTURE.md
 * "Routing enforcement". Admin accounts skip onboarding entirely (see
 * docs/users/ADMIN_USER_FLOW.md "Provisioning"), so there's no onboarding
 * redirect here, unlike the clipper/brand middleware.
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

  if (!ADMIN_ROLES.includes(session.role)) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js|map)$).*)"],
};

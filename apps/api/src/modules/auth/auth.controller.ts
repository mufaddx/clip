import { Body, Controller, HttpCode, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { getEnv } from "@clip/config";
import { Public } from "../../common/decorators/public.decorator";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "../../common/constants";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { ResendVerificationDto } from "./dto/resend-verification.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

/**
 * /v1/auth — see docs/api/API_ENDPOINTS.md and docs/users/AUTHENTICATION_FLOW.md.
 * Every route here is @Public() (no session required to call it) except
 * /refresh and /logout, which require the refresh cookie itself.
 */
@Controller("v1/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // No session cookies here — register() only creates the account and
  // emails an OTP; verifyEmail() below is what actually issues a session.
  @Public()
  @Post("register")
  async register(@Body() dto: SignupDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post("verify-email")
  @HttpCode(200)
  async verifyEmail(@Body() dto: VerifyEmailDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, ...body } = await this.authService.verifyEmail(dto.email, dto.code);
    setSessionCookies(res, accessToken, refreshToken);
    return body;
  }

  @Public()
  @Post("resend-verification")
  @HttpCode(200)
  async resendVerification(@Body() dto: ResendVerificationDto) {
    await this.authService.resendVerification(dto.email);
    return { success: true }; // always success — never reveals account state
  }

  @Public()
  @Post("login")
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, ...body } = await this.authService.login(dto);
    setSessionCookies(res, accessToken, refreshToken);
    return body;
  }

  @Public()
  @Post("refresh")
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const currentRefresh = req.cookies?.[REFRESH_TOKEN_COOKIE];
    const { accessToken, refreshToken, ...body } = await this.authService.refresh(currentRefresh);
    setSessionCookies(res, accessToken, refreshToken);

    // Each frontend's own middleware calls this endpoint server-side to
    // silently refresh an expired access token during navigation (see
    // packages/utilities/src/session.ts refreshSessionAtEdge) and can't
    // reliably parse this response's Set-Cookie headers back out of a
    // generic fetch(). It proves it's trusted by presenting AUTH_SECRET —
    // shared only between this API and each frontend's server-side env,
    // never sent by a browser — and gets the raw tokens back in the body
    // too, on top of the cookies set above.
    const isTrustedEdgeCaller = req.headers["x-edge-refresh-secret"] === getEnv().AUTH_SECRET;
    return isTrustedEdgeCaller ? { ...body, accessToken, refreshToken } : body;
  }

  @Public()
  @Post("logout")
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.cookies?.[REFRESH_TOKEN_COOKIE]);
    res.clearCookie(ACCESS_TOKEN_COOKIE);
    res.clearCookie(REFRESH_TOKEN_COOKIE);
    return { success: true };
  }

  @Public()
  @Post("forgot-password")
  @HttpCode(200)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.requestPasswordReset(dto.email);
    return { success: true }; // always success — never reveals whether the email exists
  }

  @Public()
  @Post("reset-password")
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
    return { success: true };
  }
}

/**
 * Sets both session cookies scoped to the shared parent domain so a session
 * is valid across domain.in / clipper.domain.in / brand.domain.in / admin.domain.in
 * without a second login — see docs/architecture/DOMAIN_ARCHITECTURE.md and
 * docs/architecture/SECURITY_ARCHITECTURE.md.
 */
function setSessionCookies(res: Response, accessToken: string, refreshToken: string): void {
  const env = getEnv();
  const isProd = env.NODE_ENV === "production";

  const common = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    domain: env.AUTH_COOKIE_DOMAIN,
  };

  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, { ...common, maxAge: 15 * 60 * 1000 });
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, { ...common, maxAge: 30 * 24 * 60 * 60 * 1000 });
}

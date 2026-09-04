import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { createHash, randomBytes, randomInt } from "crypto";
import { prisma, type OtpPurpose } from "@clip/db";
import type { SessionUser, LoginResponseDto, RegisterResponseDto } from "@clip/types";
import { sendEmailNow } from "../../common/email";
import { otpEmailTemplate } from "../../common/email-templates";
import type { LoginDto } from "./dto/login.dto";
import type { SignupDto } from "./dto/signup.dto";

/** What issueSession/login/refresh return — the controller strips
 * accessToken/refreshToken off into cookies before responding to the client. */
export type SessionTokens = LoginResponseDto & { accessToken: string; refreshToken: string };

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Business logic for authentication — the only layer that touches @clip/db
 * for this module, per docs/architecture/BACKEND_ARCHITECTURE.md. Controllers
 * only validate input and delegate here.
 *
 * Email verification (docs/users/AUTHENTICATION_FLOW.md "Email
 * verification"): register() creates the account (status
 * PENDING_VERIFICATION, matching the schema default) and emails a 6-digit
 * code instead of issuing a session immediately. verifyEmail() is the only
 * place that actually flips status to ACTIVE and hands back a session —
 * login() refuses PENDING_VERIFICATION accounts (EMAIL_NOT_VERIFIED) so a
 * password alone can never skip verification.
 */
@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async register(dto: SignupDto): Promise<RegisterResponseDto> {
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException({ code: "EMAIL_IN_USE", message: "An account with this email already exists." });
    }

    const passwordHash = await argon2.hash(dto.password);
    const role = dto.roleChoice === "BRAND" ? "BRAND_OWNER" : "CLIPPER";

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { email: dto.email, passwordHash, role },
      });

      // Every eligible user gets a wallet AND a minimal role-specific
      // profile immediately — CampaignsService/ReelsService depend on
      // BrandProfile/CreatorProfile existing (see their getBrandId/
      // getCreatorId), so this can't wait for the onboarding wizard to run.
      // Onboarding (docs/users/ONBOARDING_FLOW.md) refines these fields
      // (categories, org details, etc.) rather than creating the row. The
      // real name arrives via the post-verification "complete profile"
      // step (PATCH /v1/brands/me or /v1/clippers/me) — this placeholder
      // just satisfies the not-null constraint until then.
      await tx.wallet.create({
        data: {
          userId: created.id,
          ownerType: role === "BRAND_OWNER" ? "BRAND" : "CREATOR",
        },
      });

      const emailLocalPart = dto.email.split("@")[0] ?? "New user";
      if (role === "BRAND_OWNER") {
        await tx.brandProfile.create({ data: { userId: created.id, companyName: emailLocalPart } });
      } else {
        await tx.creatorProfile.create({ data: { userId: created.id, displayName: emailLocalPart } });
      }

      if (dto.referralCode) {
        const referrer = await tx.user.findUnique({ where: { referralCode: dto.referralCode } });
        if (referrer && referrer.id !== created.id) {
          // Attribution only — eligibility/fraud screening and reward issuance
          // happen later in the Referral Reward Worker, never here.
          // See docs/referrals/REFERRAL_SYSTEM.md.
          await tx.referral.create({
            data: { referrerId: referrer.id, referredId: created.id },
          });
        }
      }

      return created;
    });

    await this.sendOtp(user.id, user.email, "EMAIL_VERIFICATION");
    return { email: user.email, requiresVerification: true };
  }

  /** The only route that turns a PENDING_VERIFICATION account into a real session. */
  async verifyEmail(email: string, code: string): Promise<SessionTokens> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException({ code: "OTP_INVALID", message: "That code isn't right." });
    }

    await this.consumeOtp(user.id, "EMAIL_VERIFICATION", code);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { status: "ACTIVE", emailVerifiedAt: new Date() },
    });

    return this.issueSession(updated.id, updated.email, updated.role, updated.onboardingComplete);
  }

  /** Silently no-ops for an unknown email or an already-verified account —
   * never reveals which case it was. */
  async resendVerification(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.status !== "PENDING_VERIFICATION") return;
    await this.sendOtp(user.id, user.email, "EMAIL_VERIFICATION");
  }

  async login(dto: LoginDto): Promise<SessionTokens> {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException({ code: "INVALID_CREDENTIALS", message: "Invalid email or password." });
    }

    if (user.status === "SUSPENDED") {
      throw new UnauthorizedException({ code: "ACCOUNT_SUSPENDED", message: "This account has been suspended." });
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException({ code: "INVALID_CREDENTIALS", message: "Invalid email or password." });
    }

    if (user.status === "PENDING_VERIFICATION") {
      // Correct password, but they never finished the OTP step — the
      // frontend catches this code and drops them back into OTP entry
      // (re-sending a code) instead of a generic login failure.
      throw new UnauthorizedException({ code: "EMAIL_NOT_VERIFIED", message: "Please verify your email to continue." });
    }

    return this.issueSession(user.id, user.email, user.role, user.onboardingComplete);
  }

  /** Issues an access token (JWT) + a refresh token (stored hashed) — see docs/users/AUTHENTICATION_FLOW.md. */
  private async issueSession(
    userId: string,
    email: string,
    role: SessionUser["role"],
    onboardingComplete: boolean
  ): Promise<SessionTokens> {
    const sessionUser: SessionUser = { id: userId, email, role, onboardingComplete };
    const accessToken = await this.jwtService.signAsync(sessionUser);

    const refreshToken = randomBytes(48).toString("hex");
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30d, matches AUTH_REFRESH_TOKEN_TTL

    await prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    // Relative path within the target app — the frontend combines this with
    // the app URL for `appForRole(role)` (see @clip/types) since each role's
    // app lives on its own subdomain, not a path under this one.
    const redirectTo = onboardingComplete ? "/dashboard" : "/onboarding";

    return { user: sessionUser, redirectTo, accessToken, refreshToken };
  }

  /**
   * A single browser can trigger two independent refreshes for the same
   * expired access token almost simultaneously — the Next.js edge
   * middleware's silent refresh on navigation, and apiFetchClient's own
   * 401-retry for an idle tab's in-flight request — both reading the same
   * refresh-token cookie value. Since refresh tokens are single-use, the
   * loser of that race would otherwise get REFRESH_TOKEN_REUSED and, on
   * the middleware side, a hard bounce to /login despite the session
   * actually being fine. GRACE_WINDOW_MS tolerates a refresh token that
   * was JUST rotated away by the winner of that race — reissuing a fresh
   * session instead of failing — while a token revoked longer ago (a
   * genuinely stale or replayed one) still fails as before.
   */
  private static readonly REFRESH_GRACE_WINDOW_MS = 15_000;

  async refresh(refreshToken: string): Promise<SessionTokens> {
    const tokenHash = hashToken(refreshToken);
    const stored = await prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        expiresAt: { gt: new Date() },
        OR: [
          { revokedAt: null },
          { revokedAt: { gt: new Date(Date.now() - AuthService.REFRESH_GRACE_WINDOW_MS) } },
        ],
      },
      include: { user: true },
    });

    if (!stored) {
      throw new UnauthorizedException({ code: "TOKEN_EXPIRED", message: "Session expired, please log in again." });
    }

    // Rotate only if this token hasn't already been revoked by a
    // concurrent call that won the race above.
    if (!stored.revokedAt) {
      await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    }

    return this.issueSession(stored.user.id, stored.user.email, stored.user.role, stored.user.onboardingComplete);
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Emails a 6-digit password-reset code — see
   * docs/users/AUTHENTICATION_FLOW.md "Password reset". Always resolves
   * (never reveals whether the email exists). Also used by
   * provisionAccountWithResetLink below to let a newly-provisioned admin
   * set their first password.
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;
    await this.sendOtp(user.id, user.email, "PASSWORD_RESET");
  }

  /** Verifies the reset code, updates the password, and revokes every existing refresh token for the account. */
  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException({ code: "OTP_INVALID", message: "That code isn't right." });
    }

    await this.consumeOtp(user.id, "PASSWORD_RESET", code);

    const passwordHash = await argon2.hash(newPassword);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
      prisma.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
  }

  /**
   * Used by AdminService to provision an ADMIN/SUPPORT/FINANCE_ADMIN account
   * — see docs/users/ADMIN_USER_FLOW.md "Provisioning". The invitee gets the
   * same OTP-based "set your password" email as everyone else, via
   * requestPasswordReset — there's no separate admin-only mechanism.
   */
  async provisionAccountWithResetLink(email: string, role: SessionUser["role"]): Promise<void> {
    const unusablePasswordHash = await argon2.hash(randomBytes(32).toString("hex"));
    await prisma.user.upsert({
      where: { email },
      create: { email, passwordHash: unusablePasswordHash, role, status: "PENDING_VERIFICATION" },
      update: {},
    });
    await this.requestPasswordReset(email);
  }

  /** Generates a 6-digit code, stores its hash (replacing any previous code
   * for the same purpose), and emails it immediately — not queued, since
   * the user is actively waiting for it. See common/email.ts. */
  private async sendOtp(userId: string, email: string, purpose: OtpPurpose): Promise<void> {
    const code = randomInt(100000, 1000000).toString(); // always 6 digits (100000–999999)
    const codeHash = hashToken(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await prisma.emailOtp.upsert({
      where: { userId_purpose: { userId, purpose } },
      create: { userId, purpose, codeHash, expiresAt },
      update: { codeHash, expiresAt },
    });

    const subject = purpose === "EMAIL_VERIFICATION" ? "Verify your Vidlix email" : "Reset your Vidlix password";
    const heading =
      purpose === "EMAIL_VERIFICATION" ? "Enter this code to verify your email" : "Enter this code to reset your password";
    await sendEmailNow(email, subject, otpEmailTemplate({ code, heading }));
  }

  /** Throws OTP_EXPIRED/OTP_INVALID, or deletes the row and returns on success. */
  private async consumeOtp(userId: string, purpose: OtpPurpose, code: string): Promise<void> {
    const row = await prisma.emailOtp.findUnique({ where: { userId_purpose: { userId, purpose } } });
    if (!row || row.expiresAt < new Date()) {
      throw new UnauthorizedException({ code: "OTP_EXPIRED", message: "This code has expired — request a new one." });
    }
    if (row.codeHash !== hashToken(code)) {
      throw new UnauthorizedException({ code: "OTP_INVALID", message: "That code isn't right." });
    }
    await prisma.emailOtp.delete({ where: { id: row.id } });
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

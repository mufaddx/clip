import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@clip/db";
import type { SessionUser, LoginResponseDto } from "@clip/types";
import type { LoginDto } from "./dto/login.dto";
import type { SignupDto } from "./dto/signup.dto";

/** What issueSession/register/login/refresh return — the controller strips
 * accessToken/refreshToken off into cookies before responding to the client. */
export type SessionTokens = LoginResponseDto & { accessToken: string; refreshToken: string };

/**
 * Business logic for authentication — the only layer that touches @clip/db
 * for this module, per docs/architecture/BACKEND_ARCHITECTURE.md. Controllers
 * only validate input and delegate here.
 */
@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async register(dto: SignupDto): Promise<SessionTokens> {
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

      // Every eligible user gets a wallet and, once onboarding starts, a
      // role-specific profile — see docs/users/ONBOARDING_FLOW.md.
      await tx.wallet.create({
        data: {
          userId: created.id,
          ownerType: role === "BRAND_OWNER" ? "BRAND" : "CREATOR",
        },
      });

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

    return this.issueSession(user.id, user.email, role, false);
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

  async refresh(refreshToken: string): Promise<SessionTokens> {
    const tokenHash = hashToken(refreshToken);
    const stored = await prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!stored) {
      throw new UnauthorizedException({ code: "TOKEN_EXPIRED", message: "Session expired, please log in again." });
    }

    // Rotate: revoke the used refresh token and issue a new pair.
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

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
   * Issues a signed, time-limited reset token — see
   * docs/users/AUTHENTICATION_FLOW.md "Password reset". Always resolves
   * (never reveals whether the email exists); logs the reset link since no
   * email provider is configured yet (docs/operations/NOTIFICATION_SYSTEM.md
   * "Email" — real delivery is a later pass).
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const token = await this.jwtService.signAsync({ sub: user.id, purpose: "password_reset" }, { expiresIn: "1h" });
    console.log(`[email stub] password reset link for ${email}: /reset-password?token=${token}`);
  }

  /** Verifies the reset token, updates the password, and revokes every existing refresh token for the account. */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    let payload: { sub: string; purpose: string };
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException({ code: "TOKEN_EXPIRED", message: "This reset link has expired or is invalid." });
    }
    if (payload.purpose !== "password_reset") {
      throw new UnauthorizedException({ code: "INVALID_TOKEN", message: "This link can't be used to reset a password." });
    }

    const passwordHash = await argon2.hash(newPassword);
    await prisma.$transaction([
      prisma.user.update({ where: { id: payload.sub }, data: { passwordHash } }),
      prisma.refreshToken.updateMany({ where: { userId: payload.sub, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
  }

  /**
   * Used by AdminService to provision an ADMIN/SUPPORT/FINANCE_ADMIN account
   * — see docs/users/ADMIN_USER_FLOW.md "Provisioning". The invitee gets a
   * set-password link (reusing the reset-password flow) rather than a
   * temporary password.
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
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

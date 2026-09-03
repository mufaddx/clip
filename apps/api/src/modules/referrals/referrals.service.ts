import { Injectable, Logger } from "@nestjs/common";
import { prisma } from "@clip/db";
import { WalletService } from "../wallet/wallet.service";

interface ReferralRulesSetting {
  rewardType: "FIXED" | "PERCENTAGE";
  rewardAmount: number;
  maxReward: number;
  expirationDays: number;
  perUserCap: number;
}

/**
 * Referral attribution happens at signup (see AuthService.register).
 * Everything here is the eligibility → fraud screening → reward pipeline —
 * see docs/referrals/REFERRAL_SYSTEM.md and REFERRAL_RULES.md.
 */
@Injectable()
export class ReferralsService {
  private readonly logger = new Logger(ReferralsService.name);

  constructor(private readonly walletService: WalletService) {}

  private async getRules(): Promise<ReferralRulesSetting> {
    const setting = await prisma.systemSetting.findUnique({ where: { key: "referral_rules" } });
    return (setting?.value as unknown as ReferralRulesSetting) ?? {
      rewardType: "FIXED",
      rewardAmount: 500,
      maxReward: 5000,
      expirationDays: 90,
      perUserCap: 20,
    };
  }

  async getMyReferrals(userId: string) {
    await this.expireStale(userId);
    return prisma.referral.findMany({
      where: { referrerId: userId },
      include: { reward: true, referred: { select: { email: true, createdAt: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  /** Marks PENDING referrals past their expiration window as EXPIRED — see REFERRAL_RULES.md "Expiration". */
  private async expireStale(referrerId: string) {
    const rules = await this.getRules();
    const cutoff = new Date(Date.now() - rules.expirationDays * 24 * 60 * 60 * 1000);
    await prisma.referral.updateMany({
      where: { referrerId, status: "PENDING", createdAt: { lt: cutoff } },
      data: { status: "EXPIRED" },
    });
  }

  /**
   * Called when a referred account crosses an eligibility milestone (v1:
   * completing onboarding — see docs/referrals/REFERRAL_RULES.md "Eligibility
   * rules"). Runs fraud screening before issuing anything; a flagged
   * referral is held for admin review, never auto-denied or auto-paid — see
   * docs/referrals/REFERRAL_FRAUD_PROTECTION.md.
   */
  async evaluateEligibility(referredUserId: string) {
    const referral = await prisma.referral.findUnique({
      where: { referredId: referredUserId },
      include: { referrer: true, referred: true },
    });
    if (!referral || referral.status !== "PENDING") return;

    const fraudReason = this.detectFraud(referral);
    if (fraudReason) {
      await prisma.referral.update({ where: { id: referral.id }, data: { status: "FLAGGED", flaggedReason: fraudReason } });
      this.logger.warn(`Referral ${referral.id} flagged: ${fraudReason}`);
      return;
    }

    const rules = await this.getRules();
    const rewardedCount = await prisma.referral.count({ where: { referrerId: referral.referrerId, status: "REWARDED" } });
    if (rewardedCount >= rules.perUserCap) {
      await prisma.referral.update({ where: { id: referral.id }, data: { status: "ELIGIBLE" } }); // eligible but capped — no reward issued
      return;
    }

    const amount = Math.min(rules.rewardAmount, rules.maxReward);

    await prisma.$transaction(async (tx) => {
      await tx.referral.update({ where: { id: referral.id }, data: { status: "REWARDED" } });
      await tx.referralReward.create({ data: { referralId: referral.id, amount, issuedAt: new Date() } });
    });

    await this.walletService.recognizeReferralReward(referral.referrerId, amount, referral.id);
  }

  /**
   * Self-referral / duplicate-account heuristics — see
   * docs/referrals/REFERRAL_FRAUD_PROTECTION.md. Deliberately conservative:
   * flags for human review, never auto-bans.
   */
  private detectFraud(referral: { referrer: { email: string }; referred: { email: string } }): string | null {
    const [refUser, refDomain] = referral.referrer.email.split("@");
    const [redUser, redDomain] = referral.referred.email.split("@");

    if (refDomain === redDomain && levenshteinClose(refUser, redUser)) {
      return "Referrer and referred email look like the same person (self-referral pattern).";
    }
    return null;
  }
}

/** Cheap similarity check — not a full Levenshtein implementation, just close-enough detection for near-identical local parts. */
function levenshteinClose(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 2) return false;
  const stripped = (s: string) => s.replace(/[.\-_+0-9]/g, "").toLowerCase();
  return stripped(a) === stripped(b);
}

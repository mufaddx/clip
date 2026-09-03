import { Injectable } from "@nestjs/common";
import { prisma } from "@clip/db";
import type { UserRole } from "@clip/types";
import { AuditService } from "../../common/audit/audit.service";

/**
 * Content review for what automated verification couldn't resolve — see
 * docs/admin/MODERATION_SYSTEM.md. Only SUPER_ADMIN/ADMIN can act (enforced
 * in the controller); SUPPORT can view via the same read endpoint while
 * handling a related ticket.
 */
@Injectable()
export class ModerationService {
  constructor(private readonly auditService: AuditService) {}

  /** Reels stuck in MANUAL_REVIEW — see docs/campaigns/REEL_VERIFICATION.md outcomes. */
  async listQueue() {
    return prisma.campaignReel.findMany({
      where: { status: "MANUAL_REVIEW" },
      include: {
        verifications: { orderBy: { checkedAt: "desc" }, take: 1 },
        campaignCreator: { include: { campaign: { select: { id: true, name: true } }, creator: { select: { displayName: true } } } },
      },
      orderBy: { submittedAt: "asc" },
    });
  }

  async decide(adminUserId: string, adminRole: UserRole, reelId: string, approve: boolean, reason?: string) {
    const reel = await prisma.campaignReel.findUniqueOrThrow({ where: { id: reelId } });
    const status = approve ? "VERIFIED" : "REJECTED";

    await prisma.$transaction([
      prisma.campaignReel.update({ where: { id: reelId }, data: { status } }),
      prisma.reelVerification.create({ data: { reelId, status, reason: reason ?? "Manual moderation decision" } }),
    ]);

    if (approve) {
      await prisma.campaignCreator.update({ where: { id: reel.campaignCreatorId }, data: { status: "TRACKING" } });
    }

    await this.auditService.log({
      actorId: adminUserId,
      actorRole: adminRole,
      action: approve ? "moderation.approve" : "moderation.reject",
      targetType: "campaign_reel",
      targetId: reelId,
      after: { status, reason },
    });

    return { status };
  }
}

import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma, type DisputeType } from "@clip/db";
import type { UserRole } from "@clip/types";
import { WalletService } from "../wallet/wallet.service";
import { AuditService } from "../../common/audit/audit.service";

const STAFF_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "SUPPORT", "FINANCE_ADMIN"];
const FINANCIAL_RESOLUTION_ROLES: UserRole[] = ["SUPER_ADMIN", "FINANCE_ADMIN"];

/**
 * Structured dispute resolution — see docs/operations/DISPUTE_SYSTEM.md.
 * Unlike support tickets, a resolved dispute can trigger a compensating
 * ledger reversal (see docs/finance/REFUND_SYSTEM.md).
 */
@Injectable()
export class DisputesService {
  constructor(
    private readonly walletService: WalletService,
    private readonly auditService: AuditService
  ) {}

  async open(userId: string, type: DisputeType, targetType: string, targetId: string, message: string) {
    return prisma.dispute.create({
      data: {
        type,
        openedById: userId,
        targetType,
        targetId,
        status: "OPEN",
        messages: { create: { authorId: userId, authorType: "user", body: message } },
      },
      include: { messages: true },
    });
  }

  async listMine(userId: string) {
    return prisma.dispute.findMany({ where: { openedById: userId }, orderBy: { createdAt: "desc" } });
  }

  async listAll() {
    return prisma.dispute.findMany({ orderBy: { createdAt: "desc" }, include: { openedBy: { select: { email: true } } } });
  }

  private async getDisputeForActor(actorId: string, actorRole: UserRole, disputeId: string) {
    const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) throw new NotFoundException({ code: "DISPUTE_NOT_FOUND", message: "Dispute not found." });
    const isOwner = dispute.openedById === actorId;
    const isStaff = STAFF_ROLES.includes(actorRole);
    if (!isOwner && !isStaff) throw new ForbiddenException({ code: "FORBIDDEN", message: "Not your dispute." });
    return dispute;
  }

  async getDispute(actorId: string, actorRole: UserRole, disputeId: string) {
    const dispute = await this.getDisputeForActor(actorId, actorRole, disputeId);
    return prisma.dispute.findUnique({ where: { id: dispute.id }, include: { messages: { orderBy: { createdAt: "asc" } } } });
  }

  async addMessage(actorId: string, actorRole: UserRole, disputeId: string, body: string, attachments: string[] = []) {
    const dispute = await this.getDisputeForActor(actorId, actorRole, disputeId);
    const isStaff = STAFF_ROLES.includes(actorRole);

    return prisma.$transaction(async (tx) => {
      const message = await tx.disputeMessage.create({
        data: { disputeId, authorId: actorId, authorType: isStaff ? "admin" : "user", body, attachments },
      });
      if (dispute.status === "OPEN") {
        await tx.dispute.update({ where: { id: disputeId }, data: { status: "UNDER_REVIEW" } });
      }
      return message;
    });
  }

  /**
   * Resolution requiring a financial reversal is gated to
   * FINANCE_ADMIN/SUPER_ADMIN — see docs/operations/DISPUTE_SYSTEM.md
   * "Resolution authority". Every resolution writes a full audit trail.
   */
  async resolve(
    adminUserId: string,
    adminRole: UserRole,
    disputeId: string,
    upheld: boolean,
    resolution: string,
    reversal?: { creatorUserId: string; reelId: string; amount: number }
  ) {
    const dispute = await prisma.dispute.findUniqueOrThrow({ where: { id: disputeId } });

    if (reversal && !FINANCIAL_RESOLUTION_ROLES.includes(adminRole)) {
      throw new ForbiddenException({ code: "FORBIDDEN", message: "A financial reversal requires FINANCE_ADMIN or SUPER_ADMIN." });
    }

    if (upheld && reversal) {
      await this.walletService.reverseEarning(reversal.creatorUserId, reversal.reelId, reversal.amount, disputeId);
    }

    const updated = await prisma.dispute.update({
      where: { id: disputeId },
      data: { status: "RESOLVED", resolution, resolvedBy: adminUserId, resolvedAt: new Date() },
    });

    await this.auditService.log({
      actorId: adminUserId,
      actorRole: adminRole,
      action: "dispute.resolve",
      targetType: "dispute",
      targetId: disputeId,
      before: { status: dispute.status },
      after: { status: "RESOLVED", upheld, resolution, reversal },
    });

    return updated;
  }
}

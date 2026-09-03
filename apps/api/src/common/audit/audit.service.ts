import { Injectable } from "@nestjs/common";
import { prisma, type Prisma } from "@clip/db";
import type { UserRole } from "@clip/types";

export interface AuditLogInput {
  actorId: string;
  actorRole: UserRole;
  action: string;
  targetType: string;
  targetId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Every state-changing admin action writes exactly one row here — no
 * exceptions, including SUPER_ADMIN actions. See docs/admin/AUDIT_LOGS.md.
 * Injected into any service that performs an admin-privileged mutation so
 * the write happens in the same transaction as the mutation itself.
 */
@Injectable()
export class AuditService {
  async log(input: AuditLogInput): Promise<void> {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        actorRole: input.actorRole,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        before: (input.before ?? undefined) as Prisma.InputJsonValue | undefined,
        after: (input.after ?? undefined) as Prisma.InputJsonValue | undefined,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  }
}

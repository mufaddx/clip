import { BadRequestException, Injectable } from "@nestjs/common";
import { prisma } from "@clip/db";
import type { UserRole } from "@clip/types";
import { AuthService } from "../auth/auth.service";
import { AuditService } from "../../common/audit/audit.service";

const ADMIN_TEAM_ROLES: UserRole[] = ["ADMIN", "SUPPORT", "FINANCE_ADMIN"];

/**
 * User management + platform settings for admin.domain.in — see
 * docs/admin/ADMIN_PANEL.md. Approval-queue actions (campaigns) live in
 * CampaignsService; this covers the account-level and settings surfaces.
 */
@Injectable()
export class AdminService {
  constructor(
    private readonly authService: AuthService,
    private readonly auditService: AuditService
  ) {}

  async listUsers(filter: "all" | "brands" | "clippers" | "admin-team" | "suspended") {
    const where =
      filter === "brands"
        ? { role: { in: ["BRAND_OWNER", "BRAND_TEAM_MEMBER"] as UserRole[] } }
        : filter === "clippers"
          ? { role: "CLIPPER" as UserRole }
          : filter === "admin-team"
            ? { role: { in: ADMIN_TEAM_ROLES } }
            : filter === "suspended"
              ? { status: "SUSPENDED" as const }
              : {};

    return prisma.user.findMany({
      where,
      select: { id: true, email: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async suspendUser(adminUserId: string, adminRole: UserRole, targetUserId: string) {
    const target = await prisma.user.findUniqueOrThrow({ where: { id: targetUserId } });

    if (target.role === "BRAND_OWNER") {
      await this.assertNotLastOwner(targetUserId);
    }

    const updated = await prisma.user.update({ where: { id: targetUserId }, data: { status: "SUSPENDED" } });
    await prisma.refreshToken.updateMany({ where: { userId: targetUserId, revokedAt: null }, data: { revokedAt: new Date() } });

    await this.auditService.log({
      actorId: adminUserId,
      actorRole: adminRole,
      action: "user.suspend",
      targetType: "user",
      targetId: targetUserId,
      before: { status: target.status },
      after: { status: "SUSPENDED" },
    });

    return updated;
  }

  async reinstateUser(adminUserId: string, adminRole: UserRole, targetUserId: string) {
    const target = await prisma.user.findUniqueOrThrow({ where: { id: targetUserId } });
    const updated = await prisma.user.update({ where: { id: targetUserId }, data: { status: "ACTIVE" } });

    await this.auditService.log({
      actorId: adminUserId,
      actorRole: adminRole,
      action: "user.reinstate",
      targetType: "user",
      targetId: targetUserId,
      before: { status: target.status },
      after: { status: "ACTIVE" },
    });

    return updated;
  }

  /** A brand must always have at least one owner — see docs/product/USER_ROLES.md "Edge cases". */
  private async assertNotLastOwner(userId: string) {
    const brand = await prisma.brandProfile.findUnique({ where: { userId } });
    if (!brand) return;
    const ownerCount = await prisma.user.count({ where: { role: "BRAND_OWNER", brandProfile: { id: brand.id } } });
    if (ownerCount <= 1) {
      throw new BadRequestException({ code: "LAST_OWNER", message: "A brand must always have at least one owner." });
    }
  }

  /** SUPER_ADMIN-only — see docs/admin/ADMIN_PERMISSIONS.md "Manage admin team". */
  async inviteAdmin(superAdminUserId: string, role: UserRole, email: string) {
    await this.authService.provisionAccountWithResetLink(email, role);
    await this.auditService.log({
      actorId: superAdminUserId,
      actorRole: "SUPER_ADMIN",
      action: "admin_team.invite",
      targetType: "user",
      targetId: email,
      after: { role },
    });
    return { success: true };
  }

  // ── Audit logs / security events — see docs/admin/AUDIT_LOGS.md ─────────

  async listAuditLogs(filters: { actorId?: string; targetType?: string; action?: string }, page = 1, pageSize = 50) {
    const where = {
      ...(filters.actorId ? { actorId: filters.actorId } : {}),
      ...(filters.targetType ? { targetType: filters.targetType } : {}),
      ...(filters.action ? { action: { contains: filters.action } } : {}),
    };
    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.auditLog.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total } };
  }

  /** "Security events" is the subset of audit actions that touch auth/account security — see docs/admin/AUDIT_LOGS.md. */
  async listSecurityEvents(page = 1, pageSize = 50) {
    const securityActions = ["user.suspend", "user.reinstate", "admin_team.invite", "settings.update"];
    const where = { action: { in: securityActions } };
    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.auditLog.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total } };
  }

  // ── Settings — see docs/admin/ADMIN_PANEL.md "Settings" ─────────────────

  async getSetting(key: string) {
    return prisma.systemSetting.findUnique({ where: { key } });
  }

  async updateSetting(adminUserId: string, adminRole: UserRole, key: string, value: unknown) {
    const before = await prisma.systemSetting.findUnique({ where: { key } });
    const updated = await prisma.systemSetting.upsert({
      where: { key },
      create: { key, value: value as never, updatedBy: adminUserId },
      update: { value: value as never, updatedBy: adminUserId },
    });

    await this.auditService.log({
      actorId: adminUserId,
      actorRole: adminRole,
      action: "settings.update",
      targetType: "system_setting",
      targetId: key,
      before: before ? { value: before.value } : null,
      after: { value },
    });

    return updated;
  }
}

import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import type { SessionUser } from "@clip/types";
import type { InstagramConnectionHealth, WithdrawalStatus, CampaignStatus } from "@clip/db";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { AdminService } from "./admin.service";
import { InviteAdminDto } from "./dto/invite-admin.dto";

/** /v1/admin — see docs/api/API_ENDPOINTS.md and docs/admin/ADMIN_PANEL.md. Every route here is SUPER_ADMIN/ADMIN unless noted. */
@Controller("v1/admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles("SUPER_ADMIN", "ADMIN")
  @Get("users")
  async listUsers(@Query("filter") filter: "all" | "brands" | "clippers" | "admin-team" | "suspended" = "all") {
    return this.adminService.listUsers(filter);
  }

  @Roles("SUPER_ADMIN", "ADMIN")
  @Patch("users/:id/suspend")
  async suspend(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.adminService.suspendUser(user.id, user.role, id);
  }

  @Roles("SUPER_ADMIN", "ADMIN")
  @Patch("users/:id/reinstate")
  async reinstate(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.adminService.reinstateUser(user.id, user.role, id);
  }

  @Roles("SUPER_ADMIN", "ADMIN")
  @Get("campaigns")
  async listCampaigns(@Query("status") status?: CampaignStatus) {
    return this.adminService.listCampaigns(status);
  }

  @Roles("SUPER_ADMIN", "ADMIN")
  @Get("clippers")
  async listClippers(@Query("filter") filter: "all" | "risk-review" | "verification" = "all") {
    return this.adminService.listClippers(filter);
  }

  @Roles("SUPER_ADMIN", "ADMIN")
  @Patch("clippers/:id/risk-flag")
  async setRiskFlag(@CurrentUser() user: SessionUser, @Param("id") id: string, @Body("flagged") flagged: boolean) {
    return this.adminService.setRiskFlag(user.id, user.role, id, flagged);
  }

  @Roles("SUPER_ADMIN", "ADMIN")
  @Get("instagram-accounts")
  async listInstagramAccounts(@Query("health") health?: InstagramConnectionHealth) {
    return this.adminService.listInstagramAccounts(health);
  }

  @Roles("SUPER_ADMIN", "FINANCE_ADMIN")
  @Get("withdrawals")
  async listWithdrawals(@Query("status") status?: WithdrawalStatus) {
    return this.adminService.listWithdrawals(status);
  }

  @Roles("SUPER_ADMIN", "FINANCE_ADMIN")
  @Post("withdrawals/:id/complete")
  async completeWithdrawal(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.adminService.completeWithdrawal(user.id, user.role, id);
  }

  @Roles("SUPER_ADMIN", "FINANCE_ADMIN")
  @Post("withdrawals/:id/fail")
  async failWithdrawal(@CurrentUser() user: SessionUser, @Param("id") id: string, @Body("reason") reason: string) {
    return this.adminService.failWithdrawal(user.id, user.role, id, reason);
  }

  @Roles("SUPER_ADMIN")
  @Post("admin-team/invite")
  async inviteAdmin(@CurrentUser() user: SessionUser, @Body() dto: InviteAdminDto) {
    return this.adminService.inviteAdmin(user.id, dto.role, dto.email);
  }

  @Roles("SUPER_ADMIN", "ADMIN")
  @Get("audit-logs")
  async listAuditLogs(
    @Query("actorId") actorId?: string,
    @Query("targetType") targetType?: string,
    @Query("action") action?: string,
    @Query("page") page = "1"
  ) {
    return this.adminService.listAuditLogs({ actorId, targetType, action }, Number(page));
  }

  @Roles("SUPER_ADMIN", "ADMIN")
  @Get("security-events")
  async listSecurityEvents(@Query("page") page = "1") {
    return this.adminService.listSecurityEvents(Number(page));
  }

  @Roles("SUPER_ADMIN")
  @Get("settings/:key")
  async getSetting(@Param("key") key: string) {
    return this.adminService.getSetting(key);
  }

  @Roles("SUPER_ADMIN")
  @Patch("settings/:key")
  async updateSetting(@CurrentUser() user: SessionUser, @Param("key") key: string, @Body("value") value: unknown) {
    return this.adminService.updateSetting(user.id, user.role, key, value);
  }
}

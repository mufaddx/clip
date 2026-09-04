import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import type { SessionUser } from "@clip/types";
import type { CampaignStatus } from "@clip/db";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import { CampaignsService } from "./campaigns.service";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import { UpdateCampaignDto } from "./dto/update-campaign.dto";
import { RejectCampaignDto } from "./dto/reject-campaign.dto";

/**
 * /v1/campaigns — see docs/api/API_ENDPOINTS.md and docs/campaigns/CAMPAIGN_LIFECYCLE.md.
 * Literal routes ("available", "mine") are declared before the ":id"
 * wildcard route — Nest/Express match in registration order, so a wildcard
 * declared first would swallow them.
 */
@Controller("v1/campaigns")
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  // ── Clipper side — see docs/campaigns/CREATOR_MATCHING.md ───────────────

  @Roles("CLIPPER")
  @Get("available")
  async available(@CurrentUser() user: SessionUser) {
    return this.campaignsService.listAvailableForClipper(user.id);
  }

  @Roles("CLIPPER")
  @Get("mine")
  async mine(@CurrentUser() user: SessionUser) {
    return this.campaignsService.listMyAcceptances(user.id);
  }

  // ── Brand side ────────────────────────────────────────────────────────

  // The current per-account/post rate (admin-set — see AdminController's
  // generic /v1/admin/settings/:key) so the brand's Create Campaign form
  // can show/derive a budget from a clipper-slot count without needing
  // admin access itself. Declared before the ":id" wildcard below.
  @Roles("BRAND_OWNER", "BRAND_TEAM_MEMBER")
  @Get("account-rate")
  async accountRate() {
    return { ratePerAccount: await this.campaignsService.getRatePerAccount() };
  }

  @Roles("BRAND_OWNER", "BRAND_TEAM_MEMBER")
  @RequirePermission("CAMPAIGNS_CREATE")
  @Post()
  async create(@CurrentUser() user: SessionUser, @Body() dto: CreateCampaignDto) {
    return this.campaignsService.createDraft(user.id, dto);
  }

  @Roles("BRAND_OWNER", "BRAND_TEAM_MEMBER")
  @Get()
  async list(@CurrentUser() user: SessionUser, @Query("status") status?: CampaignStatus) {
    return this.campaignsService.listForBrand(user.id, status);
  }

  // Brand sees full ownership-checked detail; a clipper or staff member
  // gets a read-only view (used for the campaign detail page before/after
  // accepting) — see CampaignsService.getForActor.
  @Roles("BRAND_OWNER", "BRAND_TEAM_MEMBER", "CLIPPER", "SUPER_ADMIN", "ADMIN", "SUPPORT", "FINANCE_ADMIN")
  @Get(":id")
  async get(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.campaignsService.getForActor(user.id, user.role, id);
  }

  @Roles("BRAND_OWNER", "BRAND_TEAM_MEMBER")
  @RequirePermission("CAMPAIGNS_EDIT")
  @Patch(":id")
  async update(@CurrentUser() user: SessionUser, @Param("id") id: string, @Body() dto: UpdateCampaignDto) {
    return this.campaignsService.updateDraft(user.id, id, dto);
  }

  @Roles("BRAND_OWNER", "BRAND_TEAM_MEMBER")
  @Get(":id/creators")
  async creators(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.campaignsService.listCreatorsForBrand(user.id, id);
  }

  @Roles("BRAND_OWNER", "BRAND_TEAM_MEMBER")
  @Post(":id/submit")
  async submit(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.campaignsService.submit(user.id, id);
  }

  // Funding moves real money — the owner always can; a team member needs
  // the CAMPAIGNS_APPROVE_BUDGET permission (PermissionsGuard skips owners
  // entirely) — see docs/users/TEAM_MEMBER_FLOW.md.
  @Roles("BRAND_OWNER", "BRAND_TEAM_MEMBER")
  @RequirePermission("CAMPAIGNS_APPROVE_BUDGET")
  @Post(":id/fund")
  async fund(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.campaignsService.fund(user.id, id);
  }

  @Roles("BRAND_OWNER", "BRAND_TEAM_MEMBER")
  @Post(":id/pause")
  async pause(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.campaignsService.pause(user.id, id);
  }

  @Roles("BRAND_OWNER", "BRAND_TEAM_MEMBER")
  @Post(":id/resume")
  async resume(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.campaignsService.resume(user.id, id);
  }

  @Roles("BRAND_OWNER")
  @Post(":id/cancel")
  async cancel(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.campaignsService.cancel(user.id, id);
  }

  @Roles("BRAND_OWNER", "BRAND_TEAM_MEMBER")
  @Post(":id/complete")
  async complete(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.campaignsService.complete(user.id, id);
  }

  // ── Admin approval queue — see docs/admin/ADMIN_PANEL.md ────────────────

  @Roles("SUPER_ADMIN", "ADMIN")
  @Post(":id/approve")
  async approve(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.campaignsService.approve(user.id, user.role, id);
  }

  @Roles("SUPER_ADMIN", "ADMIN")
  @Post(":id/reject")
  async reject(@CurrentUser() user: SessionUser, @Param("id") id: string, @Body() dto: RejectCampaignDto) {
    return this.campaignsService.reject(user.id, user.role, id, dto.reason);
  }

  @Roles("CLIPPER")
  @Post(":id/accept")
  async accept(
    @CurrentUser() user: SessionUser,
    @Param("id") id: string,
    @Body("instagramAccountId") instagramAccountId: string
  ) {
    return this.campaignsService.accept(user.id, id, instagramAccountId);
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import type { SessionUser } from "@clip/types";
import type { TeamPermission } from "@clip/db";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { BrandsService } from "./brands.service";
import { InviteTeamMemberDto } from "./dto/invite-team-member.dto";

/** /v1/brands — see docs/api/API_ENDPOINTS.md and docs/users/TEAM_MEMBER_FLOW.md. */
@Controller("v1/brands")
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Roles("BRAND_OWNER", "BRAND_TEAM_MEMBER")
  @Get("team")
  async listTeam(@CurrentUser() user: SessionUser) {
    return this.brandsService.listTeam(user.id);
  }

  // Only the owner invites by default — delegation to a team member with
  // team.invite is a later refinement.
  @Roles("BRAND_OWNER")
  @Post("team/invite")
  async invite(@CurrentUser() user: SessionUser, @Body() dto: InviteTeamMemberDto) {
    return this.brandsService.invite(user.id, dto.email, dto.permissions);
  }

  @Roles("BRAND_OWNER")
  @Patch("team/:id")
  async updatePermissions(
    @CurrentUser() user: SessionUser,
    @Param("id") id: string,
    @Body("permissions") permissions: TeamPermission[]
  ) {
    return this.brandsService.updatePermissions(user.id, id, permissions);
  }

  @Roles("BRAND_OWNER")
  @Delete("team/:id")
  async remove(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    await this.brandsService.remove(user.id, id);
    return { success: true };
  }
}

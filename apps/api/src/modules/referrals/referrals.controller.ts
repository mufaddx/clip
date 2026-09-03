import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import type { SessionUser } from "@clip/types";
import type { ReferralStatus } from "@clip/db";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { ReferralsService } from "./referrals.service";

/** /v1/referrals — see docs/api/API_ENDPOINTS.md. */
@Controller("v1/referrals")
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Roles("SUPER_ADMIN", "ADMIN", "FINANCE_ADMIN")
  @Get("all")
  async listAll(@Query("status") status?: ReferralStatus) {
    return this.referralsService.listAll(status);
  }

  @Roles("SUPER_ADMIN", "ADMIN", "FINANCE_ADMIN")
  @Patch(":id/decide")
  async decide(@Param("id") id: string, @Body("approve") approve: boolean) {
    return this.referralsService.decideFlagged(id, approve);
  }

  @Get("me")
  async me(@CurrentUser() user: SessionUser) {
    return this.referralsService.getMyReferrals(user.id);
  }
}

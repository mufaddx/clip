import { Controller, Get } from "@nestjs/common";
import type { SessionUser } from "@clip/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ReferralsService } from "./referrals.service";

/** /v1/referrals — see docs/api/API_ENDPOINTS.md. */
@Controller("v1/referrals")
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get("me")
  async me(@CurrentUser() user: SessionUser) {
    return this.referralsService.getMyReferrals(user.id);
  }
}

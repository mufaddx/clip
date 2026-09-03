import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import type { SessionUser } from "@clip/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { ModerationService } from "./moderation.service";

/** /v1/moderation — see docs/admin/MODERATION_SYSTEM.md. */
@Controller("v1/moderation")
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Roles("SUPER_ADMIN", "ADMIN", "SUPPORT")
  @Get("queue")
  async queue() {
    return this.moderationService.listQueue();
  }

  @Roles("SUPER_ADMIN", "ADMIN")
  @Post("reels/:id/decide")
  async decide(
    @CurrentUser() user: SessionUser,
    @Param("id") id: string,
    @Body("approve") approve: boolean,
    @Body("reason") reason?: string
  ) {
    return this.moderationService.decide(user.id, user.role, id, approve, reason);
  }
}

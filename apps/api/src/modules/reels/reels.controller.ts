import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import type { SessionUser } from "@clip/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { ReelsService } from "./reels.service";
import { SubmitReelDto } from "./dto/submit-reel.dto";

/** /v1/reels — see docs/api/API_ENDPOINTS.md. */
@Controller("v1/reels")
export class ReelsController {
  constructor(private readonly reelsService: ReelsService) {}

  @Roles("CLIPPER")
  @Post("submit")
  async submit(@CurrentUser() user: SessionUser, @Body() dto: SubmitReelDto) {
    return this.reelsService.submit(user.id, dto.campaignCreatorId, dto.url);
  }

  @Get(":id")
  async get(@Param("id") id: string) {
    return this.reelsService.getReel(id);
  }
}

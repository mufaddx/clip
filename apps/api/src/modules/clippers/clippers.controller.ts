import { Body, Controller, Get, Patch } from "@nestjs/common";
import type { SessionUser } from "@clip/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { ClippersService } from "./clippers.service";

/** /v1/clippers — see docs/api/API_ENDPOINTS.md. */
@Controller("v1/clippers")
export class ClippersController {
  constructor(private readonly clippersService: ClippersService) {}

  @Roles("CLIPPER")
  @Get("me")
  async getOwnProfile(@CurrentUser() user: SessionUser) {
    return this.clippersService.getOwnProfile(user.id);
  }

  @Roles("CLIPPER")
  @Patch("me")
  async updateOwnProfile(
    @CurrentUser() user: SessionUser,
    @Body() data: { displayName?: string; bio?: string; categoryIds?: string[] }
  ) {
    return this.clippersService.updateOwnProfile(user.id, data);
  }
}

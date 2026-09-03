import { Controller, Get } from "@nestjs/common";
import type { SessionUser } from "@clip/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import { AnalyticsService } from "./analytics.service";

/** /v1/analytics — see docs/api/API_ENDPOINTS.md and docs/operations/ANALYTICS_SYSTEM.md. */
@Controller("v1/analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Roles("BRAND_OWNER", "BRAND_TEAM_MEMBER")
  @RequirePermission("ANALYTICS_VIEW")
  @Get("brand")
  async brand(@CurrentUser() user: SessionUser) {
    return this.analyticsService.brandOverview(user.id);
  }

  @Roles("CLIPPER")
  @Get("clipper")
  async clipper(@CurrentUser() user: SessionUser) {
    return this.analyticsService.clipperOverview(user.id);
  }

  @Roles("SUPER_ADMIN", "ADMIN", "FINANCE_ADMIN")
  @Get("platform")
  async platform() {
    return this.analyticsService.platformOverview();
  }
}

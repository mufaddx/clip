import { BadRequestException, Body, Controller, Get, Param, Post } from "@nestjs/common";
import { getEnv } from "@clip/config";
import type { SessionUser } from "@clip/types";
import type { CampaignObjective } from "@clip/db";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { PerformanceService } from "./performance.service";
import { RecordSnapshotDto } from "./dto/record-snapshot.dto";
import { UpdatePerformanceRulesDto } from "./dto/update-rules.dto";

/** /v1/performance and /v1/metrics — see docs/api/API_ENDPOINTS.md. */
@Controller()
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  /** Dev/staging-only stand-in for the Metrics Sync Worker — see docs/performance/METRICS_ARCHITECTURE.md. */
  @Post("v1/metrics/simulate")
  async simulateSnapshot(@Body() dto: RecordSnapshotDto) {
    if (getEnv().NODE_ENV === "production") {
      throw new BadRequestException({ code: "NOT_AVAILABLE", message: "Simulated metrics are disabled in production." });
    }
    return this.performanceService.recordSnapshot(dto);
  }

  @Post("v1/performance/reels/:id/calculate")
  async calculate(@Param("id") id: string) {
    return this.performanceService.calculateForReel(id);
  }

  @Get("v1/performance/rules/:objective")
  async getRules(@Param("objective") objective: CampaignObjective) {
    return this.performanceService.getRules(objective);
  }

  @Roles("SUPER_ADMIN")
  @Post("v1/performance/rules")
  async updateRules(@CurrentUser() user: SessionUser, @Body() dto: UpdatePerformanceRulesDto) {
    return this.performanceService.updateRules(user.id, user.role, dto);
  }
}

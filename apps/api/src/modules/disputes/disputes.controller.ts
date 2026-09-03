import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import type { SessionUser } from "@clip/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { DisputesService } from "./disputes.service";
import { OpenDisputeDto } from "./dto/open-dispute.dto";
import { ResolveDisputeDto } from "./dto/resolve-dispute.dto";

/** /v1/disputes — see docs/api/API_ENDPOINTS.md and docs/operations/DISPUTE_SYSTEM.md. */
@Controller("v1/disputes")
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Roles("SUPER_ADMIN", "ADMIN", "SUPPORT", "FINANCE_ADMIN")
  @Get("all")
  async listAll() {
    return this.disputesService.listAll();
  }

  @Post()
  async open(@CurrentUser() user: SessionUser, @Body() dto: OpenDisputeDto) {
    return this.disputesService.open(user.id, dto.type, dto.targetType, dto.targetId, dto.message);
  }

  @Get()
  async listMine(@CurrentUser() user: SessionUser) {
    return this.disputesService.listMine(user.id);
  }

  @Get(":id")
  async get(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.disputesService.getDispute(user.id, user.role, id);
  }

  @Post(":id/messages")
  async addMessage(@CurrentUser() user: SessionUser, @Param("id") id: string, @Body("body") body: string) {
    return this.disputesService.addMessage(user.id, user.role, id, body);
  }

  @Roles("SUPER_ADMIN", "ADMIN", "SUPPORT", "FINANCE_ADMIN")
  @Post(":id/resolve")
  async resolve(@CurrentUser() user: SessionUser, @Param("id") id: string, @Body() dto: ResolveDisputeDto) {
    const reversal =
      dto.reversalCreatorUserId && dto.reversalReelId && dto.reversalAmount
        ? { creatorUserId: dto.reversalCreatorUserId, reelId: dto.reversalReelId, amount: dto.reversalAmount }
        : undefined;
    return this.disputesService.resolve(user.id, user.role, id, dto.upheld, dto.resolution, reversal);
  }
}

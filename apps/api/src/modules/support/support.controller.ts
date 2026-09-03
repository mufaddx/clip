import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import type { SessionUser } from "@clip/types";
import type { TicketStatus } from "@clip/db";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { SupportService } from "./support.service";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { AddMessageDto } from "./dto/add-message.dto";

/** /v1/support — see docs/api/API_ENDPOINTS.md and docs/operations/SUPPORT_SYSTEM.md. */
@Controller("v1/support")
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Roles("SUPER_ADMIN", "ADMIN", "SUPPORT")
  @Get("all")
  async listAll(@Query("status") status?: TicketStatus) {
    return this.supportService.listAll(status);
  }

  @Post()
  async create(@CurrentUser() user: SessionUser, @Body() dto: CreateTicketDto) {
    return this.supportService.createTicket(user.id, dto.category, dto.subject, dto.message);
  }

  @Get()
  async listMine(@CurrentUser() user: SessionUser) {
    return this.supportService.listMine(user.id);
  }

  @Get(":id")
  async get(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.supportService.getTicket(user.id, user.role, id);
  }

  @Post(":id/messages")
  async addMessage(@CurrentUser() user: SessionUser, @Param("id") id: string, @Body() dto: AddMessageDto) {
    return this.supportService.addMessage(user.id, user.role, id, dto.body, dto.attachments);
  }

  @Roles("SUPER_ADMIN", "ADMIN", "SUPPORT")
  @Patch(":id/status")
  async updateStatus(@Param("id") id: string, @Body("status") status: TicketStatus, @Body("assignedTo") assignedTo?: string) {
    return this.supportService.updateStatus(id, status, assignedTo);
  }
}

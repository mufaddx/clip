import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import type { SessionUser } from "@clip/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { NotificationsService } from "./notifications.service";
import { SetPreferenceDto } from "./dto/set-preference.dto";

/** /v1/notifications — see docs/api/API_ENDPOINTS.md and docs/operations/NOTIFICATION_SYSTEM.md. */
@Controller("v1/notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(@CurrentUser() user: SessionUser, @Query("unreadOnly") unreadOnly?: string) {
    return this.notificationsService.list(user.id, unreadOnly === "true");
  }

  @Get("unread-count")
  async unreadCount(@CurrentUser() user: SessionUser) {
    return { count: await this.notificationsService.unreadCount(user.id) };
  }

  @Patch(":id/read")
  async markRead(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    await this.notificationsService.markRead(user.id, id);
    return { success: true };
  }

  @Post("read-all")
  async markAllRead(@CurrentUser() user: SessionUser) {
    await this.notificationsService.markAllRead(user.id);
    return { success: true };
  }

  @Get("preferences")
  async preferences(@CurrentUser() user: SessionUser) {
    return this.notificationsService.getPreferences(user.id);
  }

  @Patch("preferences")
  async setPreference(@CurrentUser() user: SessionUser, @Body() dto: SetPreferenceDto) {
    return this.notificationsService.setPreference(user.id, dto.type, dto.inAppEnabled, dto.emailEnabled);
  }
}

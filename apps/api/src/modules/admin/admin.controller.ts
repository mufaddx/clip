import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import type { SessionUser } from "@clip/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { AdminService } from "./admin.service";
import { InviteAdminDto } from "./dto/invite-admin.dto";

/** /v1/admin — see docs/api/API_ENDPOINTS.md and docs/admin/ADMIN_PANEL.md. Every route here is SUPER_ADMIN/ADMIN unless noted. */
@Controller("v1/admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles("SUPER_ADMIN", "ADMIN")
  @Get("users")
  async listUsers(@Query("filter") filter: "all" | "brands" | "clippers" | "admin-team" | "suspended" = "all") {
    return this.adminService.listUsers(filter);
  }

  @Roles("SUPER_ADMIN", "ADMIN")
  @Patch("users/:id/suspend")
  async suspend(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.adminService.suspendUser(user.id, user.role, id);
  }

  @Roles("SUPER_ADMIN", "ADMIN")
  @Patch("users/:id/reinstate")
  async reinstate(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.adminService.reinstateUser(user.id, user.role, id);
  }

  @Roles("SUPER_ADMIN")
  @Post("admin-team/invite")
  async inviteAdmin(@CurrentUser() user: SessionUser, @Body() dto: InviteAdminDto) {
    return this.adminService.inviteAdmin(user.id, dto.role, dto.email);
  }

  @Roles("SUPER_ADMIN")
  @Get("settings/:key")
  async getSetting(@Param("key") key: string) {
    return this.adminService.getSetting(key);
  }

  @Roles("SUPER_ADMIN")
  @Patch("settings/:key")
  async updateSetting(@CurrentUser() user: SessionUser, @Param("key") key: string, @Body("value") value: unknown) {
    return this.adminService.updateSetting(user.id, user.role, key, value);
  }
}

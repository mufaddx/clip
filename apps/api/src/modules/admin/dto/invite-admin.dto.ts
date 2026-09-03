import { IsEmail, IsIn } from "class-validator";
import type { UserRole } from "@clip/types";

const ADMIN_SIDE_ROLES: UserRole[] = ["ADMIN", "SUPPORT", "FINANCE_ADMIN"]; // SUPER_ADMIN is never granted via this flow

export class InviteAdminDto {
  @IsEmail()
  email!: string;

  @IsIn(ADMIN_SIDE_ROLES)
  role!: UserRole;
}

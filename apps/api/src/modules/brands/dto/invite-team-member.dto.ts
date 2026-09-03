import { IsArray, IsEmail, IsIn } from "class-validator";
import type { TeamPermission } from "@clip/db";

const PERMISSIONS: TeamPermission[] = [
  "CAMPAIGNS_VIEW",
  "CAMPAIGNS_CREATE",
  "CAMPAIGNS_EDIT",
  "CAMPAIGNS_APPROVE_BUDGET",
  "ANALYTICS_VIEW",
  "REPORTS_VIEW",
  "WALLET_VIEW",
  "TEAM_INVITE",
];

export class InviteTeamMemberDto {
  @IsEmail()
  email!: string;

  @IsArray()
  @IsIn(PERMISSIONS, { each: true })
  permissions!: TeamPermission[];
}

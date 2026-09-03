import { ForbiddenException, Injectable } from "@nestjs/common";
import { prisma, type TeamPermission } from "@clip/db";
import { AuthService } from "../auth/auth.service";

/**
 * Brand team management — see docs/users/TEAM_MEMBER_FLOW.md. Only a
 * BRAND_OWNER (or a delegate with team.invite, not yet enforced at this
 * granularity) reaches these routes — see the controller's @Roles.
 */
@Injectable()
export class BrandsService {
  constructor(private readonly authService: AuthService) {}

  private async getOwnBrand(ownerUserId: string) {
    const brand = await prisma.brandProfile.findUnique({ where: { userId: ownerUserId } });
    if (!brand) throw new ForbiddenException({ code: "NOT_A_BRAND", message: "This account has no brand profile." });
    return brand;
  }

  async listTeam(ownerUserId: string) {
    const brand = await this.getOwnBrand(ownerUserId);
    return prisma.teamMember.findMany({
      where: { brandId: brand.id, removedAt: null },
      include: { user: { select: { email: true, status: true } } },
    });
  }

  async invite(ownerUserId: string, email: string, permissions: TeamPermission[]) {
    const brand = await this.getOwnBrand(ownerUserId);

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      await this.authService.provisionAccountWithResetLink(email, "BRAND_TEAM_MEMBER");
      user = await prisma.user.findUniqueOrThrow({ where: { email } });
    }

    return prisma.teamMember.upsert({
      where: { brandId_userId: { brandId: brand.id, userId: user.id } },
      create: { brandId: brand.id, userId: user.id, permissions },
      update: { permissions, removedAt: null },
    });
  }

  async updatePermissions(ownerUserId: string, teamMemberId: string, permissions: TeamPermission[]) {
    const brand = await this.getOwnBrand(ownerUserId);
    const member = await prisma.teamMember.findUniqueOrThrow({ where: { id: teamMemberId } });
    if (member.brandId !== brand.id) throw new ForbiddenException({ code: "FORBIDDEN", message: "Not your team member." });
    return prisma.teamMember.update({ where: { id: teamMemberId }, data: { permissions } });
  }

  /** Immediately revokes access — not just on next login. See docs/users/TEAM_MEMBER_FLOW.md "Removal". */
  async remove(ownerUserId: string, teamMemberId: string) {
    const brand = await this.getOwnBrand(ownerUserId);
    const member = await prisma.teamMember.findUniqueOrThrow({ where: { id: teamMemberId } });
    if (member.brandId !== brand.id) throw new ForbiddenException({ code: "FORBIDDEN", message: "Not your team member." });

    await prisma.$transaction([
      prisma.teamMember.update({ where: { id: teamMemberId }, data: { removedAt: new Date() } }),
      prisma.refreshToken.updateMany({ where: { userId: member.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
  }
}

import { ForbiddenException, Injectable } from "@nestjs/common";
import { prisma } from "@clip/db";

/**
 * Self-profile management for clippers — see docs/users/ONBOARDING_FLOW.md
 * "Clipper onboarding steps" (Basic Profile, Content Categories).
 * Cross-role visibility (a brand or admin viewing a clipper's trust score)
 * lives in AdminService.listClippers / CampaignsService's matching logic.
 */
@Injectable()
export class ClippersService {
  async getOwnProfile(userId: string) {
    const creator = await prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) throw new ForbiddenException({ code: "NOT_A_CLIPPER", message: "This account has no creator profile." });
    return creator;
  }

  async updateOwnProfile(userId: string, data: { displayName?: string; bio?: string; categoryIds?: string[] }) {
    const creator = await this.getOwnProfile(userId);
    return prisma.creatorProfile.update({
      where: { id: creator.id },
      data: {
        displayName: data.displayName,
        bio: data.bio,
        categories: data.categoryIds ? { deleteMany: {}, create: data.categoryIds.map((categoryId) => ({ categoryId })) } : undefined,
      },
    });
  }
}

import { Body, Controller, Get, Patch } from "@nestjs/common";
import { prisma } from "@clip/db";
import type { SessionUser } from "@clip/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ReferralsService } from "../referrals/referrals.service";
import { UpdateOnboardingStatusDto } from "./dto/update-onboarding-status.dto";

/** /v1/users — see docs/api/API_ENDPOINTS.md. Every route here is self-scoped only. */
@Controller("v1/users")
export class UsersController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get("me")
  async me(@CurrentUser() user: SessionUser) {
    return prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        onboardingComplete: true,
        onboardingStep: true,
        referralCode: true,
        createdAt: true,
      },
    });
  }

  @Get("me/onboarding-status")
  async onboardingStatus(@CurrentUser() user: SessionUser) {
    return prisma.user.findUnique({
      where: { id: user.id },
      select: { onboardingComplete: true, onboardingStep: true },
    });
  }

  @Patch("me/onboarding-status")
  async updateOnboardingStatus(
    @CurrentUser() user: SessionUser,
    @Body() dto: UpdateOnboardingStatusDto
  ) {
    // Progress is persisted after every step, not just at the end — see
    // docs/users/ONBOARDING_FLOW.md "Progress persistence".
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { onboardingStep: dto.step, onboardingComplete: dto.complete ?? false },
      select: { onboardingComplete: true, onboardingStep: true },
    });

    // Onboarding completion is this v1's referral eligibility milestone —
    // see docs/referrals/REFERRAL_RULES.md "Eligibility rules".
    if (updated.onboardingComplete) {
      await this.referralsService.evaluateEligibility(user.id);
    }

    return updated;
  }
}

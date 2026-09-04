import { SectionHeading } from "../../../components/section-heading";
import { FeatureRow } from "../../../components/feature-row";
import { IconGift, IconUsers, IconShield, IconClock } from "../../../components/icons";

// /referral-program — reflects the real default rules in
// ReferralsService.getRules() (₹500 fixed reward, ₹5,000 lifetime cap per
// referrer, 90-day pending window, 20-referral cap) — all admin-configurable
// via the referral_rules SystemSetting, so worded as defaults rather than
// permanent numbers. See docs/referrals/REFERRAL_RULES.md.
export default function ReferralProgramPage() {
  return (
    <main>
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <SectionHeading
          eyebrow="Referral program"
          title="Invite someone, earn when they get going"
          description="Available to both brands and clippers — share your invite link from your dashboard."
        />
      </section>

      <section className="border-t border-white/10 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 sm:grid-cols-2">
            <FeatureRow
              icon={<IconGift className="h-5 w-5" />}
              title="₹500 per successful referral (default)"
              description="Credited to your wallet once the person you referred completes onboarding and clears fraud screening. The exact amount is admin-configurable and shown in your dashboard."
            />
            <FeatureRow
              icon={<IconClock className="h-5 w-5" />}
              title="90-day window"
              description="A referral has 90 days from signup to become eligible before it expires — plenty of time for a normal onboarding."
            />
            <FeatureRow
              icon={<IconUsers className="h-5 w-5" />}
              title="Capped, not unlimited"
              description="Rewards are capped per referrer (20 rewarded referrals, ₹5,000 lifetime, by default) to keep the program sustainable."
            />
            <FeatureRow
              icon={<IconShield className="h-5 w-5" />}
              title="Screened for self-referral"
              description="Every referral is checked for obvious self-referral patterns before a reward is issued. Anything flagged goes to a human for review — never auto-denied, never auto-paid."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

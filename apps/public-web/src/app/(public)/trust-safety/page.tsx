import { SectionHeading } from "../../../components/section-heading";
import { FeatureRow } from "../../../components/feature-row";
import { IconShield, IconCheckCircle, IconLock, IconUsers } from "../../../components/icons";

// /trust-safety — genuine mechanisms that exist in the codebase, described
// non-technically. See CampaignsService.eligibleCampaignsWhere (trust-score
// gate), ReferralsService.detectFraud, and the admin approval queue.
export default function TrustSafetyPage() {
  return (
    <main>
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <SectionHeading
          eyebrow="Trust & safety"
          title="Real accounts, real performance"
          description="Every part of the loop — accounts, campaigns, and performance — is checked before money moves."
        />
      </section>

      <section className="border-t border-white/10 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 sm:grid-cols-2">
            <FeatureRow
              icon={<IconCheckCircle className="h-5 w-5" />}
              title="Campaigns are human-approved"
              description="Every brand campaign goes through the admin panel for review before it becomes visible to clippers — nothing goes live automatically."
            />
            <FeatureRow
              icon={<IconShield className="h-5 w-5" />}
              title="Performance verified via Meta's API"
              description="Views, reach, and engagement are pulled from Instagram's official Graph API, never scraped or self-reported — you don't pay for or get paid on numbers no one can check."
            />
            <FeatureRow
              icon={<IconUsers className="h-5 w-5" />}
              title="Trust score gates high-value campaigns"
              description="Clippers build a trust score from their history on the platform; campaigns can set a minimum trust score as an eligibility requirement."
            />
            <FeatureRow
              icon={<IconLock className="h-5 w-5" />}
              title="Fraud is flagged, not auto-punished"
              description="Suspicious patterns — like self-referrals — are held for a human to review rather than automatically denied or banned. See our Acceptable Use policy for what's not allowed."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

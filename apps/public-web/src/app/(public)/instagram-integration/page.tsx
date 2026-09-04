import { SectionHeading } from "../../../components/section-heading";
import { FeatureRow } from "../../../components/feature-row";
import { IconInstagram, IconShield, IconClock, IconLink } from "../../../components/icons";

// /instagram-integration — a dedicated deep page backing the homepage's
// "Powered by Meta's Instagram API" badge, so the claim it makes is
// actually explained somewhere rather than just asserted. Factual only:
// official Graph API, explicit authorization, a periodic sync worker — no
// "Verified by Meta" language (see site-footer.tsx comment for why).
export default function InstagramIntegrationPage() {
  return (
    <main>
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <SectionHeading
          eyebrow="Instagram integration"
          title="Built on Instagram's official Graph API"
          description="Not a browser extension, not scraping — a real, authorized integration with Meta's own platform."
        />
      </section>

      <section className="border-t border-white/10 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 sm:grid-cols-2">
            <FeatureRow
              icon={<IconLink className="h-5 w-5" />}
              title="You connect and authorize your account"
              description="Clippers link their Instagram account through Meta's own authorization flow — Vidlix never asks for or stores your Instagram password."
            />
            <FeatureRow
              icon={<IconInstagram className="h-5 w-5" />}
              title="Official Graph API only"
              description="All post, view, reach, and engagement data comes from the Instagram Graph API — the same API Meta provides to businesses — never scraped from the app or web."
            />
            <FeatureRow
              icon={<IconClock className="h-5 w-5" />}
              title="Synced automatically in the background"
              description="A background worker periodically re-syncs your connected content's performance so campaign results and your earnings stay current without you doing anything."
            />
            <FeatureRow
              icon={<IconShield className="h-5 w-5" />}
              title="Standard app review, not a Meta certification"
              description="Vidlix's Instagram integration went through Meta's standard API app review — that's real, but it isn't the same as a formal Meta business verification or endorsement, and we don't claim otherwise."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

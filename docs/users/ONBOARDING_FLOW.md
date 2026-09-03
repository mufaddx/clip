# Onboarding Flow

## Purpose

The signup-to-first-dashboard path, designed to be interruptible and resumable — a user who closes the tab partway through must be able to pick up where they left off on next login, not restart.

## Signup entry point

`domain.in/signup` first asks **"How do you want to use CLIP?"** with two options: *I am a Brand* / *I am a Clipper*. This choice sets the account's role family and cannot be changed by the user afterward (an admin can convert/correct it if genuinely necessary — see [`../product/USER_ROLES.md`](../product/USER_ROLES.md)).

## Progress persistence

Each account has an `onboarding_status` (current step, completed steps) persisted after every step submission — not just at the end. On login, if `onboarding_status.completed = false`, the user is routed to their next incomplete step instead of the dashboard (see [`AUTHENTICATION_FLOW.md`](AUTHENTICATION_FLOW.md)).

## Brand onboarding steps

1. **Account Details** — name, email (pre-filled if from signup), password, phone (optional).
2. **Organization Details** — company name, website, size.
3. **Industry and Category** — the categories this brand typically wants content in (feeds creator matching later).
4. **Team Setup** — optionally invite team members now (skippable, can be done later from `brand.domain.in/team`).
5. **Review** — summary screen, "Go to Dashboard" completes onboarding.

## Clipper onboarding steps

1. **Basic Profile** — display name, bio, avatar.
2. **Content Categories** — categories the creator makes/wants content in (feeds matching, see [`../campaigns/CREATOR_MATCHING.md`](../campaigns/CREATOR_MATCHING.md)).
3. **Creator Preferences** — campaign types of interest, availability.
4. **Instagram Connection** — connect via Meta OAuth (see [`../architecture/META_INSTAGRAM_INTEGRATION.md`](../architecture/META_INSTAGRAM_INTEGRATION.md)); skippable here, but required before accepting a campaign.
5. **Review** — summary, "Go to Dashboard" completes onboarding.

## Progress UI

A horizontal stepper (desktop/tablet) or compact progress bar with "Step X of Y" (mobile, per [`../ui-ux/RESPONSIVE_DESIGN.md`](../ui-ux/RESPONSIVE_DESIGN.md)) is always visible during the wizard. Each step's "Back" is non-destructive (prior answers are preserved).

## Edge cases

- Email verification is required before onboarding can be marked complete, but does not block starting the wizard — a user can fill in profile details while a verification email is in flight.
- Abandoning onboarding entirely (no login for an extended period) does not delete the account; it simply remains incomplete and unreachable dashboards stay gated.
- Skipping Instagram connection during clipper onboarding is allowed, but the "Accept Campaign" action is blocked with a prompt to connect first — this is enforced server-side, not just hidden in the UI.

## Related documents

[`AUTHENTICATION_FLOW.md`](AUTHENTICATION_FLOW.md), [`BRAND_USER_FLOW.md`](BRAND_USER_FLOW.md), [`CLIPPER_USER_FLOW.md`](CLIPPER_USER_FLOW.md), [`../ui-ux/COMPONENT_LIBRARY.md`](../ui-ux/COMPONENT_LIBRARY.md) (`StepWizard`).

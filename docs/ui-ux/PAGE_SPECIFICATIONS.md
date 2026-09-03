# Page Specifications

Canonical list of every route across all four apps, with what each page must contain. This is the checklist a page implementation is reviewed against.

## Public website (`domain.in`)

| Route | Must contain |
|---|---|
| `/` | Hero (headline, subheadline, dual CTA, product preview), How CLIP Works, For Brands, For Clippers, Campaign Workflow, Performance Tracking, Creator Network, Analytics Preview, Referral Program, Security & Trust, FAQ, final CTA, Footer |
| `/about` | Company story, mission, team (optional) |
| `/how-it-works` | Expanded brand + clipper flow diagrams |
| `/for-brands` | Brand-focused pitch, feature highlights, CTA to signup |
| `/for-clippers` | Clipper-focused pitch, earnings potential framing, CTA to signup |
| `/categories` | Content category list clippers/campaigns are organized by |
| `/pricing` | Fee structure explanation (platform fee, no hidden costs) |
| `/faq` | Accordion of common questions per role |
| `/contact` | Contact form → support ticket creation |
| `/privacy`, `/terms` | Legal text |
| `/login` | Email/password form, forgot-password link, signup link |
| `/signup` | Role selection ("I am a Brand" / "I am a Clipper") → routes into the matching onboarding wizard |

## Clipper app (`clipper.domain.in`)

`/dashboard` (see [`DASHBOARD_LAYOUTS.md`](DASHBOARD_LAYOUTS.md)) · `/campaigns/{recommended,available,invited,active,submitted,tracking,completed}` (filtered list + campaign card grid) · `/campaigns/[id]` (Overview, Instructions, Content Assets, Requirements, Publishing Rules, Submission, Performance, Earnings, Activity tabs) · `/instagram` (connected accounts list + connect CTA, per-account performance) · `/analytics` (cross-campaign performance trends) · `/earnings` (earnings history, breakdown by campaign) · `/wallet` (balance buckets, ledger) · `/withdrawals` (request form, history, status) · `/referrals` (code/link, stats, reward history) · `/notifications` (full history, preferences) · `/support` (ticket list + create) · `/profile`, `/settings`.

## Brand app (`brand.domain.in`)

`/dashboard` · `/campaigns` (status-filtered list) · `/campaigns/create` (6-step wizard, see [`../campaigns/CAMPAIGN_CREATION_FLOW.md`](../campaigns/CAMPAIGN_CREATION_FLOW.md)) · `/campaigns/[id]` (status, budget, participants, performance, activity) · `/analytics` · `/creators` (creator performance across the brand's campaigns) · `/wallet/{overview,add-funds,transactions}` · `/billing/{payments,invoices,refunds}` · `/reports` (exportable campaign result reports) · `/team` (members list, invite, permission editing) · `/notifications` · `/support` · `/profile`, `/settings`.

## Admin app (`admin.domain.in`)

`/dashboard` (see [`../admin/ADMIN_PANEL.md`](../admin/ADMIN_PANEL.md)) · `/users/{all,brands,clippers,admin-team,suspended}` · `/campaigns/{all,pending-approval,active,paused,completed,rejected}` · `/clippers/{all,verification,performance,risk-review}` · `/instagram/{connected-accounts,connection-health,errors}` · `/performance/{overview,metric-tracking,qualified-performance,suspicious-activity}` · `/finance/{platform-wallet,payments,earnings,withdrawals,refunds,transactions}` · `/referrals/{overview,referrals,rewards,rules}` · `/support` · `/disputes` · `/moderation` · `/reports` · `/notifications` · `/settings` · `/security/{audit-logs,security-events}`.

## Cross-app requirement

Every page listed here must implement the four states from [`EMPTY_STATES.md`](EMPTY_STATES.md), [`LOADING_STATES.md`](LOADING_STATES.md), [`ERROR_STATES.md`](ERROR_STATES.md), and a permission-denied fallback (see [`../architecture/SECURITY_ARCHITECTURE.md`](../architecture/SECURITY_ARCHITECTURE.md)) — a page is not complete with only its happy-path implemented.

## Related documents

[`NAVIGATION_ARCHITECTURE.md`](NAVIGATION_ARCHITECTURE.md), [`DASHBOARD_LAYOUTS.md`](DASHBOARD_LAYOUTS.md).

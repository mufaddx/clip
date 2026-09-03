# Qualified Performance

## Purpose

The number that actually determines campaign success and creator earnings — a configurable composite of raw metrics, compliance, and reliability signals, never a direct pass-through of raw views. This is the output of the calculation engine described in [`PERFORMANCE_SCORING.md`](PERFORMANCE_SCORING.md).

## Preconditions

A submission only produces qualified performance once it has **both**:

1. A `metric_snapshots` row (see [`METRIC_SNAPSHOTS.md`](METRIC_SNAPSHOTS.md)), and
2. A passed rule validation (`VERIFIED` status from [`../campaigns/REEL_VERIFICATION.md`](../campaigns/REEL_VERIFICATION.md)).

A reel that fails verification contributes **zero** qualified performance regardless of how high its raw numbers are — this is a hard rule, not a weighting that merely reduces the score (see [`../product/BUSINESS_RULES.md`](../product/BUSINESS_RULES.md)).

## Configurable factors

Weighted and combined per the campaign's objective type ([`../campaigns/CAMPAIGN_CREATION_FLOW.md`](../campaigns/CAMPAIGN_CREATION_FLOW.md) Step 4), sourced from `performance_rules`:

- **Watch Quality** — completion/retention signal where watch metrics are available.
- **Engagement Quality** — engagement rate relative to reach/views, not raw counts alone (protects against reach-heavy but low-engagement content scoring artificially high).
- **Reach Quality** — how genuinely distributed the reach was (e.g., discouraging patterns consistent with purchased/bot engagement).
- **Campaign Compliance** — how fully the reel met the campaign's publishing rules beyond the pass/fail verification gate (e.g., partial hashtag/mention compliance where the rule allows partial credit).
- **Historical Reliability** — the clipper's track record (feeds the same trust score used in [`../campaigns/CREATOR_MATCHING.md`](../campaigns/CREATOR_MATCHING.md)).
- **Risk Signals** — anomaly detection output; a flagged reel's qualified performance is held pending review rather than zeroed outright (see Risk Review below).

Formulas/weights are never hardcoded in application code — they live in `performance_rules`, editable by a `SUPER_ADMIN` from `admin.domain.in/performance/qualified-performance`, and are **versioned**: every calculation records which rule version produced it, so a later formula change doesn't retroactively alter historical numbers unless an explicit recalculation is run.

## Risk review

A reel/account whose metric trajectory is statistically inconsistent with its history (e.g., an implausible view spike) is flagged `RISK_REVIEW` — its qualified performance calculation is held, not silently zeroed or silently paid, pending an admin decision (`admin.domain.in/performance/suspicious-activity`, `admin.domain.in/clippers/risk-review`). No automatic permanent penalty is applied from an automated flag alone.

## Downstream use

Qualified performance is the input to [`../finance/CREATOR_EARNINGS.md`](../finance/CREATOR_EARNINGS.md) and the primary metric shown on brand campaign dashboards ([`../ui-ux/DASHBOARD_LAYOUTS.md`](../ui-ux/DASHBOARD_LAYOUTS.md)).

## Related documents

[`PERFORMANCE_SCORING.md`](PERFORMANCE_SCORING.md), [`METRIC_SNAPSHOTS.md`](METRIC_SNAPSHOTS.md), [`../campaigns/CREATOR_MATCHING.md`](../campaigns/CREATOR_MATCHING.md), [`../finance/CREATOR_EARNINGS.md`](../finance/CREATOR_EARNINGS.md).

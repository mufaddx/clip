# Campaign Lifecycle

## State machine

```
DRAFT ──submit──▶ SUBMITTED ──(admin queue)──▶ PENDING_REVIEW
                                                    │
                                     ┌──approve──┐  │  └──reject(reason)──▶ REJECTED
                                     ▼           
                                 APPROVED ──fund (lock budget)──▶ FUNDED ──auto──▶ LIVE
                                                                                     │
                                                              ┌───pause────┐         │
                                                              ▼            │         │
                                                            PAUSED ◀───────┘◀────────┘
                                                              │  resume
                                                              └──────────▶ LIVE
                                                                            │
                                                          end condition met │
                                                                            ▼
                                                                       COMPLETED

Any of DRAFT/SUBMITTED/PENDING_REVIEW/APPROVED/FUNDED/LIVE/PAUSED ──cancel──▶ CANCELLED
LIVE/PAUSED ──tracking window fully lapses with no activity──▶ EXPIRED
```

## Transition rules

| Transition | Guard |
|---|---|
| `DRAFT → SUBMITTED` | All 6 wizard steps validated (see [`CAMPAIGN_CREATION_FLOW.md`](CAMPAIGN_CREATION_FLOW.md)) |
| `SUBMITTED → PENDING_REVIEW` | Automatic on admin queue pickup (no user action) |
| `PENDING_REVIEW → APPROVED` | Admin approval, requires no reason |
| `PENDING_REVIEW → REJECTED` | Admin rejection, **requires** a reason string, visible to the brand |
| `APPROVED → FUNDED` | `locked_budget == total_budget` in the brand wallet (see [`../finance/WALLET_SYSTEM.md`](../finance/WALLET_SYSTEM.md)) |
| `FUNDED → LIVE` | Automatic once funded, no separate action |
| `LIVE → PAUSED` | Brand-initiated; blocks new `campaign_creators` acceptances; existing accepted/tracking reels continue tracking |
| `PAUSED → LIVE` | Brand-initiated resume |
| `LIVE/PAUSED → COMPLETED` | End condition met: budget exhausted, end date reached, or brand manually completes |
| `* → CANCELLED` | Brand or admin initiated; unspent locked budget is released back to available wallet balance (see [`../finance/REFUND_SYSTEM.md`](../finance/REFUND_SYSTEM.md)) |
| `LIVE/PAUSED → EXPIRED` | No creator activity through the full tracking window and no manual completion — a safety net, not the primary end path |

## Invariants

- A campaign never skips `PENDING_REVIEW` — even a `SUPER_ADMIN`-created campaign passes through the same queue for audit-trail consistency, though it may be auto-assigned to that admin.
- Budget can only be locked (moving toward `FUNDED`) while in `APPROVED` — funding cannot happen on a still-`PENDING_REVIEW` or already-`REJECTED` campaign.
- Changing campaign objective type or creator requirements after the first `campaign_creators` acceptance is blocked — a brand wanting different rules creates a new campaign.

## Related documents

[`CAMPAIGN_SYSTEM.md`](CAMPAIGN_SYSTEM.md), [`CAMPAIGN_RULES.md`](CAMPAIGN_RULES.md), [`../finance/WALLET_SYSTEM.md`](../finance/WALLET_SYSTEM.md), [`../admin/ADMIN_PANEL.md`](../admin/ADMIN_PANEL.md).

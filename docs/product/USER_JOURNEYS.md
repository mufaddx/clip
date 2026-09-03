# User Journeys

## Brand journey

```
Visit domain.in → Signup ("I am a Brand") → Verify email
  → Brand onboarding (account, org, industry, team, review)
  → Redirected to brand.domain.in/dashboard (empty state)
  → Create Campaign wizard → Submit for review
  → Admin approves → Add funds to wallet → Campaign auto-locks budget → Goes LIVE
  → Clippers accept and publish → Brand watches Creator Performance in real time
  → Campaign completes or brand pauses/extends
  → Brand reviews Reports, exports results
```

Key decision points: funding gate before LIVE, ability to pause without losing locked (unspent) budget, team member invitations at any point after org setup.

## Clipper journey

```
Visit domain.in → Signup ("I am a Clipper") → Verify email
  → Clipper onboarding (profile, categories, preferences, Instagram connect, review)
  → Redirected to clipper.domain.in/dashboard (empty state, Recommended Campaigns populated once matching has data)
  → Browse Available/Recommended campaigns → Accept a campaign
  → Read requirements/instructions → Publish content on own Instagram
  → Submit reel URL (or platform auto-detects it) → Verification
  → Performance tracked over the campaign's tracking window
  → Qualified Performance computed → Earnings posted to wallet (Pending → Available)
  → Withdraw to bank/payment method
```

Key decision points: Instagram connection is required before a campaign can be accepted (not before browsing), submission must pass rule validation before it counts toward performance, earnings move from Pending to Available only after the campaign's verification window closes.

## Admin journey

```
Admin invited by Super Admin → Sets password → Logs in at domain.in
  → Redirected to admin.domain.in/dashboard
  → Reviews Pending Approval campaigns → Approves/Rejects with reason
  → Monitors Performance/Finance/Referral queues for risk flags
  → Handles Support tickets and Disputes
  → Every action recorded to Audit Logs
```

## Cross-role touchpoints

- **Campaign approval**: Brand submits → Admin approves/rejects (with reason, visible to the brand) → only then can funding/launch proceed.
- **Disputes**: either a Brand or a Clipper can open a dispute tied to a campaign/reel/payment; Support/Admin mediates; resolution can adjust a ledger entry (always through a compensating transaction, never a raw edit).
- **Referral rewards**: a Clipper or Brand refers a new signup → reward is provisional until the referred account passes eligibility + fraud checks → Finance Admin queue reviews flagged cases.

## Related documents

[`users/BRAND_USER_FLOW.md`](../users/BRAND_USER_FLOW.md), [`users/CLIPPER_USER_FLOW.md`](../users/CLIPPER_USER_FLOW.md), [`users/ADMIN_USER_FLOW.md`](../users/ADMIN_USER_FLOW.md), [`users/TEAM_MEMBER_FLOW.md`](../users/TEAM_MEMBER_FLOW.md) go step-by-step through each journey's screens and states.

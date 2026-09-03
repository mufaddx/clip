# Notification System

## Purpose

Keeps users informed of state changes relevant to them (campaign approval, earnings posted, withdrawal status, disputes, referral rewards) across in-app and email channels, with room to add push later without a redesign.

## Channels

- **In-app** — the notification bell + `/notifications` history page in every dashboard app (see [`../ui-ux/NAVIGATION_ARCHITECTURE.md`](../ui-ux/NAVIGATION_ARCHITECTURE.md)).
- **Email** — transactional email via the configured provider (`EMAIL_PROVIDER_API_KEY`), for events a user should see even if not currently logged in (campaign approval/rejection, withdrawal completed, dispute resolution, password reset).
- **Push (future)** — the notification data model is channel-agnostic so a push channel is an additive delivery target later, not a schema change.

## Data model

```
notifications: id, user_id, type, title, body, data (JSON, e.g. { campaignId }),
               read_at (nullable), created_at
notification_preferences: user_id, type, in_app_enabled, email_enabled
```

## Generation

Any service that produces a notable event enqueues a Notification Worker job (see [`../architecture/BACKGROUND_JOBS.md`](../architecture/BACKGROUND_JOBS.md)) rather than sending inline — this keeps a slow email provider from blocking the triggering request (e.g., approving a campaign shouldn't wait on an email send to return).

## Notable event types (non-exhaustive)

Campaign approved/rejected, campaign funded, campaign completed, reel verified/rejected, earnings posted (pending and available), withdrawal status change, dispute opened/resolved, referral reward issued, support ticket reply, team invitation received.

## User control

`/notifications` (or `/settings/notifications`) lets a user toggle `email_enabled` per notification type independent of `in_app_enabled` — in-app notifications for account-security-relevant events (password changed, new device login) cannot be fully disabled, only email can be adjusted for those.

## Unread count

The bell's unread badge is a fast count query (`WHERE read_at IS NULL`) with an index on `(user_id, read_at)`; marking as read is a per-notification or bulk "mark all read" action.

## Related documents

[`../architecture/BACKGROUND_JOBS.md`](../architecture/BACKGROUND_JOBS.md), [`../ui-ux/COMPONENT_LIBRARY.md`](../ui-ux/COMPONENT_LIBRARY.md) (`NotificationBell`).

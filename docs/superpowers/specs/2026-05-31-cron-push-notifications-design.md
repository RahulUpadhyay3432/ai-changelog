# Cron 4x Daily + Push Notifications — Design Spec

**Date:** 2026-05-31  
**Status:** Approved  
**Skills applied:** dpdp-compliance, product-analytics

---

## Problem

Kapyn's ingestion pipeline runs once daily at midnight UTC. By end of day, content is 20+ hours stale. Pull-to-refresh works mechanically but finds nothing new. Users have no daily trigger to return — the habit loop is broken at the **trigger** step.

---

## Goals

1. Content refreshed 4x daily — pull-to-refresh always finds new stories
2. One optional morning notification per day — habit trigger for users who opt in
3. No spam, no forced opt-in, aligned with Kapyn's calm positioning

---

## Out of scope

- Category-specific notifications (v2)
- Notification preferences UI (v2)
- Evening / breaking-news notifications
- Firebase or third-party push services

---

## Feature 1: Cron 4x Daily via GitHub Actions

### Why GitHub Actions

Vercel Hobby plan limits cron to once per day. GitHub Actions is free, lives in the repo, is versioned, requires no new accounts. The existing `/api/news/fetch` route handles all deduplication via `source_url` UNIQUE — re-running it is safe.

### Schedule

`0 2,8,14,20 * * *` UTC → 7:30 AM / 1:30 PM / 7:30 PM / 1:30 AM IST

The 02:00 UTC run is the "morning run" — content ready before users wake up. This is also the run that fires push notifications (see Feature 2).

### New file

`.github/workflows/fetch-news.yml`

```yaml
name: Fetch News (4x daily)

on:
  schedule:
    - cron: "0 2,8,14,20 * * *"
  workflow_dispatch:  # allow manual trigger from GitHub UI

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger news fetch
        run: |
          curl -f -s -X GET \
            -H "x-cron-secret: ${{ secrets.CRON_SECRET }}" \
            "https://kapyn.app/api/news/fetch" \
            | jq .
```

### GitHub secret required

`CRON_SECRET` — same value as the `CRON_SECRET` Vercel environment variable. Set at: GitHub repo → Settings → Secrets and variables → Actions → New repository secret.

### Existing Vercel cron

`vercel.json` stays unchanged. Its `0 0 * * *` schedule becomes a redundant fallback. No harm.

---

## Feature 2: Push Notifications

### Architecture overview

```
User taps [Enable] on CompletionCard
  → browser asks permission
  → PushManager.subscribe(VAPID_PUBLIC_KEY)
  → POST /api/push/subscribe → Supabase push_subscriptions

GitHub Actions 02:00 UTC
  → GET /api/news/fetch
  → pipeline runs, inserts N new items
  → if N > 0 AND hour == 2 UTC: send morning notification
    → fetch all rows from push_subscriptions
    → web-push sends to each endpoint
    → expired subscriptions auto-deleted on 410/404 response

User taps notification
  → browser opens kapyn.app
  → service worker handles click → routes to /
```

### A. VAPID keys

Generate once:
```bash
npx web-push generate-vapid-keys
```

Four new environment variables:

| Variable | Where | Notes |
|---|---|---|
| `VAPID_PUBLIC_KEY` | Server | Used when sending |
| `VAPID_PRIVATE_KEY` | Server | Secret — never expose |
| `VAPID_SUBJECT` | Server | `mailto:privacy@kapyn.app` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Client | Same as `VAPID_PUBLIC_KEY`, exposed to browser |

### B. Supabase migration

```sql
CREATE TABLE push_subscriptions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint     text        UNIQUE NOT NULL,
  p256dh       text        NOT NULL,
  auth         text        NOT NULL,
  consented_at timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);
```

`endpoint` is the browser-assigned push URL (unique per browser/device). `p256dh` and `auth` are encryption keys from the browser's `PushSubscription` object.

**DPDP note:** `endpoint` uniquely identifies a device. This is personal data under India DPDP Act 2023. Consent is captured via explicit opt-in (the [Enable] button). `consented_at` records the timestamp. Deletion is available via unsubscribe.

### C. Service worker (`public/sw.js`)

Handles two events:

**`push`** — receives notification payload, shows it:
```js
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'Kapyn', body: 'New dispatches available' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/api/icon/192',
      badge: '/api/icon/192',
      tag: 'kapyn-briefing',       // replaces prior notification, no stacking
      data: { url: data.url ?? '/' },
    })
  );
});
```

**`notificationclick`** — opens or focuses Kapyn:
```js
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('kapyn.app') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(event.notification.data.url);
    })
  );
});
```

### D. API routes

**`POST /api/push/subscribe`**
- Body: `{ endpoint, keys: { p256dh, auth } }`
- Upserts into `push_subscriptions` (conflict on `endpoint` → update keys)
- Returns `{ ok: true }`

**`DELETE /api/push/subscribe`**
- Body: `{ endpoint }`
- Hard-deletes row
- Returns `{ ok: true }`

Both routes use Supabase service role key. No auth required (endpoint is the user's own browser subscription).

### E. Notification sending (inside `/api/news/fetch`)

After the main insert loop completes, at the end of the GET handler:

```ts
// Only send morning notification (02:xx UTC)
const hourUTC = new Date().getUTCHours();
if (results.inserted > 0 && hourUTC === 2) {
  await sendMorningNotification(supabase, results.inserted);
}
```

`sendMorningNotification`:
1. Fetch all rows from `push_subscriptions`
2. Build payload: `{ title: "Kapyn", body: "8 new AI dispatches ready" }` — count only, no source names (v1)
3. Send via `web-push` to each subscription
4. On `410 Gone` or `404`: delete that subscription (expired)
5. Errors on individual sends are caught and logged — never block the response

### F. Frontend — service worker registration

In root layout or a client component that mounts once:

```ts
// Register service worker on mount (silent — no permission asked yet)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
```

### G. Opt-in UI (CompletionCard)

Show when:
- `kapyn_push_opted_in` not set in localStorage
- `kapyn_push_dismissed` not set in localStorage
- Browser supports `PushManager`

Prompt text: *"Get a quiet morning briefing? One notification per day."*  
Buttons: **Enable** / **Not now**

**[Enable] flow:**
1. `await Notification.requestPermission()`
2. If granted: `await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC_KEY })`
3. POST subscription to `/api/push/subscribe`
4. Set `kapyn_push_opted_in = "true"` in localStorage
5. Fire `posthog.capture("push_notification_opted_in", { source: "completion_card" })`

**[Not now] flow:**
1. Set `kapyn_push_dismissed = "true"` in localStorage
2. Fire `posthog.capture("push_notification_dismissed")`
3. Never show prompt again

**Permission denied by browser:**
- Catch gracefully, no error shown to user
- Set `kapyn_push_dismissed` so prompt doesn't loop

### H. Analytics events (product-analytics skill applied)

| Event | When |
|---|---|
| `push_permission_prompted` | Opt-in UI appears on CompletionCard |
| `push_notification_opted_in` | User taps [Enable] and grant succeeds |
| `push_notification_dismissed` | User taps [Not now] |
| `push_notification_sent` | Server fires after morning run (server-side PostHog, `count` property) |

### I. DPDP compliance checklist (dpdp-compliance skill applied)

- [x] Explicit opt-in — no pre-consent, no implied consent
- [x] `consented_at` stored with subscription
- [x] Deletion endpoint (`DELETE /api/push/subscribe`)
- [ ] Privacy notice at `/privacy` updated to mention push tokens
- [ ] Unsubscribe available in app settings (v2 — for now, users can revoke via browser settings)

---

## Files changed / created

| File | Change |
|---|---|
| `.github/workflows/fetch-news.yml` | New — GitHub Actions cron |
| `public/sw.js` | New — service worker |
| `src/app/api/push/subscribe/route.ts` | New — subscribe + unsubscribe |
| `src/app/api/news/fetch/route.ts` | Add morning notification send after insert loop |
| `src/components/feed/CompletionCard.tsx` | Add opt-in prompt UI |
| `src/app/layout.tsx` | Add service worker registration |
| `src/lib/push.ts` | New — `sendMorningNotification` helper |
| Supabase | New `push_subscriptions` table (migration) |
| Vercel env vars | 4 new VAPID vars |
| GitHub Actions secrets | `CRON_SECRET` |

---

## Dependencies

```bash
npm install web-push
npm install -D @types/web-push
```

---

## Risks

| Risk | Mitigation |
|---|---|
| iOS push only works from installed PWA | Prompt only shown after PWA check; graceful fallback otherwise |
| Notification permission denied | Caught silently, `kapyn_push_dismissed` set, no loop |
| Push subscription expires | Auto-deleted on 410/404 response from push service |
| `web-push` send failure blocks cron | Wrapped in try/catch, never throws past `sendMorningNotification` |
| Gemini rate limit during 4x daily cron | Already handled — OpenRouter fallback exists |

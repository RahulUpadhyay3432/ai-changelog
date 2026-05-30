---
name: product-analytics
description: Set up or audit product analytics with a clean event taxonomy for a content/news web app. Defines PostHog event naming, required properties, funnels, retention setup, and what NOT to track.
---

# Product Analytics — Event Taxonomy

## Purpose

Use this skill when adding new PostHog events, auditing existing tracking, setting up funnels, or onboarding to analytics from scratch. A clean taxonomy from day one prevents the "300 events, none queryable" death spiral.

Trigger phrases: "add analytics", "track this", "PostHog event", "set up funnel", "retention cohort", "what should we track", "event naming", "analytics audit"

---

## Key concepts

### The object_action convention (PostHog standard)

```
<object>_<action>
```

- **Object** — the thing the user interacted with (noun)
- **Action** — what happened (verb, present tense)

Examples: `story_opened`, `category_clicked`, `summary_saved`, `breakdown_viewed`

**Rules:**
- Lowercase + snake_case only — no camelCase, no spaces
- Present tense verbs: `open` not `opened`, `click` not `clicked`
- Be specific: `story_swiped_next` not just `swipe`
- No abbreviations: `category` not `cat`

### Approved verb list (don't invent new ones)

`clicked`, `opened`, `viewed`, `swiped`, `saved`, `removed`, `shared`, `submitted`, `loaded`, `refreshed`, `completed`, `dismissed`, `triggered`, `toggled`, `searched`

### Property naming

| Pattern | Example | Use for |
|---|---|---|
| `snake_case` noun | `story_id`, `category_slug` | Identifiers |
| `is_` prefix | `is_first_visit`, `is_pwa` | Booleans |
| `has_` prefix | `has_seen_hint` | State booleans |
| `_count` suffix | `stories_read_count` | Counters |
| `_at` suffix | `opened_at` | Timestamps (ISO 8601) |

---

## Application

### Kapyn event taxonomy

#### Core feed events

```ts
// Story swiped (already implemented — verify properties)
posthog.capture("story_swiped", {
  direction: "next" | "previous",
  story_id: string,
  story_title: string,
  category: CategorySlug,
  position: number,          // 0-based index in current feed
  total: number,             // total stories in feed
});

// Story card tapped to open source
posthog.capture("story_source_opened", {
  story_id: string,
  source_name: string,       // "TechCrunch AI", "The Verge", etc.
  category: CategorySlug,
});

// "Why it matters" breakdown opened
posthog.capture("breakdown_opened", {
  story_id: string,
  story_title: string,
  category: CategorySlug,
});

// Story saved to bookmarks
posthog.capture("story_saved", {
  story_id: string,
  category: CategorySlug,
  source_name: string,
});

// Story unsaved
posthog.capture("story_unsaved", {
  story_id: string,
});
```

#### Navigation events

```ts
// Category tab clicked
posthog.capture("category_clicked", {    // already implemented as "category_changed"
  category: CategorySlug,
  previous_category: CategorySlug,
  source: "home" | "trending",
});

// Bottom nav tab tapped
posthog.capture("nav_tab_clicked", {
  tab: "home" | "trending" | "saved" | "profile",
  from_tab: "home" | "trending" | "saved" | "profile",
});
```

#### Completion / engagement events

```ts
// User reached end of feed
posthog.capture("feed_completed", {
  stories_read: number,
  category: CategorySlug,
  session_duration_seconds: number,
});

// Back to top clicked from completion screen
posthog.capture("feed_restarted", {
  trigger: "back_to_top_button",
});

// Pull-to-refresh
posthog.capture("feed_refreshed", {    // already implemented
  stories_count: number,
  new_stories_found: number,
});
```

#### Session / retention signals

```ts
// App opened (fire on first meaningful render, not just page load)
posthog.capture("app_opened", {
  is_pwa: boolean,           // navigator.standalone || window.matchMedia('(display-mode: standalone)').matches
  is_returning: boolean,     // based on kapyn_last_visit in localStorage
  days_since_last_visit: number | null,
  streak_days: number,
});
```

#### Identify call (fire once per session)

```ts
// When you have any user signal (after streak loads from localStorage)
posthog.identify(
  `anon_${fingerprint}`,    // stable anonymous ID — use posthog's own distinctId
  {
    streak_days: number,
    saved_stories_count: number,
    is_pwa: boolean,
    preferred_category: string,  // most-read category this session
  }
);
```

### What NOT to track

- Raw page views on every route — PostHog autocapture handles this; don't double-count
- Individual keystrokes or scroll depth — not useful for a swipe-native app
- Internal API calls or cron triggers — use server-side PostHog only for `news_fetch_completed`
- Events that fire more than once per second — debounce drag events
- PII: no email addresses, no IP addresses, no full names in event properties

---

## Funnels to set up in PostHog

### Acquisition → Activation funnel
```
1. app_opened (is_returning: false)
2. story_swiped
3. story_saved OR breakdown_opened
```
Target: > 40% reach step 2, > 15% reach step 3.

### Retention funnel (7-day)
```
Cohort: users who fired app_opened in week N
Retention: did they fire app_opened in week N+1?
```
Target: > 25% week-1 retention for a news app at this stage.

### Engagement depth
```
Event: feed_completed
Property: stories_read
Histogram: how many stories do retained users read per session?
```

---

## Examples

### Good event

```ts
posthog.capture("story_swiped", {
  direction: "next",
  story_id: "a3f4-uuid",
  category: "ai-models",
  position: 3,
  total: 12,
});
```

### Bad events (avoid)

```ts
// Too vague — what was clicked?
posthog.capture("click", { element: "button" });

// PascalCase — breaks querability
posthog.capture("StoryOpened", { StoryId: "123" });

// Past tense — inconsistent with convention
posthog.capture("story_was_swiped");

// Fires on every drag frame — noisy
posthog.capture("drag_move", { y: dragY.get() });
```

---

## Common pitfalls

- **Don't add events without updating this skill** — event sprawl is caused by undocumented additions
- **Don't use autocapture as a substitute** for explicit events on key actions — autocapture element names change with DOM refactors
- **Don't fire `identify()` before you know anything about the user** — wait for localStorage to load
- **Don't create a new event when you can add a property** — `story_swiped` with `direction: "next"` beats two events `story_swiped_next` and `story_swiped_previous` for most analyses
- **Do set `person_profiles: "identified_only"`** in PostHog init if you want to control profile creation

---

## References

- [PostHog Analytics Best Practices](https://posthog.com/docs/product-analytics/best-practices)
- [PostHog Events Documentation](https://posthog.com/docs/data/events)
- [PostHog Schema Management](https://posthog.com/docs/product-analytics/schema-management)
- [Object-Action Framework — Growth Method](https://growthmethod.com/object-action-framework/)
- [PostHog Taxonomy Plugin](https://github.com/PostHog/taxonomy-plugin)

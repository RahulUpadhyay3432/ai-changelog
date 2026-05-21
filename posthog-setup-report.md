<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Kapyn project — an Inshorts-style AI news PWA built with Next.js 16 App Router.

**What was done:**

- Installed `posthog-js` (client) and `posthog-node` (server) packages
- Created `instrumentation-client.ts` at the project root for Next.js 15.3+ client-side PostHog initialization with error tracking enabled
- Added reverse-proxy rewrites to `next.config.ts` so PostHog requests route through `/ingest/*` for improved ad-blocker bypass and performance
- Created `src/lib/posthog-server.ts` with a singleton `getPostHogClient()` for server-side event capture
- Set PostHog environment variables (`NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST`) in `.env.local`
- Instrumented 9 events across 5 files (4 client-side, 1 server-side)

| Event | Description | File |
|---|---|---|
| `story_bookmarked` | User bookmarks a story via the bookmark button | `src/components/feed/NewsCard.tsx` |
| `story_unbookmarked` | User removes a story from bookmarks | `src/components/feed/NewsCard.tsx` |
| `story_shared` | User shares a story (native share sheet or clipboard copy) | `src/components/feed/NewsCard.tsx` |
| `story_link_clicked` | User taps the story title to open the source article | `src/components/feed/NewsCard.tsx` |
| `story_swiped` | User swipes to the next or previous story card | `src/components/feed/CardStack.tsx` |
| `feed_refreshed` | User pulls to refresh the feed and new stories load | `src/components/feed/CardStack.tsx` |
| `category_changed` | User switches to a different category tab | `src/components/feed/HomeFeed.tsx` |
| `saved_stories_viewed` | User opens the Saved tab (top of re-engagement funnel) | `src/app/saved/page.tsx` |
| `news_fetch_completed` | Server-side: cron news ingestion job completed | `src/app/api/news/fetch/route.ts` |

## Next steps

We've built a dashboard and five insights for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1615336)
- [Story engagement over time](/insights/QNc2IMsF) — daily bookmarks, shares, and link clicks
- [Daily story swipes](/insights/nK095lc1) — volume of stories swiped per day (reading activity)
- [Story-to-bookmark conversion funnel](/insights/luiBl1Ni) — what % of swipers bookmark a story
- [Category popularity](/insights/l2ToOg4d) — which AI topics drive the most tab switches
- [Unique daily readers](/insights/cbp990pO) — daily active reader count (core retention metric)

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>

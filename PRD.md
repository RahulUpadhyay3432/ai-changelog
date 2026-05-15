# Product Requirements Document — AI Changelog

**Tagline:** What happened in AI today.
**Version:** 1.0
**Status:** Active development

---

## Overview

AI Changelog is a mobile-first PWA that delivers AI news in a full-screen, swipeable card format (Inshorts-style). One story per screen. Swipe to advance. Zero friction.

## Problem

AI moves fast. Readers have no time for scroll-heavy feeds, paywalled blogs, or Twitter noise. They need signal, fast, in a format that respects attention.

## Users

- AI practitioners (engineers, researchers, PMs) checking the pulse daily
- Founders and investors tracking the AI landscape
- Students following model releases and research

## Core Features

### 1. Full-Screen Swipeable Feed (Home)
- One story per screen — full viewport
- Swipe up = next story, swipe down = previous
- Counter badge shows position (e.g. "9 / 12")
- Each card: hero image area, category badge, title, 60-word summary, source + timestamp
- Bookmark (save) and share actions per card
- "Swipe for next story" hint at bottom

### 2. Category Filtering
- Tabs: All, AI/Models, Tools, Startups, Open Source, Research, Funding
- Tabs persist on Home and Trending pages
- Selecting a tab filters the card feed in-place
- Active tab: filled/highlighted; inactive: outlined

### 3. Categories Page
- Grid of all categories with icon, story count, last-updated time
- Tap to open that category's feed
- Bookmark icon on each category card to pin to favorites

### 4. Trending
- Algorithm-ranked stories across all categories
- Same swipeable card format as Home

### 5. Saved
- Locally persisted bookmarked stories
- Same swipeable card format

### 6. Profile
- Display name, preferences
- Notification settings
- Category subscription management

### 7. News Pipeline (Backend)
- Automated RSS ingestion from curated AI news sources
- Summarization via Claude API (60-word constraint)
- Category tagging via classification prompt
- Image extraction from article metadata
- Deduplication by content hash
- Stories refreshed every 15 minutes

## Non-Functional Requirements

| Property | Requirement |
|---|---|
| Performance | LCP < 1.5s, FID < 100ms |
| Offline | PWA service worker caches last 20 stories |
| Mobile | Touch targets ≥ 44px, works on iOS Safari and Android Chrome |
| Accessibility | ARIA labels on all interactive elements |
| Dark theme | Always-on dark mode (feed), light mode on Categories page |

## Out of Scope (v1)

- User accounts / auth
- Comments / discussion
- Push notifications
- Search
- Social sharing with preview cards

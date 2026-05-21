# App Flow — Kapyn

## Navigation Structure

```
Root Layout (BottomNav always visible)
├── / (Home) — swipeable feed
├── /categories — category grid
├── /trending — trending feed (same card format)
├── /saved — bookmarked stories
└── /profile — settings
```

## Screen Flows

### Home (/)

```
App Launch
    │
    ▼
[Home Screen]
  TopBar: "Kapyn"    [current / total]
  CategoryTabs: [All] [AI] [Tools] [Startups] [OSS] [Research] [Funding]
  │
  ▼
[Full-Screen Card]
  [Hero Image Area]
                    [Bookmark] [Share]
  [Category Badge] [time-ago]
  [Title — large bold]
  [60-word summary]
  [Source name]
  [↑ Swipe for next story ↓]
  │
  ├── Swipe Up → next card (spring animation up)
  ├── Swipe Down → previous card (spring animation down)
  ├── Tap Bookmark → save story (toast confirmation)
  ├── Tap Share → native share sheet / copy link
  └── Tap Category tab → filter feed to that category
```

### Categories (/categories)

```
[Categories Page]
  [Bookmark icon top-left]
  CATEGORIES (title)
  BROWSE & FILTER TECH INTELLIGENCE (subtitle)
  [All Dispatches] [AI] [Startups] [Big Tech] [Cybersec...]
  │
  [2-Column Category Grid]
  ┌─────────────┐ ┌─────────────┐
  │ [icon]  [🔖]│ │ [icon]  [🔖]│
  │ Category A  │ │ Category B  │
  │ 47 stories  │ │ 23 stories  │
  │ 14m ago     │ │ 41m ago     │
  └─────────────┘ └─────────────┘
  │
  ├── Tap category card → / (Home) filtered to that category
  └── Tap bookmark icon → pin category to top
```

### Trending (/trending)

Same card stack format as Home, ordered by engagement score.
Category tabs visible. Pagination cursor-based.

### Saved (/saved)

Same card stack format. Source is localStorage. 
Empty state: "Nothing saved yet. Bookmark stories from the feed."

### Profile (/profile)

```
[Profile Page]
  Avatar placeholder
  Display name (editable)
  ─────────────
  Category Preferences (toggle list)
  Notification Settings (future)
  About / Version
```

## State Transitions

| Event | Current Screen | Result |
|---|---|---|
| Swipe up | Home card N | Home card N+1 (enter from bottom) |
| Swipe down | Home card N | Home card N-1 (enter from top) |
| Tap category tab | Any tab | Feed resets to card 0 of that category |
| Tap bookmark | Home card | Story saved to localStorage, icon fills |
| Tap BottomNav Home | Any | Navigate to / preserving last card index |
| Tap BottomNav Categories | Any | Navigate to /categories |
| Tap category card | Categories | Navigate to / with category pre-selected |

## Error States

- No stories: "Nothing here yet. Check back soon."
- Network error: "Can't load stories. Showing cached."
- No saved stories: "Bookmark stories to read later."

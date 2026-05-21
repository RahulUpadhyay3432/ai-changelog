# UI Design Brief — Kapyn

## Brand

- **App name:** Kapyn
- **Tagline:** What happened in AI today.
- **Personality:** Smart, fast, minimal. Like a Bloomberg terminal that respects your time.

## Typography

```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text',
             'Helvetica Neue', Arial, sans-serif;
```

| Role | Size | Weight | Use |
|---|---|---|---|
| App Title | 22px | 700 | TopBar |
| Card Title | 24–28px | 700 | NewsCard headline |
| Summary | 15px | 400 | NewsCard body |
| Category Badge | 11px | 600 | Card badge, uppercase |
| Source/Time | 13px | 400 | Card footer |
| Tab Label | 13px | 500 | CategoryTabs |
| Nav Label | 10px | 500 | BottomNav |
| Category Grid Name | 16px | 600 | CategoryCard |
| Category Grid Meta | 12px | 400 | Story count + time |

## Color System

### Feed (Dark)

| Token | Value | Use |
|---|---|---|
| `--bg-primary` | `#0a0a0a` | Page background |
| `--bg-card` | `#111111` | Card background |
| `--bg-surface` | `#1a1a1a` | Elevated surfaces |
| `--text-primary` | `#f5f5f5` | Headlines |
| `--text-secondary` | `#a3a3a3` | Body, timestamps |
| `--text-muted` | `#525252` | Placeholders |
| `--border` | `rgba(255,255,255,0.08)` | Dividers |
| `--tab-active-bg` | `#f5f5f5` | Active tab fill |
| `--tab-active-text` | `#0a0a0a` | Active tab text |

### Categories (Light)

| Token | Value | Use |
|---|---|---|
| `--bg-primary` | `#ffffff` | Page background |
| `--bg-card` | `#ffffff` | Category card |
| `--text-primary` | `#0a0a0a` | Category name |
| `--text-secondary` | `#737373` | Subtitle, meta |
| `--border` | `rgba(0,0,0,0.08)` | Card borders |

### Category Accent Colors

| Category | Gradient Start | Accent | Badge Text |
|---|---|---|---|
| AI / Models | `#1a0533` | `#7c3aed` | `#c4b5fd` |
| Tools | `#0d1f3c` | `#2563eb` | `#60a5fa` |
| Startups | `#0a2015` | `#16a34a` | `#4ade80` |
| Open Source | `#2d1100` | `#ea580c` | `#fb923c` |
| Research | `#001f2e` | `#0891b2` | `#22d3ee` |
| Funding | `#2d1a00` | `#d97706` | `#fbbf24` |
| Big Tech | `#0f0f2d` | `#4f46e5` | `#818cf8` |

## Component Specs

### NewsCard

```
┌─────────────────────────────────┐  ← edge-to-edge
│                                 │
│      HERO IMAGE / GRADIENT      │  ← ~55% card height
│      (edge-to-edge, no padding) │
│                      [🔖] [↗]  │  ← icons top-right, absolute
│                                 │
├─────────────────────────────────┤
│ CATEGORY BADGE    ·  time-ago   │  ← 11px uppercase, gray
│                                 │
│ Card Title in Large Bold Text   │  ← 26px, font-weight: 700
│ that spans two or three lines   │
│                                 │
│ Summary paragraph that is kept  │  ← 15px, line-height: 1.6
│ to approximately sixty words to │
│ ensure readable density.        │
│                                 │
│ • Source Name                   │  ← 13px, muted
│                                 │
│   ↑ Swipe for next story ↓     │  ← centered, 12px, muted
└─────────────────────────────────┘
```

### CategoryTabs

- Horizontal scroll, `overflow-x: auto`, no scrollbar visible
- Pill shape: `border-radius: 100px`
- Inactive: `border: 1px solid rgba(255,255,255,0.15)`, text `#a3a3a3`
- Active: `background: #f5f5f5`, text `#0a0a0a`
- Padding: `8px 16px`
- Gap between tabs: `8px`
- Scrolls to keep active tab visible

### BottomNav

- Height: 60px + safe-area-inset-bottom
- Background: `rgba(10,10,10,0.95)` with `backdrop-filter: blur(20px)`
- Top border: `1px solid rgba(255,255,255,0.06)`
- Active icon + label: `#f5f5f5`
- Inactive: `#525252`
- Icon size: 24px, label 10px, gap 4px

### CategoryCard (Light)

- Background: white
- Border: `1px solid rgba(0,0,0,0.06)`
- Border-radius: 16px
- Shadow: `0 1px 4px rgba(0,0,0,0.06)`
- Icon: 40x40 rounded-lg, colored background (category accent at 15% opacity)
- Bookmark: top-right, 20px, gray (filled = red when saved)

## Motion

| Interaction | Animation |
|---|---|
| Card advance (swipe up) | Old exits to top, new enters from bottom — spring(300, 30) |
| Card retreat (swipe down) | Old exits to bottom, new enters from top — spring(300, 30) |
| Card follow drag | Real-time y translation, elastic: 0.1 |
| Tab change | Feed fades out, new cards fade in — 200ms |
| Bookmark tap | Icon scale 1→1.3→1, fill color transition 200ms |
| Nav tap | Page fade 150ms |

## Layout Rules

- Max content width: 430px (iPhone 14 Pro Max) — centered on desktop
- Card fills `100dvh - topbar - tabs - bottomnav`
- No horizontal padding on card image — true edge-to-edge
- Text areas: `px-5` (20px) horizontal padding
- Safe area insets respected via `env(safe-area-inset-*)`

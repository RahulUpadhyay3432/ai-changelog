# Backend Schema — AI Changelog (Supabase)

## Tables

### `categories`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default gen_random_uuid() | |
| `slug` | text | UNIQUE, NOT NULL | e.g. "ai-models", "startups" |
| `name` | text | NOT NULL | Display name e.g. "AI / Models" |
| `description` | text | | Short blurb |
| `icon` | text | | Lucide icon name |
| `color_accent` | text | | Hex, e.g. "#7c3aed" |
| `color_bg` | text | | Card gradient start hex |
| `sort_order` | int | DEFAULT 0 | Display ordering |
| `created_at` | timestamptz | DEFAULT now() | |

### `sources`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK | |
| `name` | text | NOT NULL | "The Batch", "Import AI", etc. |
| `rss_url` | text | UNIQUE, NOT NULL | RSS feed URL |
| `category_id` | uuid | FK → categories.id | Default category for this source |
| `active` | boolean | DEFAULT true | Toggle without deleting |
| `last_fetched_at` | timestamptz | | |
| `created_at` | timestamptz | DEFAULT now() | |

### `stories`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK | |
| `title` | text | NOT NULL | Original article title |
| `summary` | text | NOT NULL | AI-generated 60-word summary |
| `image_url` | text | | Hero image URL |
| `source_url` | text | NOT NULL | Original article URL |
| `source_name` | text | NOT NULL | Publisher display name |
| `category_id` | uuid | FK → categories.id | |
| `published_at` | timestamptz | NOT NULL | Original publish time |
| `ingested_at` | timestamptz | DEFAULT now() | When pipeline processed |
| `content_hash` | text | UNIQUE | SHA256 of title+url for dedup |
| `save_count` | int | DEFAULT 0 | Denormalized popularity signal |
| `view_count` | int | DEFAULT 0 | |
| `trending_score` | float | DEFAULT 0 | Computed score for /trending |
| `is_featured` | boolean | DEFAULT false | Editorial pin |

Indexes:
- `stories(published_at DESC)` — feed ordering
- `stories(category_id, published_at DESC)` — category feed
- `stories(trending_score DESC)` — trending feed
- `stories(content_hash)` — deduplication lookup

### `saved_stories` (future — for authenticated users)

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK | |
| `user_id` | uuid | FK → auth.users.id | |
| `story_id` | uuid | FK → stories.id | |
| `saved_at` | timestamptz | DEFAULT now() | |

Unique constraint: `(user_id, story_id)`

## Row Level Security

```sql
-- stories: public read, no public write
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stories_public_read" ON stories FOR SELECT USING (true);

-- categories: public read
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);

-- sources: service role only
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sources_service_only" ON sources USING (auth.role() = 'service_role');

-- saved_stories: users see own rows
ALTER TABLE saved_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_own" ON saved_stories USING (auth.uid() = user_id);
```

## Edge Functions

### `ingest-pipeline` (cron: every 15 min)

```
1. Fetch all active sources
2. For each source:
   a. Parse RSS feed
   b. For each item, compute content_hash = SHA256(title + link)
   c. Check if content_hash exists in stories → skip if yes
   d. Call Claude API (claude-haiku-4-5):
      - Prompt: "Summarize this AI news in exactly 60 words, written for a technical audience."
      - Input: title + article excerpt
   e. Classify category via prompt if source has no default category
   f. Extract image_url from og:image or RSS enclosure
   g. INSERT into stories
3. Update sources.last_fetched_at
4. Recompute trending_score for last 24h:
   trending_score = (save_count * 3 + view_count) / hours_since_published
```

## Initial Seed Data

Categories (in order):
1. AI / Models — slug: `ai-models`
2. Tools — slug: `tools`
3. Startups — slug: `startups`
4. Open Source — slug: `open-source`
5. Research — slug: `research`
6. Funding — slug: `funding`
7. Big Tech — slug: `big-tech`

Sources to seed:
- Import AI (Jack Clark) — importai.substack.com/feed
- The Batch (deeplearning.ai) — thesequence.substack.com/feed
- Hugging Face Blog — huggingface.co/blog/feed.xml
- MIT Tech Review AI — feeds.feedburner.com/mit-tech-review-ai
- VentureBeat AI — feeds.feedburner.com/venturebeat/SZYF

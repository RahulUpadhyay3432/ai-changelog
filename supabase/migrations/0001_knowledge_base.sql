-- ============================================================================
-- Kapyn Knowledge Base — schema migration 0001
-- ----------------------------------------------------------------------------
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query).
-- Idempotent: safe to re-run. Adds the entity/concept knowledge graph that the
-- daily news ingestion populates and the /learn + /tools + /digest pages read.
--
-- All five tables are DURABLE — nothing here is touched by the 48h news_items
-- delete. The graph (entities + mentions) points at story_archive, NOT
-- news_items, so concept pages never go empty when stories rotate.
--
-- RLS: anon (the public client) gets SELECT only, and only on published rows
-- for explainers/digests. ALL writes are service-role only (the cron uses
-- SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS). Make sure that env var is set
-- in Vercel, or the ingestion/generation writes to these tables will fail.
-- ============================================================================

create extension if not exists pg_trgm;

-- ─── entities — the graph spine ─────────────────────────────────────────────
create table if not exists public.entities (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  canonical_name    text not null,
  entity_type       text not null check (entity_type in ('model','tool','company','technique','concept')),
  aliases           text[] not null default '{}',
  short_desc        text,
  mention_count     int not null default 0,
  first_seen_at     timestamptz not null default now(),
  last_mentioned_at timestamptz,
  is_seed           boolean not null default false,
  status            text not null default 'active' check (status in ('active','hidden')),
  created_at        timestamptz not null default now()
);

create index if not exists entities_type_mentions_idx on public.entities (entity_type, mention_count desc);
create index if not exists entities_last_mentioned_idx on public.entities (last_mentioned_at desc);
create index if not exists entities_aliases_gin        on public.entities using gin (aliases);
create index if not exists entities_name_trgm          on public.entities using gin (canonical_name gin_trgm_ops);

-- ─── story_archive — durable mirror of news stories the KB references ────────
-- id is reused from news_items.id so /story/[id] links keep resolving after the
-- 48h delete (the story page falls back to this table).
create table if not exists public.story_archive (
  id            uuid primary key,
  title         text not null,
  summary       text not null,
  source_url    text not null unique,
  source_name   text not null,
  category_slug text not null,
  image_url     text,
  published_at  timestamptz not null,
  archived_at   timestamptz not null default now()
);

create index if not exists story_archive_published_idx on public.story_archive (published_at desc);

-- ─── entity_mentions — news ↔ entity join (points at the DURABLE archive) ────
create table if not exists public.entity_mentions (
  id         uuid primary key default gen_random_uuid(),
  entity_id  uuid not null references public.entities (id) on delete cascade,
  story_id   uuid not null references public.story_archive (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (entity_id, story_id)
);

create index if not exists entity_mentions_entity_idx on public.entity_mentions (entity_id);
create index if not exists entity_mentions_story_idx  on public.entity_mentions (story_id);

-- ─── entity_explainers — auto-generated content, publish-gated ───────────────
create table if not exists public.entity_explainers (
  id                   uuid primary key default gen_random_uuid(),
  entity_id            uuid not null unique references public.entities (id) on delete cascade,
  definition           text,
  why_it_matters       text,
  how_it_works         text,
  current_developments text,
  related_slugs        text[] not null default '{}',
  citation_story_ids   uuid[] not null default '{}',
  model_used           text,
  quality_score        int,
  status               text not null default 'draft' check (status in ('draft','published','held','unpublished')),
  generated_at         timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists entity_explainers_status_idx on public.entity_explainers (status);

-- ─── digests — daily archive ("blog") ───────────────────────────────────────
create table if not exists public.digests (
  id          uuid primary key default gen_random_uuid(),
  digest_date date not null unique,
  headline    text,
  intro       text,
  story_ids   uuid[] not null default '{}',
  status      text not null default 'published' check (status in ('draft','published','held','unpublished')),
  created_at  timestamptz not null default now()
);

create index if not exists digests_date_idx on public.digests (digest_date desc);

-- ============================================================================
-- Row Level Security — anon read-only, writes are service-role only
-- ============================================================================
alter table public.entities          enable row level security;
alter table public.story_archive     enable row level security;
alter table public.entity_mentions   enable row level security;
alter table public.entity_explainers enable row level security;
alter table public.digests           enable row level security;

-- Drop-then-create so re-running the file refreshes the policies cleanly.
drop policy if exists entities_anon_read          on public.entities;
drop policy if exists story_archive_anon_read      on public.story_archive;
drop policy if exists entity_mentions_anon_read    on public.entity_mentions;
drop policy if exists entity_explainers_anon_read  on public.entity_explainers;
drop policy if exists digests_anon_read            on public.digests;

create policy entities_anon_read         on public.entities          for select to anon using (status = 'active');
create policy story_archive_anon_read    on public.story_archive     for select to anon using (true);
create policy entity_mentions_anon_read  on public.entity_mentions   for select to anon using (true);
create policy entity_explainers_anon_read on public.entity_explainers for select to anon using (status = 'published');
create policy digests_anon_read          on public.digests           for select to anon using (status = 'published');

-- ============================================================================
-- Seed concepts (M1 "prove the format" set) — foundational, hand-canonicalised.
-- entity_type technique|concept → these render at /learn/[slug].
-- The generation cron writes the full multi-section explainer for these even
-- with zero linked stories (is_seed bypasses the ≥2-source thin-content gate),
-- because they are well-established concepts with low hallucination risk.
-- short_desc is a one-line fallback so the page is never empty pre-generation.
-- ============================================================================
insert into public.entities (slug, canonical_name, entity_type, aliases, short_desc, is_seed)
values
  ('rag',                'Retrieval-Augmented Generation', 'technique', '{"rag","retrieval augmented generation","retrieval-augmented generation"}', 'A technique that grounds an LLM''s answers in documents retrieved at query time, reducing hallucination.', true),
  ('embeddings',         'Embeddings',                     'concept',   '{"embedding","embeddings","vector embeddings"}', 'Numeric vector representations of text or data that let machines compare meaning by distance.', true),
  ('vector-database',    'Vector Database',                'concept',   '{"vector database","vector db","vector store"}', 'A database built to store and search embeddings by similarity, the backbone of RAG systems.', true),
  ('fine-tuning',        'Fine-Tuning',                    'technique', '{"fine tuning","fine-tuning","finetuning"}', 'Further training a pretrained model on a narrower dataset to specialise its behaviour.', true),
  ('agents',             'AI Agents',                      'concept',   '{"agent","agents","ai agents","agentic"}', 'LLM systems that plan, call tools, and act over multiple steps toward a goal.', true),
  ('mcp',                'Model Context Protocol',         'concept',   '{"mcp","model context protocol"}', 'An open standard for connecting AI assistants to external tools and data sources.', true),
  ('quantization',       'Quantization',                   'technique', '{"quantization","quantisation","quantized"}', 'Compressing a model''s weights to lower precision so it runs faster and on less memory.', true),
  ('rlhf',               'RLHF',                           'technique', '{"rlhf","reinforcement learning from human feedback"}', 'Reinforcement Learning from Human Feedback — tuning models to match human preferences.', true),
  ('context-window',     'Context Window',                 'concept',   '{"context window","context length"}', 'The maximum amount of text a model can consider at once when generating a response.', true),
  ('diffusion-models',   'Diffusion Models',               'concept',   '{"diffusion","diffusion model","diffusion models"}', 'Generative models that create images or audio by iteratively denoising random noise.', true),
  ('transformers',       'Transformers',                   'concept',   '{"transformer","transformers","transformer architecture"}', 'The neural-network architecture, built on attention, behind nearly all modern LLMs.', true),
  ('inference',          'Inference',                      'concept',   '{"inference","model inference"}', 'Running a trained model to produce outputs — the compute cost users actually pay at runtime.', true),
  ('prompt-engineering', 'Prompt Engineering',             'technique', '{"prompt engineering","prompting"}', 'The practice of crafting model inputs to reliably get the outputs you want.', true),
  ('mixture-of-experts', 'Mixture of Experts',             'concept',   '{"mixture of experts","moe","mixture-of-experts"}', 'A model design that routes each input to a subset of specialised sub-networks for efficiency.', true),
  ('chain-of-thought',   'Chain of Thought',               'technique', '{"chain of thought","cot","chain-of-thought"}', 'Prompting a model to reason step by step, which improves accuracy on complex tasks.', true)
on conflict (slug) do nothing;

-- ============================================================================
-- Atomic entity + mention upsert (called once per extracted entity by the
-- ingestion cron). One DB call avoids the check-then-insert race when
-- INSERT_CONCURRENCY stories mention the same entity in the same run.
--
-- mention_count and last_mentioned_at are bumped ONLY when the mention is
-- genuinely new (the entity_mentions insert actually inserted a row). This keeps
-- mention_count exact even if a story URL is reprocessed (e.g. re-seen after the
-- 48h delete, or a backfill) — the dedup'd junction row is a no-op and the
-- counter does not drift.
--
-- canonical_name / entity_type / status are preserved on conflict so a later
-- misclassification can't overwrite a curated entity; aliases always merge.
-- Returns the entity id.
-- ============================================================================
create or replace function public.kb_upsert_entity_mention(
  p_slug    text,
  p_name    text,
  p_type    text,
  p_alias   text,
  p_story_id uuid
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entity_id uuid;
  v_inserted  int;
begin
  -- Ensure the entity exists and merge the alias. Do NOT touch the counters here.
  insert into public.entities (slug, canonical_name, entity_type, aliases)
  values (p_slug, p_name, p_type, array[p_alias])
  on conflict (slug) do update
    set aliases = (select array(select distinct a from unnest(entities.aliases || array[p_alias]) as a))
  returning id into v_entity_id;

  -- Link the mention; detect whether a new junction row was actually created.
  insert into public.entity_mentions (entity_id, story_id)
  values (v_entity_id, p_story_id)
  on conflict (entity_id, story_id) do nothing;
  get diagnostics v_inserted = row_count;

  -- Count + freshness only advance on a genuinely new mention.
  if v_inserted > 0 then
    update public.entities
      set mention_count     = mention_count + 1,
          last_mentioned_at = now()
      where id = v_entity_id;
  end if;

  return v_entity_id;
end;
$$;

-- Only the service role (cron + admin) may run the writer. SECURITY DEFINER
-- would otherwise let the public anon role bypass RLS through this function.
revoke all on function public.kb_upsert_entity_mention(text, text, text, text, uuid) from public, anon, authenticated;
grant execute on function public.kb_upsert_entity_mention(text, text, text, text, uuid) to service_role;

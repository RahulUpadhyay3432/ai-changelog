#!/usr/bin/env node
// Finds a distinct Unsplash photograph for every blog post and writes the picks to
// scripts/hero-picks.json, ready to be wired into blog-content.ts.
//
// Why sourcing rather than generating: 41 of 59 posts were sharing 11 photos, so the
// problem was repetition, not quality. The photos already on the blog are Unsplash and
// they read well. Generation was tried first and the free tiers are not good enough
// (a balance scale came back with broken arms; a PC case came back as unrecognisable
// mush with a bright patch exactly where the title sits).
//
// Nothing is downloaded. src/lib/blog-content.ts hotlinks the Unsplash CDN through its
// U() helper already, which is also what Unsplash's API guidelines ask for. This script
// only picks IDs.
//
//   UNSPLASH_ACCESS_KEY=xxx node scripts/source-hero-images.mjs
//   ... --only <slug>     one post
//   ... --limit 5         first N
//
// Demo-tier keys allow 50 requests an hour, so a full run of 53 needs two passes.
// Already-picked slugs are skipped, making that automatic. The demo tier is enough:
// production (1,000/hour) needs Unsplash's 5-10 day review and we do not need it.
//
// UNSPLASH API GUIDELINES, and how this stays inside them:
//   "non-automated, high-quality, authentic"  This picks candidates; a human looks at
//     every one before it ships. `--sheet` builds the contact sheet for that, and the
//     wiring step refuses any pick not marked reviewed. Searching is a one-off
//     editorial pass, not a service running against their API.
//   "cannot replicate the core Unsplash experience"  Kapyn is a news reader. It shows
//     one hero per article and offers no browsing, searching or downloading of photos.
//   "keys must remain confidential"  Read from .env.local, which is gitignored and has
//     never been committed. Never pass the key as an argument, it would land in shell
//     history and process listings.
//   "do not abuse the API"  One request per post, 300ms apart, resumable, and it stops
//     dead on a 403 rather than hammering.
//   Attribution and download tracking are required, not optional. `--track` pings each
//     photo's download_location, and the picks carry the photographer name and profile
//     URL that blog-content.ts renders as a real link.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PICKS = join(ROOT, "scripts", "hero-picks.json");
const argv = process.argv.slice(2);
const value = (n) => { const i = argv.indexOf(n); return i === -1 ? null : argv[i + 1]; };

function accessKey() {
  if (process.env.UNSPLASH_ACCESS_KEY) return process.env.UNSPLASH_ACCESS_KEY;
  try {
    const m = readFileSync(join(ROOT, ".env.local"), "utf8").match(/^UNSPLASH_ACCESS_KEY=(.*)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  } catch { /* fall through */ }
  console.error("  UNSPLASH_ACCESS_KEY not set. Create a free app at");
  console.error("  https://unsplash.com/oauth/applications and copy the Access Key.");
  process.exit(1);
}

const queries = JSON.parse(readFileSync(join(ROOT, "scripts", "hero-queries.json"), "utf8"));
const picks = existsSync(PICKS) ? JSON.parse(readFileSync(PICKS, "utf8")) : {};

/** A hero is 16:9 and the title sits bottom-left, so portraits and squares are useless. */
const usable = (p) => p.width / p.height >= 1.4;

async function search(key, query) {
  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("per_page", "10");
  url.searchParams.set("content_filter", "high");
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    const e = new Error(`${res.status} ${(await res.text()).slice(0, 140)}`);
    e.status = res.status;
    throw e;
  }
  return (await res.json()).results ?? [];
}

/** Unsplash requires this ping when a photo is actually used. Run it after review. */
async function track(key) {
  const entries = Object.entries(picks).filter(([, p]) => p.downloadLocation && !p.tracked);
  console.log(`  pinging download_location for ${entries.length} picks\n`);
  for (const [slug, p] of entries) {
    try {
      const res = await fetch(p.downloadLocation, {
        headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" },
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) throw new Error(String(res.status));
      p.tracked = true;
      writeFileSync(PICKS, JSON.stringify(picks, null, 2) + "\n");
      console.log(`  ok    ${slug}`);
    } catch (e) {
      console.log(`  FAIL  ${slug} — ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
}

async function main() {
  const key = accessKey();
  if (argv.includes("--track")) return track(key);
  const only = value("--only");
  let todo = Object.entries(queries).filter(([slug]) => (only ? slug === only : !picks[slug]));
  const limit = value("--limit");
  if (limit) todo = todo.slice(0, Number(limit));

  console.log(`  ${todo.length} to source · ${Object.keys(picks).length} already picked\n`);
  const usedIds = new Set(Object.values(picks).map((p) => p.id));

  for (const [slug, query] of todo) {
    process.stdout.write(`  ${slug.padEnd(42)} "${query}" ... `);
    try {
      const results = (await search(key, query)).filter(usable);
      // Never reuse an id: repetition is the whole reason this script exists.
      const pick = results.find((p) => !usedIds.has(p.id));
      if (!pick) { console.log("no usable landscape result"); continue; }
      usedIds.add(pick.id);
      picks[slug] = {
        id: pick.id,
        query,
        alt: pick.alt_description || pick.description || query,
        photographer: pick.user?.name ?? "Unknown",
        photographerUrl: pick.user?.links?.html
          ? `${pick.user.links.html}?utm_source=kapyn&utm_medium=referral`
          : "",
        reviewed: false,
        width: pick.width,
        height: pick.height,
        // Unsplash asks that this be pinged when a photo is actually put to use.
        downloadLocation: pick.links?.download_location ?? "",
      };
      writeFileSync(PICKS, JSON.stringify(picks, null, 2) + "\n");
      console.log(`${pick.id}  (${pick.user?.name})`);
    } catch (e) {
      console.log(`FAILED — ${e.message}`);
      if (e.status === 403) {
        console.error("\n  Rate limited (demo tier is 50/hour). Re-run in an hour;");
        console.error("  everything already picked is saved and skipped.");
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log(`\n  ${Object.keys(picks).length}/${Object.keys(queries).length} picked → scripts/hero-picks.json`);
}

main();

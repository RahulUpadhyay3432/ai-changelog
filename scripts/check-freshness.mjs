#!/usr/bin/env node
// Fails when Kapyn's hand-maintained content has aged past the point of being true.
//
// This exists because the August 2026 audit found /compare presenting GPT-4o as
// frontier, two generations behind, and 24 dead links across the directories. The
// monthly checklist in docs/PROJECT-STATUS.md was supposed to prevent that. It did
// not, because nothing failed when it was skipped. This does.
//
//   node scripts/check-freshness.mjs            offline checks only, fast
//   node scripts/check-freshness.mjs --links    also HEAD-sweeps every catalog URL
//
// No dependencies and no tsx: the files are read as text on purpose, because most of
// what rots here is prose rather than structured data.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const today = new Date();
const failures = [];
const notes = [];
const fail = (where, msg) => failures.push(`${where}: ${msg}`);

// ─── 1. models.ts is the declared source of truth, so its age is the headline signal ──
const MAX_MODEL_AGE_DAYS = 45;

const modelsSrc = read("src/lib/models.ts");
const stamp = modelsSrc.match(/export const LAST_UPDATED = "(\d{4}-\d{2}-\d{2})"/);
if (!stamp) {
  fail("models.ts", "no LAST_UPDATED found");
} else {
  const ageDays = Math.floor((today - new Date(stamp[1])) / 86_400_000);
  if (ageDays > MAX_MODEL_AGE_DAYS) {
    fail(
      "models.ts",
      `LAST_UPDATED is ${stamp[1]}, ${ageDays} days old (limit ${MAX_MODEL_AGE_DAYS}). ` +
        `Re-check the frontier, then bump it.`,
    );
  } else {
    notes.push(`models.ts LAST_UPDATED ${stamp[1]} (${ageDays}d old)`);
  }
}

// A family with no currentVersion has no way to show that it has gone stale.
for (const block of modelsSrc.split(/\n  \{\n/).slice(1)) {
  const id = block.match(/id: "([^"]+)"/)?.[1];
  if (id && !/currentVersion:/.test(block)) {
    fail("models.ts", `"${id}" has no currentVersion, so it will freeze without anyone noticing`);
  }
}

// ─── 2. Retired model names must not appear as live recommendations ──────────────────
// Only genuinely retired generations belong here, not merely superseded point releases:
// a list that fires on every minor bump gets muted, and a muted check is worse than none.
const RETIRED = [
  /\bGPT-4o\b/, /\bGPT-4(?![.\w])/, /\bGPT-4\.\d/, /\bGPT-3\.5\b/,
  /\bGemini 1\.\d/, /\bGemini 2\.\d/,
  /\bClaude 2\b/, /\bClaude 3(?![.\d]*\s*(?:is|was))\b/, /\bClaude 3\.\d/,
  /\bLlama 2\b/, /\bLlama 3\b/, /\bLlama 3\.\d/,
  /\bMistral 7B\b/, /\bGPT-5(?![.\w])/,
];

// Dated roundups are records of the month they describe. Rewriting one to match today
// would falsify the archive, so they are exempt by tag rather than by slug.
function postsOf(src) {
  const out = [];
  const parts = src.split(/\n    slug: "/).slice(1);
  for (const part of parts) {
    const slug = part.slice(0, part.indexOf('"'));
    out.push({ slug, tag: part.match(/\n    tag: "([^"]+)"/)?.[1] ?? "", body: part });
  }
  return out;
}

const CONTENT_FILES = ["src/lib/blog-content.ts", "src/lib/blog-india.ts"];
for (const f of CONTENT_FILES) {
  for (const post of postsOf(read(f))) {
    if (post.tag === "Roundup") continue;
    for (const re of RETIRED) {
      const hit = post.body.match(re);
      if (hit) fail(f, `/blog/${post.slug} still says "${hit[0]}"`);
    }
  }
}

// The same names must not survive in the comparison verdicts or on the landing page,
// neither of which has a roundup exemption.
for (const f of ["src/lib/model-pairs.ts", "src/app/home/page.tsx"]) {
  const src = read(f);
  for (const re of RETIRED) {
    const hit = src.match(re);
    if (hit) fail(f, `contains retired model name "${hit[0]}"`);
  }
}

// ─── 3. Blog dates must be coherent ──────────────────────────────────────────────────
const iso = today.toISOString().slice(0, 10);
for (const f of CONTENT_FILES) {
  for (const post of postsOf(read(f))) {
    const date = post.body.match(/\n    date: "([^"]+)"/)?.[1];
    const updated = post.body.match(/\n    updated: "([^"]+)"/)?.[1];
    if (updated && date && updated < date) {
      fail(f, `/blog/${post.slug} has updated (${updated}) before date (${date})`);
    }
    for (const [label, v] of [["date", date], ["updated", updated]]) {
      if (v && v > iso) fail(f, `/blog/${post.slug} has a ${label} in the future (${v})`);
    }
  }
}

// ─── 4. A curated hackathon must not contradict its own dates ────────────────────────
// Nothing expires these, and a stale one shows "upcoming" for an event that is over.
const hackSrc = read("src/lib/hackathons.ts");
const curated = hackSrc.slice(hackSrc.indexOf("const CURATED_HACKATHONS"));
for (const block of curated.split(/\n  \{\n/).slice(1)) {
  const id = block.match(/externalId: "([^"]+)"/)?.[1];
  const dates = block.match(/dates: "([^"]*)"/)?.[1];
  const state = block.match(/openState: "([^"]+)"/)?.[1];
  if (!id || !dates || !state) continue;
  // Pull the last "Mon D, YYYY" or "Mon D" in the string and treat it as the end.
  const months = "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec";
  const all = [...dates.matchAll(new RegExp(`(${months})\\w*\\s+(\\d{1,2})(?:,\\s*(\\d{4}))?`, "g"))];
  if (!all.length) continue;
  const last = all[all.length - 1];
  const year = last[3] ? Number(last[3]) : today.getFullYear();
  const end = new Date(`${last[1]} ${last[2]}, ${year} 23:59:59`);
  if (end < today && state !== "ended") {
    fail("hackathons.ts", `"${id}" is marked "${state}" but its dates ("${dates}") ended ${end.toDateString()}`);
  }
  if (all.length === 1 && state === "upcoming" && end < today) {
    fail("hackathons.ts", `"${id}" is "upcoming" but starts in the past ("${dates}")`);
  }
}

// ─── 5. Optional: the dead-link sweep the monthly checklist asks for ─────────────────
if (process.argv.includes("--links")) {
  const CATALOGS = ["src/lib/radar-mcp.ts", "src/lib/radar-skills.ts", "src/lib/radar-essentials.ts"];
  const urls = new Set();
  for (const f of CATALOGS) {
    for (const m of read(f).matchAll(/url: "(https?:\/\/[^"]+)"/g)) urls.add(m[1]);
  }
  const list = [...urls];
  process.stdout.write(`  sweeping ${list.length} catalog URLs`);
  let checked = 0;
  const CONCURRENCY = 12;
  const queue = list.slice();
  const worker = async () => {
    while (queue.length) {
      const url = queue.shift();
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 15_000);
        let res = await fetch(url, { method: "HEAD", redirect: "follow", signal: ctrl.signal });
        // Plenty of sites reject HEAD but serve GET. Only a second refusal counts.
        if (res.status === 405 || res.status === 403 || res.status === 501) {
          res = await fetch(url, { method: "GET", redirect: "follow", signal: ctrl.signal });
        }
        clearTimeout(t);
        if (res.status >= 400 && res.status !== 429) fail("catalog link", `${res.status}  ${url}`);
      } catch (e) {
        fail("catalog link", `unreachable (${e.name})  ${url}`);
      }
      if (++checked % 25 === 0) process.stdout.write(".");
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  process.stdout.write("\n");
}

// ─── Report ──────────────────────────────────────────────────────────────────────────
for (const n of notes) console.log(`  ok    ${n}`);
if (failures.length === 0) {
  console.log(`\n  PASS — content is current as of ${iso}`);
  process.exit(0);
}
console.error("");
for (const f of failures) console.error(`  STALE  ${f}`);
console.error(`\n  ${failures.length} staleness failure(s). See the Content freshness section of docs/PROJECT-STATUS.md.`);
process.exit(1);

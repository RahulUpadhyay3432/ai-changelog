#!/usr/bin/env node
// Generates the blog hero images through the Gemini image API and writes them
// straight to public/blog/<slug>.webp.
//
// Why this exists: 41 of 59 posts were sharing 11 stock photos. The subjects in
// scripts/hero-subjects.json are the single source of truth for what each post
// gets; docs/blog-image-prompts.md is the human-readable copy of the same list.
//
// A first attempt at these prompts produced near-identical circuit-board
// schematics from every subject, because the shared style text was long and
// concrete while the per-post subject was short and abstract. The prompt is
// assembled here in the order that fixed it: SUBJECT first, TREATMENT after,
// and the treatment describes only light and mood. Do not reverse them, and do
// not grow the treatment to fix a collision. Change the subject instead.
//
//   node scripts/generate-hero-images.mjs --dry-run       print prompts, call nothing
//   node scripts/generate-hero-images.mjs --only <slug>   one post
//   node scripts/generate-hero-images.mjs --limit 3       first N missing
//   node scripts/generate-hero-images.mjs                 every missing one
//
// Resumable: anything already present in public/blog/ is skipped, so a run that
// dies halfway costs nothing to repeat. --force overrides that.

import { readFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "blog");
const MODEL = process.env.HERO_IMAGE_MODEL ?? "gemini-3-pro-image";
const WIDTH = 1600, HEIGHT = 900, QUALITY = 80;

const TREATMENT = `Photographed as an editorial still life. Wide 16:9 frame.

Low-key lighting from a single soft source at the upper right, falling away
into deep shadow toward the lower left. Warm near-black background, #0c0b0a.
Muted desaturated colour throughout with one restrained cool-blue note.
Shallow depth of field, 50mm, honest texture, visible material grain, real
wear. Quiet and considered, not dramatic.

The lower-left third of the frame must be near-empty and in shadow.

No text, letters, numbers, logos or watermarks. No people. No illustration,
no vector art, no schematic line-work, no 3D render, no neon, no lens flare.`;

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const value = (name) => { const i = argv.indexOf(name); return i === -1 ? null : argv[i + 1]; };

const subjects = JSON.parse(readFileSync(join(ROOT, "scripts", "hero-subjects.json"), "utf8"));

/** .env.local is not loaded for us here, and the key must never be an argument. */
function apiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const env = readFileSync(join(ROOT, ".env.local"), "utf8");
    const m = env.match(/^GEMINI_API_KEY=(.*)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  } catch { /* fall through to the error below */ }
  console.error("  GEMINI_API_KEY not found in the environment or .env.local");
  process.exit(1);
}

async function generate(key, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    signal: AbortSignal.timeout(180_000),
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`${res.status} ${text.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const image = parts.find((p) => p.inlineData?.data);
  if (!image) {
    const text = parts.map((p) => p.text).filter(Boolean).join(" ").slice(0, 160);
    throw new Error(`no image returned${text ? ` (model said: ${text})` : ""}`);
  }
  return Buffer.from(image.inlineData.data, "base64");
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const present = new Set(
    existsSync(OUT_DIR) ? readdirSync(OUT_DIR).filter((f) => f.endsWith(".webp")).map((f) => f.slice(0, -5)) : []
  );

  const only = value("--only");
  if (only && !subjects[only]) {
    console.error(`  "${only}" is not in hero-subjects.json`);
    process.exit(1);
  }

  let todo = Object.entries(subjects);
  if (only) todo = todo.filter(([slug]) => slug === only);
  else if (!flag("--force")) todo = todo.filter(([slug]) => !present.has(slug));
  const limit = value("--limit");
  if (limit) todo = todo.slice(0, Number(limit));

  console.log(`  model ${MODEL} · ${todo.length} to generate · ${present.size} already in public/blog/\n`);
  if (!todo.length) return;

  if (flag("--dry-run")) {
    for (const [slug, subject] of todo) {
      console.log(`── ${slug}.webp\n${subject}\n\n${TREATMENT}\n`);
    }
    return;
  }

  const key = apiKey();
  let ok = 0;
  const failed = [];

  for (const [slug, subject] of todo) {
    process.stdout.write(`  ${slug} ... `);
    try {
      const raw = await generate(key, `${subject}\n\n${TREATMENT}`);
      const out = join(OUT_DIR, `${slug}.webp`);
      await sharp(raw)
        .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
        .webp({ quality: QUALITY })
        .toFile(out);
      const kb = Math.round(readFileSync(out).length / 1024);
      console.log(`ok (${kb} KB)`);
      ok++;
    } catch (e) {
      console.log(`FAILED — ${e.message}`);
      failed.push(slug);
      // A depleted account fails every remaining call the same way. Stop rather
      // than printing the same billing error 52 more times.
      if (e.status === 429) {
        console.error("\n  Gemini credits are depleted. Top up at https://ai.studio/projects and re-run;");
        console.error("  everything already written to public/blog/ is kept and skipped.");
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`\n  ${ok} written to public/blog/${failed.length ? `, ${failed.length} failed: ${failed.join(", ")}` : ""}`);
  if (failed.length) process.exitCode = 1;
}

main();

// ─── Deterministic validator for HERMES-generated blog posts ─────────────────
// Implements the `deterministic` section of playbook/rubrics/post.json. It is
// the CI gate for hermes/* PRs, so it is what auto-publish trusts.
//
//   node scripts/validate-blog-post.ts <post.json> --factsheet <f.json> [--existing-slugs a,b]
//   node scripts/validate-blog-post.ts --all        CI: every generated post + manifest + heroes
//   node scripts/validate-blog-post.ts --self-test  playbook/rubrics/fixtures/cases.json
//
// Runs on plain Node (>= 22.18 strips types), so it has no dependencies and uses
// erasable TypeScript only. It fails closed: an unknown check type or schema
// keyword is a failure, never a skip. The fixtures are also the parity suite
// for HERMES's Python rubric engine; both must produce the same failing ids.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PLAYBOOK = join(ROOT, "playbook");
const GENERATED_DIR = join(ROOT, "content/blog/generated");
const HAND_WRITTEN = ["src/lib/blog-content.ts", "src/lib/blog-india.ts"];
const ENVELOPE_KEYS = ["date", "hero", "playbook_sha", "readingMin"];
const MAX_HERO_BYTES = 500_000;
const HERO_DIMS = { width: 1600, height: 900 };

type Obj = Record<string, unknown>;
type Block = {
  type: string;
  text?: string;
  lead?: boolean;
  level?: number;
  items?: string[];
  title?: string;
  facts?: string[];
};
type Post = { slug: string; title: string; deck: string; tag: string; body: Block[] };
type Fact = { id: string; text: string; source_url?: string; source_name?: string };
type Factsheet = { facts: Fact[]; sources: { url: string; source_name: string; title: string }[] };
type Check = { id: string; check: string; message: string } & Obj;
type Rubric = { deterministic: Check[] };
type Result = { id: string; ok: boolean; message: string; details?: string[] };
type Context = { existingSlugs: string[] };

const readJson = (p: string): unknown => JSON.parse(readFileSync(p, "utf8"));
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

// ─── Minimal JSON Schema ──────────────────────────────────────────────────────
// Only the keywords playbook/schemas/*.json use. Anything else throws.

const SCHEMA_KEYWORDS = new Set([
  "$schema", "title", "description", "type", "properties", "required", "additionalProperties",
  "enum", "pattern", "maxLength", "minLength", "minItems", "maxItems", "items",
]);

function typeOk(type: string, v: unknown): boolean {
  switch (type) {
    case "object": return isObj(v);
    case "array": return Array.isArray(v);
    case "string": return typeof v === "string";
    case "integer": return Number.isInteger(v);
    case "number": return typeof v === "number" && Number.isFinite(v);
    case "boolean": return typeof v === "boolean";
    default: throw new Error(`schema: unsupported type "${type}"`);
  }
}

function validateSchema(schema: Obj, v: unknown, path: string, errors: string[]): void {
  for (const k of Object.keys(schema)) {
    if (!SCHEMA_KEYWORDS.has(k)) throw new Error(`schema: unsupported keyword "${k}" at ${path || "/"}`);
  }
  if (typeof schema.type === "string" && !typeOk(schema.type, v)) {
    errors.push(`${path || "/"}: expected ${schema.type}`);
    return;
  }
  if (Array.isArray(schema.enum) && !schema.enum.includes(v)) errors.push(`${path}: not one of ${schema.enum.join(", ")}`);
  if (typeof v === "string") {
    if (typeof schema.pattern === "string" && !new RegExp(schema.pattern, "u").test(v)) errors.push(`${path}: does not match ${schema.pattern}`);
    if (typeof schema.maxLength === "number" && [...v].length > schema.maxLength) errors.push(`${path}: longer than ${schema.maxLength}`);
    if (typeof schema.minLength === "number" && [...v].length < schema.minLength) errors.push(`${path}: shorter than ${schema.minLength}`);
  }
  if (Array.isArray(v)) {
    if (typeof schema.minItems === "number" && v.length < schema.minItems) errors.push(`${path}: fewer than ${schema.minItems} items`);
    if (typeof schema.maxItems === "number" && v.length > schema.maxItems) errors.push(`${path}: more than ${schema.maxItems} items`);
    if (isObj(schema.items)) v.forEach((item, i) => validateSchema(schema.items as Obj, item, `${path}/${i}`, errors));
  }
  if (isObj(v)) {
    const props = isObj(schema.properties) ? schema.properties : {};
    if (Array.isArray(schema.required)) {
      for (const r of schema.required) if (!(r in v)) errors.push(`${path}/${r}: required`);
    }
    for (const [k, val] of Object.entries(v)) {
      if (isObj(props[k])) validateSchema(props[k] as Obj, val, `${path}/${k}`, errors);
      else if (schema.additionalProperties === false) errors.push(`${path}/${k}: not allowed`);
    }
  }
}

export function schemaErrors(schemaPath: string, v: unknown): string[] {
  const errors: string[] = [];
  validateSchema(readJson(schemaPath) as Obj, v, "", errors);
  return errors;
}

// ─── Text helpers ─────────────────────────────────────────────────────────────

const LINK_RE = /\[([^\]]*)\]\(([^)\s]+)\)/g;
const BARE_URL_RE = /https?:\/\/[^\s)\]]+/g;

/** Index of the final level-2 "Sources" heading, or -1. */
function sourcesIndex(body: Block[]): number {
  for (let i = body.length - 1; i >= 0; i--) {
    const b = body[i];
    if (b.type === "heading" && b.level === 2 && (b.text ?? "").trim().toLowerCase() === "sources") return i;
  }
  return -1;
}

function mainBlocks(body: Block[]): Block[] {
  const i = sourcesIndex(body);
  return i === -1 ? body : body.slice(0, i);
}

function blockTexts(b: Block): string[] {
  if (b.type === "list") return b.items ?? [];
  if (b.type === "callout") return [b.title ?? "", b.text ?? ""].filter(Boolean);
  if (b.type === "paragraph" || b.type === "heading") return [b.text ?? ""];
  return [];
}

type Field = { where: string; text: string };

/** Title, deck and body text. The Sources section only when asked for. */
function fields(post: Post, withSources: boolean): Field[] {
  const blocks = withSources ? post.body : mainBlocks(post.body);
  const out: Field[] = [
    { where: "title", text: post.title },
    { where: "deck", text: post.deck },
  ];
  blocks.forEach((b) => {
    const i = post.body.indexOf(b);
    blockTexts(b).forEach((text, j) => out.push({ where: `body/${i}${b.type === "list" ? `/items/${j}` : ""}`, text }));
  });
  return out;
}

const withoutUrls = (t: string): string => t.replace(LINK_RE, "$1").replace(BARE_URL_RE, "");
const plain = (t: string): string => withoutUrls(t).replace(/\*\*|`/g, "");

function wordCount(blocks: Block[]): number {
  return blocks.flatMap(blockTexts).map(plain).join(" ").split(/\s+/).filter(Boolean).length;
}

function linksIn(text: string): string[] {
  const md = [...text.matchAll(LINK_RE)].map((m) => m[2]);
  const bare = text.replace(LINK_RE, "").match(BARE_URL_RE) ?? [];
  return [...md, ...bare];
}

const normUrl = (u: string): string => u.trim().replace(/#.*$/, "").replace(/\/+$/, "");

function citedFacts(blocks: Block[]): string[] {
  return [...new Set(blocks.flatMap((b) => b.facts ?? []))];
}

function numberTokens(text: string, pattern: string): string[] {
  return withoutUrls(text).match(new RegExp(pattern, "g")) ?? [];
}

function sample(xs: string[], n = 8): string[] {
  return xs.length > n ? [...xs.slice(0, n), `... and ${xs.length - n} more`] : xs;
}

// ─── Checks ───────────────────────────────────────────────────────────────────

type CheckFn = (c: Check, post: Post, fs: Factsheet, ctx: Context) => string[] | null;

const num = (c: Check, k: string): number => {
  const v = c[k];
  if (typeof v !== "number") throw new Error(`rubric ${c.id}: "${k}" must be a number`);
  return v;
};

const CHECKS: Record<string, CheckFn> = {
  json_schema: (c, post) => {
    const errs = schemaErrors(join(PLAYBOOK, String(c.schema)), post);
    return errs.length ? errs : null;
  },

  word_count: (c, post) => {
    const n = wordCount(mainBlocks(post.body));
    return n < num(c, "min") || n > num(c, "max") ? [`${n} words`] : null;
  },

  words_per_cited_fact: (c, post) => {
    const blocks = mainBlocks(post.body);
    const facts = citedFacts(blocks).length;
    const words = wordCount(blocks);
    if (facts === 0) return ["no facts cited"];
    const ratio = words / facts;
    return ratio > num(c, "max") ? [`${words} words / ${facts} facts = ${ratio.toFixed(1)}`] : null;
  },

  forbidden_pattern: (c, post) => {
    const re = new RegExp(String(c.pattern), typeof c.flags === "string" ? c.flags : "");
    const scope =
      typeof c.field === "string"
        ? [{ where: c.field, text: String((post as unknown as Obj)[c.field] ?? "") }]
        : fields(post, false);
    const hits = scope.flatMap((f) => {
      const m = plain(f.text).match(re);
      return m ? [`${f.where}: "${m[0]}"`] : [];
    });
    return hits.length ? sample(hits) : null;
  },

  no_emoji: (c, post) => {
    const ranges = (c.codepoint_ranges as string[][]).map(([a, b]) => [parseInt(a, 16), parseInt(b, 16)]);
    const hits = fields(post, false).flatMap((f) => {
      for (const ch of f.text) {
        const cp = ch.codePointAt(0) ?? 0;
        if (ranges.some(([a, b]) => cp >= a && cp <= b)) return [`${f.where}: U+${cp.toString(16).toUpperCase()}`];
      }
      return [];
    });
    return hits.length ? sample(hits) : null;
  },

  numbers_in_facts: (c, post, fs) => {
    const pattern = String(c.pattern);
    const known = new Set(fs.facts.flatMap((f) => numberTokens(f.text, pattern)));
    const missing = fields(post, false).flatMap((f) =>
      numberTokens(f.text, pattern).filter((n) => !known.has(n)).map((n) => `${f.where}: ${n}`)
    );
    return missing.length ? sample(missing) : null;
  },

  urls_in_sources: (_c, post, fs) => {
    const allowed = new Set(fs.sources.map((s) => normUrl(s.url)));
    const bad = fields(post, true).flatMap((f) =>
      linksIn(f.text).filter((u) => !allowed.has(normUrl(u))).map((u) => `${f.where}: ${u}`)
    );
    return bad.length ? sample(bad) : null;
  },

  fact_refs_exist: (_c, post, fs) => {
    const ids = new Set(fs.facts.map((f) => f.id));
    const bad = post.body.flatMap((b, i) => (b.facts ?? []).filter((id) => !ids.has(id)).map((id) => `body/${i}: ${id}`));
    return bad.length ? sample(bad) : null;
  },

  blocks_with_digits_cite_facts: (_c, post) => {
    const bad = mainBlocks(post.body).flatMap((b) => {
      if (b.type === "heading") return [];
      const hasDigit = blockTexts(b).some((t) => /\d/.test(withoutUrls(t)));
      return hasDigit && !(b.facts ?? []).length ? [`body/${post.body.indexOf(b)}`] : [];
    });
    return bad.length ? sample(bad) : null;
  },

  distinct_sources_linked: (c, post, fs) => {
    const byUrl = new Map(fs.sources.map((s) => [normUrl(s.url), s.source_name]));
    const names = new Set(
      fields(post, true).flatMap((f) =>
        linksIn(f.text).map((u) => {
          const name = byUrl.get(normUrl(u));
          if (name) return name;
          try {
            return new URL(u).hostname;
          } catch {
            return u;
          }
        })
      )
    );
    return names.size < num(c, "min") ? [`${names.size} distinct sources linked`] : null;
  },

  sources_section: (_c, post, fs) => {
    const i = sourcesIndex(post.body);
    if (i === -1) return ["no level-2 'Sources' heading"];
    const tail = post.body.slice(i + 1);
    if (tail.length !== 1 || tail[0].type !== "list") return ["'Sources' must be followed by exactly one list, and nothing else"];
    const items = tail[0].items ?? [];
    const problems = items.filter((t) => linksIn(t).length === 0).map((t) => `item without a link: "${t}"`);
    const listed = new Set(items.flatMap(linksIn).map(normUrl));
    const byId = new Map(fs.facts.map((f) => [f.id, f]));
    for (const id of citedFacts(mainBlocks(post.body))) {
      const url = byId.get(id)?.source_url;
      if (url && !listed.has(normUrl(url))) problems.push(`cited source not listed: ${url} (${id})`);
    }
    return problems.length ? sample([...new Set(problems)]) : null;
  },

  first_block_is_lead: (_c, post) => {
    const b = post.body[0];
    return b && b.type === "paragraph" && b.lead === true ? null : ["body/0 is not a paragraph with lead: true"];
  },

  heading_count: (c, post) => {
    const n = post.body.filter((b) => b.type === "heading" && b.level === num(c, "level")).length;
    return n < num(c, "min") || n > num(c, "max") ? [`${n} level-${num(c, "level")} headings`] : null;
  },

  slug_not_in: (c, post, _fs, ctx) => {
    if (c.source !== "existing_slugs") throw new Error(`rubric ${c.id}: unknown source "${String(c.source)}"`);
    return ctx.existingSlugs.includes(post.slug) ? [`slug "${post.slug}" already exists`] : null;
  },
};

export function runRubric(post: Post, fs: Factsheet, rubric: Rubric, ctx: Context): { ok: boolean; results: Result[] } {
  const results: Result[] = rubric.deterministic.map((c) => {
    const fn = CHECKS[c.check];
    if (!fn) return { id: c.id, ok: false, message: `unknown check type "${c.check}" (fail closed)` };
    try {
      const details = fn(c, post, fs, ctx);
      return details ? { id: c.id, ok: false, message: c.message, details } : { id: c.id, ok: true, message: c.message };
    } catch (err) {
      return { id: c.id, ok: false, message: `check crashed: ${(err as Error).message}` };
    }
  });
  return { ok: results.every((r) => r.ok), results };
}

// ─── Generated files: envelope, factsheet, hero ───────────────────────────────

/** Splits a committed content/blog/generated/<slug>.json into the post and its envelope. */
function splitGenerated(raw: Obj): { post: Obj; envelope: Obj } {
  const post: Obj = {};
  const envelope: Obj = {};
  for (const [k, v] of Object.entries(raw)) (ENVELOPE_KEYS.includes(k) ? envelope : post)[k] = v;
  return { post, envelope };
}

function envelopeErrors(env: Obj): string[] {
  const errs: string[] = [];
  if (typeof env.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(env.date)) errs.push("date: must be YYYY-MM-DD");
  if (!isObj(env.hero) || typeof env.hero.alt !== "string" || !env.hero.alt || env.hero.alt.length > 120)
    errs.push("hero.alt: required, at most 120 characters");
  if (typeof env.playbook_sha !== "string" || !/^[0-9a-f]{7,40}$/.test(env.playbook_sha)) errs.push("playbook_sha: must be a git SHA");
  return errs;
}

/** Width and height of a WebP file, or null if it isn't one. */
function webpDims(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 30 || buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8X") return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
  if (chunk === "VP8 ") return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8L") {
    const bits = buf.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}

function handWrittenSlugs(): string[] {
  // Same parse as scripts/check-freshness.mjs: each post object opens with a 4-space `slug:`.
  return HAND_WRITTEN.flatMap((f) =>
    readFileSync(join(ROOT, f), "utf8")
      .split(/\n    slug: "/)
      .slice(1)
      .map((part) => part.slice(0, part.indexOf('"')))
  );
}

function changedGeneratedFiles(): Set<string> | null {
  const base = process.env.BASE_REF ?? "origin/main";
  try {
    const out = execFileSync("git", ["diff", "--name-only", "--diff-filter=AM", `${base}...HEAD`, "--", "content/blog/generated/"], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return new Set(out.split("\n").filter((l) => l.endsWith(".json")).map((l) => l.split("/").pop() as string));
  } catch {
    return null; // can't tell what changed, so run the full rubric on everything
  }
}

// ─── Modes ────────────────────────────────────────────────────────────────────

function loadRubric(): Rubric {
  return readJson(join(PLAYBOOK, "rubrics/post.json")) as Rubric;
}

function printResult(label: string, res: { ok: boolean; results: Result[] }): void {
  console.log(`${res.ok ? "PASS" : "FAIL"} ${label}`);
  for (const r of res.results.filter((x) => !x.ok)) {
    console.log(`  ✗ ${r.id}: ${r.message}`);
    for (const d of r.details ?? []) console.log(`      ${d}`);
  }
}

function runAll(): boolean {
  const failures: string[] = [];
  const rubric = loadRubric();
  const files = readdirSync(GENERATED_DIR).filter((f) => f.endsWith(".json")).sort();

  // Manifest must list exactly the JSON files in the directory.
  const index = readFileSync(join(GENERATED_DIR, "index.ts"), "utf8");
  const imports = new Map([...index.matchAll(/^import\s+(\w+)\s+from\s+"\.\/([a-z0-9-]+\.json)";$/gm)].map((m) => [m[2], m[1]]));
  const listed = new Set((index.match(/GENERATED_RAW[^=]*=\s*\[([^\]]*)\]/)?.[1] ?? "").split(",").map((s) => s.trim()).filter(Boolean));
  for (const f of files) if (!imports.has(f)) failures.push(`index.ts does not import ${f}`);
  for (const [f, name] of imports) {
    if (!files.includes(f)) failures.push(`index.ts imports missing file ${f}`);
    if (!listed.has(name)) failures.push(`index.ts imports ${f} but GENERATED_RAW does not list ${name}`);
  }
  if (listed.size !== imports.size) failures.push("GENERATED_RAW and the imports in index.ts disagree");

  const handSlugs = handWrittenSlugs();
  const genSlugs: string[] = [];
  const changed = changedGeneratedFiles();

  for (const f of files) {
    const rel = relative(ROOT, join(GENERATED_DIR, f));
    let raw: unknown;
    try {
      raw = readJson(join(GENERATED_DIR, f));
    } catch (err) {
      failures.push(`${rel}: invalid JSON (${(err as Error).message})`);
      continue;
    }
    if (!isObj(raw)) {
      failures.push(`${rel}: not an object`);
      continue;
    }
    const { post, envelope } = splitGenerated(raw);
    const slug = String(post.slug ?? "");
    genSlugs.push(slug);
    if (`${slug}.json` !== f) failures.push(`${rel}: file name does not match slug "${slug}"`);
    for (const e of envelopeErrors(envelope)) failures.push(`${rel}: ${e}`);
    for (const e of schemaErrors(join(PLAYBOOK, "schemas/post.schema.json"), post)) failures.push(`${rel}: schema ${e}`);

    const hero = join(ROOT, "public/blog", `${slug}.webp`);
    if (!existsSync(hero)) failures.push(`${rel}: hero public/blog/${slug}.webp is missing`);
    else {
      const size = statSync(hero).size;
      const dims = webpDims(readFileSync(hero));
      if (size > MAX_HERO_BYTES) failures.push(`${rel}: hero is ${size} bytes (max ${MAX_HERO_BYTES})`);
      if (!dims) failures.push(`${rel}: hero is not a WebP file`);
      else if (dims.width !== HERO_DIMS.width || dims.height !== HERO_DIMS.height)
        failures.push(`${rel}: hero is ${dims.width}x${dims.height}, expected ${HERO_DIMS.width}x${HERO_DIMS.height}`);
    }

    // Full rubric only for posts this PR adds or changes, so tuning the rubric
    // later can't retroactively fail posts that passed the version they shipped under.
    if (changed !== null && !changed.has(f)) continue;
    const fsPath = join(PLAYBOOK, "runs", `${String(envelope.date)}-${slug}.factsheet.json`);
    if (!existsSync(fsPath)) {
      failures.push(`${rel}: fact sheet ${relative(ROOT, fsPath)} is missing`);
      continue;
    }
    const factsheet = readJson(fsPath);
    const fsErrs = schemaErrors(join(PLAYBOOK, "schemas/factsheet.schema.json"), factsheet);
    if (fsErrs.length) {
      failures.push(...fsErrs.map((e) => `${relative(ROOT, fsPath)}: schema ${e}`));
      continue;
    }
    const others = [...handSlugs, ...files.filter((x) => x !== f).map((x) => x.replace(/\.json$/, ""))];
    const res = runRubric(post as unknown as Post, factsheet as Factsheet, rubric, { existingSlugs: others });
    printResult(rel, res);
    if (!res.ok) failures.push(`${rel}: rubric failed`);
  }

  const all = [...handSlugs, ...genSlugs];
  for (const s of new Set(all.filter((s, i) => all.indexOf(s) !== i))) failures.push(`duplicate slug across posts: ${s}`);

  console.log(`\n${files.length} generated post(s), ${changed === null ? "all" : changed.size} checked against the full rubric`);
  for (const f of failures) console.log(`✗ ${f}`);
  console.log(failures.length ? `FAILED (${failures.length})` : "OK");
  return failures.length === 0;
}

// Fixture patches: RFC 6902 add/replace/remove on JSON Pointers, plus "edit"
// (replace the first occurrence of `find` in the string at `path`; it must exist).
type Patch = { op: "add" | "replace" | "remove" | "edit"; path: string; value?: unknown; find?: string; replace?: string };

function applyPatch(doc: unknown, patch: Patch): void {
  const parts = patch.path.split("/").slice(1).map((p) => p.replace(/~1/g, "/").replace(/~0/g, "~"));
  const last = parts.pop() as string;
  let parent = doc as Obj | unknown[];
  for (const p of parts) parent = (Array.isArray(parent) ? parent[Number(p)] : parent[p]) as Obj | unknown[];
  if (parent === undefined) throw new Error(`patch path not found: ${patch.path}`);
  if (Array.isArray(parent)) {
    const i = last === "-" ? parent.length : Number(last);
    if (patch.op === "add") parent.splice(i, 0, patch.value);
    else if (patch.op === "remove") parent.splice(i, 1);
    else if (patch.op === "replace") parent[i] = patch.value;
    else parent[i] = editString(parent[i], patch);
  } else {
    if (patch.op === "remove") delete parent[last];
    else if (patch.op === "edit") parent[last] = editString(parent[last], patch);
    else parent[last] = patch.value;
  }
}

function editString(v: unknown, patch: Patch): string {
  if (typeof v !== "string" || patch.find === undefined || !v.includes(patch.find))
    throw new Error(`edit: "${patch.find}" not found at ${patch.path}`);
  return v.replace(patch.find, patch.replace ?? "");
}

function selfTest(): boolean {
  const dir = join(PLAYBOOK, "rubrics/fixtures");
  const spec = readJson(join(dir, "cases.json")) as {
    factsheet: string;
    base: string;
    existing_slugs: string[];
    cases: { name: string; patch?: Patch[]; factsheet_patch?: Patch[]; existing_slugs?: string[]; fail: string[] }[];
  };
  const rubric = loadRubric();

  let ok = true;
  const covered = new Set<string>();
  for (const c of spec.cases) {
    const post = readJson(join(dir, spec.base));
    const factsheet = readJson(join(dir, spec.factsheet));
    for (const p of c.patch ?? []) applyPatch(post, p);
    for (const p of c.factsheet_patch ?? []) applyPatch(factsheet, p);
    const fsErrs = schemaErrors(join(PLAYBOOK, "schemas/factsheet.schema.json"), factsheet);
    if (fsErrs.length) {
      console.log(`FAIL ${c.name}: fixture fact sheet fails its schema: ${fsErrs.join("; ")}`);
      ok = false;
      continue;
    }
    const res = runRubric(post as Post, factsheet as Factsheet, rubric, { existingSlugs: c.existing_slugs ?? spec.existing_slugs });
    const got = res.results.filter((r) => !r.ok).map((r) => r.id).sort();
    const want = [...c.fail].sort();
    const match = got.join() === want.join();
    c.fail.forEach((id) => covered.add(id));
    console.log(`${match ? "ok  " : "FAIL"} ${c.name}: failed [${got.join(", ")}]${match ? "" : `, expected [${want.join(", ")}]`}`);
    if (!match) {
      ok = false;
      for (const r of res.results.filter((x) => !x.ok)) console.log(`      ${r.id}: ${(r.details ?? [r.message]).join(" | ")}`);
    }
  }
  const uncovered = rubric.deterministic.map((c) => c.id).filter((id) => !covered.has(id));
  if (uncovered.length) {
    console.log(`FAIL no fixture exercises: ${uncovered.join(", ")}`);
    ok = false;
  }
  console.log(ok ? `OK (${spec.cases.length} cases)` : "FAILED");
  return ok;
}

function validateOne(args: string[]): boolean {
  const postPath = args[0];
  const fsFlag = args.indexOf("--factsheet");
  const slugFlag = args.indexOf("--existing-slugs");
  if (!postPath || fsFlag === -1 || !args[fsFlag + 1]) {
    console.error("usage: validate-blog-post.ts <post.json> --factsheet <factsheet.json> [--existing-slugs a,b]");
    process.exit(2);
  }
  const raw = readJson(postPath);
  if (!isObj(raw)) throw new Error("post is not a JSON object");
  const factsheet = readJson(args[fsFlag + 1]);
  const fsErrs = schemaErrors(join(PLAYBOOK, "schemas/factsheet.schema.json"), factsheet);
  const existing = slugFlag === -1 ? [] : (args[slugFlag + 1] ?? "").split(",").filter(Boolean);
  const res = fsErrs.length
    ? { ok: false, results: [{ id: "factsheet_schema", ok: false, message: "Fact sheet does not match its schema.", details: fsErrs }] }
    : runRubric(splitGenerated(raw).post as unknown as Post, factsheet as Factsheet, loadRubric(), { existingSlugs: existing });
  console.log(JSON.stringify(res, null, 2));
  return res.ok;
}

const argv = process.argv.slice(2);
const passed = argv[0] === "--all" ? runAll() : argv[0] === "--self-test" ? selfTest() : validateOne(argv);
process.exit(passed ? 0 : 1);

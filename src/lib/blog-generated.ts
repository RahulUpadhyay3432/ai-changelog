// ─── HERMES-generated blog posts ─────────────────────────────────────────────
// Maps the validated post JSON the weekly blog mission commits to
// content/blog/generated/<slug>.json (playbook/schemas/post.schema.json plus
// date, hero.alt, playbook_sha) onto BlogPost. The hero is always the committed
// public/blog/<slug>.webp, and readingMin is computed here, never taken from
// the file. The fact citations on blocks are for the validator and are dropped.
//
// A malformed post is skipped with a warning rather than failing the build: CI
// (scripts/validate-blog-post.ts) is the gate, this is only a backstop.

import { GENERATED_RAW } from "../../content/blog/generated";
import type { BlogBlock, BlogPost } from "./blog-content";

const WORDS_PER_MINUTE = 230;
const TAGS = new Set(["Analysis", "Explainer", "Roundup"]);

type Raw = Record<string, unknown>;

const isObj = (v: unknown): v is Raw => typeof v === "object" && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every((s) => typeof s === "string");

function toBlock(b: unknown): BlogBlock | null {
  if (!isObj(b)) return null;
  switch (b.type) {
    case "paragraph":
      return isStr(b.text) ? { type: "paragraph", text: b.text, ...(b.lead === true ? { lead: true } : {}) } : null;
    case "heading":
      return isStr(b.text) && (b.level === 2 || b.level === 3) ? { type: "heading", level: b.level, text: b.text } : null;
    case "list":
      return isStrArr(b.items) ? { type: "list", items: b.items, ...(b.ordered === true ? { ordered: true } : {}) } : null;
    case "callout":
      return isStr(b.text)
        ? { type: "callout", variant: "note", text: b.text, ...(isStr(b.title) ? { title: b.title } : {}) }
        : null;
    case "divider":
      return { type: "divider" };
    default:
      return null;
  }
}

function countWords(blocks: BlogBlock[]): number {
  const text = blocks
    .flatMap((b) => {
      if (b.type === "list") return b.items;
      if (b.type === "callout") return [b.title ?? "", b.text];
      if (b.type === "paragraph" || b.type === "heading") return [b.text];
      return [];
    })
    .join(" ")
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/[*`[\]]/g, "");
  return text.split(/\s+/).filter(Boolean).length;
}

function toPost(raw: unknown): BlogPost | null {
  if (!isObj(raw)) return null;
  const { slug, title, deck, tag, date, hero, body } = raw;
  if (!isStr(slug) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;
  if (!isStr(title) || !isStr(deck) || !isStr(tag) || !TAGS.has(tag)) return null;
  if (!isStr(date) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (!isObj(hero) || !isStr(hero.alt) || !Array.isArray(body)) return null;

  const blocks = body.map(toBlock);
  if (blocks.some((b) => b === null)) return null;
  const typed = blocks as BlogBlock[];

  return {
    slug,
    title,
    deck,
    date,
    readingMin: Math.max(1, Math.ceil(countWords(typed) / WORDS_PER_MINUTE)),
    tag,
    hero: { src: `/blog/${slug}.webp`, alt: hero.alt, credit: "Generated for Kapyn" },
    body: typed,
  };
}

export const GENERATED_POSTS: BlogPost[] = GENERATED_RAW.flatMap((raw) => {
  const post = toPost(raw);
  if (!post) {
    const slug = isObj(raw) && typeof raw.slug === "string" ? raw.slug : "(unknown)";
    console.warn(`[blog-generated] skipping malformed generated post: ${slug}`);
    return [];
  }
  return [post];
});

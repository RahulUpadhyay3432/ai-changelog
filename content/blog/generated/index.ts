// ─── Manifest of HERMES-generated blog posts ─────────────────────────────────
// Rewritten by the HERMES weekly blog mission (assembly step): one sorted
// `import pN from "./<slug>.json";` per post, all listed in GENERATED_RAW.
// CI (scripts/validate-blog-post.ts --all) fails if this list and the *.json
// files in this directory disagree. Posts are static imports, not fs reads,
// because BLOG_POSTS also ships to the client (search index, ⌘K palette).

import p1 from "./model-q-2-input-price-cut.json";

export const GENERATED_RAW: unknown[] = [
  p1,
];

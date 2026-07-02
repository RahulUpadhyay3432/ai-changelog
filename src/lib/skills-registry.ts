// Official Anthropic Agent Skills discovery — github.com/anthropics/skills.
//
// The skills marketplaces have 2M+ files of wildly mixed quality, so we DON'T
// mirror them. We auto-discover the OFFICIAL Anthropic skills (trusted, small,
// each with a real SKILL.md description) and fold them in alongside the curated
// editorial list. New official skills then appear without a code edit.

import type { SkillCategory } from "./radar-skills";

const OWNER_REPO = "anthropics/skills";
const SKILLS_DIR = "skills";

export interface OfficialSkill {
  slug: string; // directory name, e.g. "mcp-builder"
  name: string; // SKILL.md `name:` (fallback: prettified slug)
  description: string; // SKILL.md `description:`
  url: string; // repo tree URL
}

function prettify(slug: string): string {
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Parse the leading YAML frontmatter of a SKILL.md for name + description.
function parseFrontmatter(md: string): { name?: string; description?: string } {
  const m = md.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out: { name?: string; description?: string } = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(name|description)\s*:\s*(.+)$/);
    if (kv) out[kv[1] as "name" | "description"] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

// List the official skill directories, then read each SKILL.md for real copy.
// Bounded (a few dozen dirs) and run daily, so unauthenticated GitHub rate
// limits are fine. Best-effort: returns whatever it can, [] on total failure.
export async function fetchAnthropicSkills(): Promise<OfficialSkill[]> {
  let dirs: string[] = [];
  try {
    const res = await fetch(`https://api.github.com/repos/${OWNER_REPO}/contents/${SKILLS_DIR}`, {
      headers: { accept: "application/vnd.github+json" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as Array<{ name: string; type: string }>;
    dirs = json.filter((x) => x.type === "dir").map((x) => x.name);
  } catch {
    return [];
  }

  const settled = await Promise.allSettled(
    dirs.map(async (slug): Promise<OfficialSkill> => {
      const url = `https://github.com/${OWNER_REPO}/tree/main/${SKILLS_DIR}/${slug}`;
      try {
        const res = await fetch(
          `https://raw.githubusercontent.com/${OWNER_REPO}/main/${SKILLS_DIR}/${slug}/SKILL.md`,
          { next: { revalidate: 86400 } }
        );
        const md = res.ok ? await res.text() : "";
        const fm = parseFrontmatter(md);
        return {
          slug,
          name: fm.name?.trim() || prettify(slug),
          description: (fm.description ?? "").trim(),
          url,
        };
      } catch {
        return { slug, name: prettify(slug), description: "", url };
      }
    })
  );

  return settled
    .filter((s): s is PromiseFulfilledResult<OfficialSkill> => s.status === "fulfilled")
    .map((s) => s.value)
    .filter((s) => s.description.length > 0); // require real copy — quality gate
}

// Coarse keyword → SkillCategory mapping for discovered skills.
export function categorizeSkill(name: string, description: string): SkillCategory {
  const t = `${name} ${description}`.toLowerCase();
  const has = (...w: string[]) => w.some((x) => t.includes(x));
  if (has("spreadsheet", "excel", "xlsx", "csv", "data analysis", "chart")) return "Data & sheets";
  if (has("design", "canvas", "art", "theme", "frontend", "ui", "artifact", "visual", "logo")) return "Design & images";
  if (has("document", "docx", "pdf", "pptx", "presentation", "slide", "doc ", "co-author")) return "Productivity & docs";
  if (has("research", "analysis", "analyze", "paper", "citation")) return "Research & analysis";
  if (has("write", "writing", "editor", "copy", "content", "comms", "brand")) return "Writing & content";
  if (has("learn", "teach", "course", "tutor", "explain")) return "Learning";
  if (has("marketing", "social", "gif", "campaign", "seo")) return "Marketing & social";
  return "Coding & dev";
}

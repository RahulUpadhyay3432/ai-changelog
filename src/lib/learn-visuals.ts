// Per-concept visual identity for /explore + /learn — a colored icon tile.
//
// The glossary was a flat wall of grey cards. Giving each concept a category-
// palette color + a Lucide icon adds the visual variety that makes the grid
// feel designed, without stock imagery to curate. Curated icon/color for the 15
// seed concepts; every other entity gets a deterministic (stable) color by slug
// hash + a type-default icon, so newly-discovered concepts still look intentional.

import {
  Bot,
  Database,
  Boxes,
  SlidersHorizontal,
  Plug,
  Gauge,
  ThumbsUp,
  Maximize2,
  Waves,
  Layers,
  Cpu,
  MessageSquare,
  Network,
  GitBranch,
  Lightbulb,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { EntityType } from "@/lib/entities";

export interface ConceptVisual {
  Icon: LucideIcon;
  accent: string; // mid-tone — icon color; reads on both light & dark
  soft: string; // low-alpha accent — tile background
}

// Mid-tone accents drawn from the 9 category colors in categories.ts. Chosen so
// they read on both the dark tile-tint and a light background.
const PALETTE = [
  "#2563eb", // blue
  "#16a34a", // green
  "#ea580c", // orange
  "#0891b2", // cyan
  "#d97706", // amber
  "#7c3aed", // purple
  "#4f46e5", // indigo
  "#0f766e", // teal
  "#9333ea", // violet
] as const;

function softOf(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, 0.14)`;
}

// Curated: seed slug → [icon, palette index].
const SEED: Record<string, [LucideIcon, number]> = {
  agents: [Bot, 0],
  rag: [Database, 1],
  embeddings: [Boxes, 2],
  "vector-database": [Database, 3],
  "fine-tuning": [SlidersHorizontal, 4],
  mcp: [Plug, 6],
  quantization: [Gauge, 7],
  rlhf: [ThumbsUp, 1],
  "context-window": [Maximize2, 3],
  "diffusion-models": [Waves, 8],
  transformers: [Layers, 0],
  inference: [Cpu, 2],
  "prompt-engineering": [MessageSquare, 4],
  "mixture-of-experts": [Network, 6],
  "chain-of-thought": [GitBranch, 7],
};

// Stable, deterministic hash → palette index (same slug → same color always).
function hashIndex(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % PALETTE.length;
}

export function conceptVisual(slug: string, entityType: EntityType): ConceptVisual {
  const seeded = SEED[slug];
  if (seeded) {
    const [Icon, idx] = seeded;
    return { Icon, accent: PALETTE[idx], soft: softOf(PALETTE[idx]) };
  }
  const accent = PALETTE[hashIndex(slug)];
  const Icon = entityType === "technique" ? Wrench : Lightbulb;
  return { Icon, accent, soft: softOf(accent) };
}

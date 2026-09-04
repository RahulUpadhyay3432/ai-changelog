import type { Category, CategorySlug } from "./types";

export const CATEGORIES: Category[] = [
  {
    slug: "ai-models",
    name: "AI / Models",
    description: "LLM releases, benchmarks, capabilities, and model updates",
    icon: "Brain",
    colorAccent: "#7c3aed",
    colorBg: "#1a0533",
    colorLabel: "#c4b5fd",
  },
  {
    slug: "dev-tools",
    name: "Dev Tools",
    description: "Developer tools, APIs, SDKs, open-source libraries, and frameworks",
    icon: "Terminal",
    colorAccent: "#2563eb",
    colorBg: "#0d1f3c",
    colorLabel: "#60a5fa",
  },
  {
    slug: "open-source",
    name: "Open Source",
    description: "New tools, libraries, and projects gaining traction on GitHub",
    icon: "GitBranch",
    colorAccent: "#ea580c",
    colorBg: "#2d1200",
    colorLabel: "#fb923c",
  },
  {
    slug: "startups",
    name: "Startups",
    description: "New companies, product launches, and pivots",
    icon: "Rocket",
    colorAccent: "#16a34a",
    colorBg: "#0a2015",
    colorLabel: "#4ade80",
  },
  {
    slug: "research",
    name: "Research",
    description: "Papers, findings, benchmarks, and academic breakthroughs",
    icon: "FlaskConical",
    colorAccent: "#0891b2",
    colorBg: "#001f2e",
    colorLabel: "#22d3ee",
  },
  {
    slug: "funding-ma",
    name: "Funding & M&A",
    description: "Rounds, acquisitions, mergers, acqui-hires, and strategic investments",
    icon: "DollarSign",
    colorAccent: "#d97706",
    colorBg: "#2d1a00",
    colorLabel: "#fbbf24",
  },
  {
    slug: "big-tech",
    name: "Big Tech",
    description: "FAANG+, cloud providers, and enterprise AI platform moves",
    icon: "Building2",
    colorAccent: "#4f46e5",
    colorBg: "#0f0f2d",
    colorLabel: "#818cf8",
  },
  {
    slug: "infrastructure",
    name: "Infrastructure",
    description: "Chips, GPUs, data centers, cloud compute, and edge AI hardware",
    icon: "Server",
    colorAccent: "#0f766e",
    colorBg: "#001f1d",
    colorLabel: "#2dd4bf",
  },
  {
    slug: "policy",
    name: "Policy & Regulation",
    description: "AI governance, regulation, safety frameworks, and government orders",
    icon: "Shield",
    colorAccent: "#9333ea",
    colorBg: "#1e0a2e",
    colorLabel: "#d8b4fe",
  },
];

export const CATEGORY_TABS: { slug: CategorySlug; label: string }[] = [
  { slug: "all", label: "All" },
  { slug: "ai-models", label: "AI" },
  { slug: "dev-tools", label: "Dev Tools" },
  { slug: "open-source", label: "Open Source" },
  { slug: "startups", label: "Startups" },
  { slug: "research", label: "Research" },
  { slug: "funding-ma", label: "Funding & M&A" },
  { slug: "big-tech", label: "Big Tech" },
  { slug: "infrastructure", label: "Infrastructure" },
  { slug: "policy", label: "Policy" },
];

export function getCategoryBySlug(slug: CategorySlug): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

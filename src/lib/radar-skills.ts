// AI skills — a curated directory of the most useful "skills" you can add to an
// assistant: Claude Skills, custom GPTs, and Gemini Gems/features. Same editorial
// model as the MCP market and essentials: a static, hand-kept list, no ingestion.
// Grouped by what they DO (use-case), not by platform — each carries its platform
// as a tag. `url` is the skill/store page (stable id + open target + favicon host).
//
// Calm brand voice: verb-first, factual, no hype, no emoji in copy.

import type { CategorySlug } from "./types";

export type SkillPlatform = "Claude" | "GPT" | "Gemini" | "Multi";

export interface AiSkill {
  name: string;
  tagline: string; // one-line value
  description: string; // 2–3 sentence body for the detail sheet
  category: SkillCategory;
  platform: SkillPlatform;
  url: string; // store / skill page (stable id + open-site target)
}

export type SkillCategory =
  | "Writing & content"
  | "Coding & dev"
  | "Research & analysis"
  | "Design & images"
  | "Productivity & docs"
  | "Data & sheets"
  | "Learning"
  | "Marketing & social";

// Display order + emoji for the catalog's category sections / chips.
export const SKILL_CATEGORY_ORDER: SkillCategory[] = [
  "Writing & content", "Coding & dev", "Research & analysis", "Design & images",
  "Productivity & docs", "Data & sheets", "Learning", "Marketing & social",
];

export const SKILL_CATEGORY_EMOJI: Record<SkillCategory, string> = {
  "Writing & content": "✍️",
  "Coding & dev": "💻",
  "Research & analysis": "🔬",
  "Design & images": "🎨",
  "Productivity & docs": "📑",
  "Data & sheets": "📊",
  "Learning": "🎓",
  "Marketing & social": "📣",
};

// Use-case → accent slug, reusing the existing category palette (no new slug).
export const SKILL_CATEGORY_SLUG: Record<SkillCategory, CategorySlug> = {
  "Writing & content": "ai-models",
  "Coding & dev": "dev-tools",
  "Research & analysis": "research",
  "Design & images": "open-source",
  "Productivity & docs": "infrastructure",
  "Data & sheets": "funding-ma",
  "Learning": "big-tech",
  "Marketing & social": "startups",
};

export const AI_SKILLS: AiSkill[] = [
  // ── Writing & content ──────────────────────────────────────────────────────
  {
    name: "Write For Me",
    tagline: "Draft long-form copy to a target length and tone.",
    description: "A custom GPT for articles, emails and scripts. Hold a word count, adapt the tone, and rework sections without losing the thread.",
    category: "Writing & content", platform: "GPT",
    url: "https://chatgpt.com/g/g-B3hgivKK9-write-for-me",
  },
  {
    name: "Writing editor",
    tagline: "Sharpen drafts for clarity, grammar and flow.",
    description: "A prebuilt Gemini Gem that reviews your writing line by line — tightening structure, fixing grammar, and suggesting cleaner phrasing.",
    category: "Writing & content", platform: "Gemini",
    url: "https://gemini.google.com/app#writing-editor",
  },
  {
    name: "Word documents",
    tagline: "Generate and edit .docx with real formatting.",
    description: "A Claude Skill that produces proper Word files — headings, styles, tables and tracked structure — instead of plain text you have to reformat.",
    category: "Writing & content", platform: "Claude",
    url: "https://github.com/anthropics/skills/tree/main/document-skills/docx",
  },

  // ── Coding & dev ───────────────────────────────────────────────────────────
  {
    name: "Code Copilot",
    tagline: "Pair-program, debug and ship across languages.",
    description: "One of the most-used coding GPTs: writes and reviews code, explains errors, and works through a feature with you step by step.",
    category: "Coding & dev", platform: "GPT",
    url: "https://chatgpt.com/g/g-2DQzU5UZl-code-copilot",
  },
  {
    name: "Coding partner",
    tagline: "Explain, generate and review code as you build.",
    description: "A prebuilt Gemini Gem aimed at developers — scaffolds functions, walks through logic, and helps you debug without leaving the chat.",
    category: "Coding & dev", platform: "Gemini",
    url: "https://gemini.google.com/app#coding-partner",
  },
  {
    name: "MCP builder",
    tagline: "Scaffold a working MCP server from a spec.",
    description: "A Claude Skill that turns a description of the tools you want into a runnable Model Context Protocol server, wiring and boilerplate included.",
    category: "Coding & dev", platform: "Claude",
    url: "https://github.com/anthropics/skills/tree/main/mcp-builder",
  },
  {
    name: "Grimoire",
    tagline: "Build apps from a prompt, with a coding course built in.",
    description: "A popular GPT that ships small projects from a single line of intent and teaches the patterns behind them as you go.",
    category: "Coding & dev", platform: "GPT",
    url: "https://chatgpt.com/g/g-n7Rs0IK86-grimoire",
  },

  // ── Research & analysis ────────────────────────────────────────────────────
  {
    name: "Consensus",
    tagline: "Answer questions with evidence from real papers.",
    description: "A research GPT that searches peer-reviewed literature and summarises what the studies actually found, with citations you can follow.",
    category: "Research & analysis", platform: "GPT",
    url: "https://chatgpt.com/g/g-bo0FiWLY7-consensus",
  },
  {
    name: "Scholar GPT",
    tagline: "Search 200M+ papers and read them with you.",
    description: "Finds academic sources, extracts the key claims, and helps you critique methods — a fast first pass over a literature you don't know yet.",
    category: "Research & analysis", platform: "GPT",
    url: "https://chatgpt.com/g/g-kZ0eYXlJe-scholar-gpt",
  },
  {
    name: "Wolfram",
    tagline: "Compute exact answers with Wolfram|Alpha.",
    description: "Hands hard math, unit conversions and data lookups to the Wolfram engine, so the numbers are computed rather than guessed.",
    category: "Research & analysis", platform: "GPT",
    url: "https://chatgpt.com/g/g-0S5FXLyFN-wolfram",
  },
  {
    name: "Deep Research",
    tagline: "Plan, browse and compile a cited report.",
    description: "A Gemini capability that runs a multi-step web investigation on your behalf and returns a structured, sourced brief on the question.",
    category: "Research & analysis", platform: "Gemini",
    url: "https://gemini.google.com/app#deep-research",
  },
  {
    name: "AskYourPDF",
    tagline: "Chat with and cite any PDF or document.",
    description: "Upload a file and ask questions against it — the GPT pulls answers from the source and points back to the exact passages.",
    category: "Research & analysis", platform: "GPT",
    url: "https://chatgpt.com/g/g-q3Kbb4hr9-askyourpdf-research-assistant",
  },

  // ── Design & images ────────────────────────────────────────────────────────
  {
    name: "Image generator",
    tagline: "Generate and refine images from a description.",
    description: "A widely used GPT for art and product visuals — iterate on a prompt, adjust style and composition, and export the result.",
    category: "Design & images", platform: "GPT",
    url: "https://chatgpt.com/g/g-pmuQfob8d-image-generator",
  },
  {
    name: "Logo Creator",
    tagline: "Design clean logos and brand marks.",
    description: "Turns a name and a vibe into logo concepts and variations, with quick edits to colour, type and layout.",
    category: "Design & images", platform: "GPT",
    url: "https://chatgpt.com/g/g-gFt1ghYJl-logo-creator",
  },
  {
    name: "Diagrams: Show Me",
    tagline: "Render flowcharts and diagrams from text.",
    description: "Describe a system or process and get an editable diagram back — architecture, sequences and mind maps without a drawing tool.",
    category: "Design & images", platform: "GPT",
    url: "https://chatgpt.com/g/g-RsLpzPjMJ-show-me-diagrams",
  },

  // ── Productivity & docs ────────────────────────────────────────────────────
  {
    name: "PowerPoint decks",
    tagline: "Build polished slide decks, no template wrangling.",
    description: "A Claude Skill that generates real .pptx presentations — layouts, speaker notes and consistent styling — from an outline or brief.",
    category: "Productivity & docs", platform: "Claude",
    url: "https://github.com/anthropics/skills/tree/main/document-skills/pptx",
  },
  {
    name: "PDF tools",
    tagline: "Fill, merge and extract data from PDFs.",
    description: "A Claude Skill that reads and writes PDFs — pulling fields out of forms, filling them in, and combining files programmatically.",
    category: "Productivity & docs", platform: "Claude",
    url: "https://github.com/anthropics/skills/tree/main/document-skills/pdf",
  },
  {
    name: "ChatPRD",
    tagline: "Draft PRDs and product specs like a senior PM.",
    description: "A popular GPT that turns a rough idea into a structured product requirements doc — goals, user stories, scope and success metrics.",
    category: "Productivity & docs", platform: "GPT",
    url: "https://chatgpt.com/g/g-G5diVh62r-chatprd",
  },
  {
    name: "Gemini in Workspace",
    tagline: "Pull in Gmail, Docs, Drive and Calendar.",
    description: "Gemini's Workspace extensions let it summarise threads, find files and draft replies using your own Google account context.",
    category: "Productivity & docs", platform: "Gemini",
    url: "https://gemini.google.com/app#workspace",
  },

  // ── Data & sheets ──────────────────────────────────────────────────────────
  {
    name: "Excel spreadsheets",
    tagline: "Create .xlsx with formulas and charts.",
    description: "A Claude Skill that builds working spreadsheets — formulas, pivot-style summaries and charts — not just a table of numbers.",
    category: "Data & sheets", platform: "Claude",
    url: "https://github.com/anthropics/skills/tree/main/document-skills/xlsx",
  },
  {
    name: "Data Analyst",
    tagline: "Upload data and get charts and insights.",
    description: "OpenAI's official analysis GPT: load a CSV or spreadsheet and it cleans, explores and visualises it, explaining what stands out.",
    category: "Data & sheets", platform: "GPT",
    url: "https://chatgpt.com/g/g-HMNcP6w7d-data-analyst",
  },
  {
    name: "Gemini in Sheets",
    tagline: "Generate formulas and analyse Google Sheets.",
    description: "Inside Google Sheets, Gemini writes formulas, classifies rows and summarises ranges from a plain-language request.",
    category: "Data & sheets", platform: "Gemini",
    url: "https://gemini.google.com/app#sheets",
  },

  // ── Learning ───────────────────────────────────────────────────────────────
  {
    name: "Universal Primer",
    tagline: "Learn anything fast, from first principles.",
    description: "A well-loved GPT that teaches hard topics with analogies and a build-up of intuition, checking your understanding as it goes.",
    category: "Learning", platform: "GPT",
    url: "https://chatgpt.com/g/g-GbLbctpPz-universal-primer",
  },
  {
    name: "Learning coach",
    tagline: "Study any topic with guided practice.",
    description: "A prebuilt Gemini Gem that builds a study plan, quizzes you, and adapts the pace — a patient tutor for exam prep or a new field.",
    category: "Learning", platform: "Gemini",
    url: "https://gemini.google.com/app#learning-coach",
  },
  {
    name: "Career guide",
    tagline: "Explore roles and build a path into them.",
    description: "A prebuilt Gemini Gem for career moves — maps skills to roles, suggests next steps, and helps you prep for interviews.",
    category: "Learning", platform: "Gemini",
    url: "https://gemini.google.com/app#career-guide",
  },

  // ── Marketing & social ─────────────────────────────────────────────────────
  {
    name: "Canva",
    tagline: "Turn ideas into posts, decks and logos.",
    description: "The Canva GPT drafts on-brand social posts, presentations and graphics, then opens them in Canva to finish and export.",
    category: "Marketing & social", platform: "GPT",
    url: "https://chatgpt.com/g/g-alKfVrz9K-canva",
  },
  {
    name: "Brand guidelines",
    tagline: "Apply your fonts, colours and voice automatically.",
    description: "A Claude Skill that loads a company's brand kit and styles every output to match — the canonical example of a reusable skill.",
    category: "Marketing & social", platform: "Claude",
    url: "https://github.com/anthropics/skills#brand-guidelines",
  },
  {
    name: "Brainstormer",
    tagline: "Spin up campaign ideas, names and angles.",
    description: "A prebuilt Gemini Gem for ideation — generates concepts, names and hooks, then pressure-tests the strongest ones with you.",
    category: "Marketing & social", platform: "Gemini",
    url: "https://gemini.google.com/app#brainstormer",
  },
  {
    name: "Video GPT by VEED",
    tagline: "Generate short videos with script and voice.",
    description: "A popular GPT that writes a script, adds voiceover and captions, and renders a shareable short — useful for ads and social clips.",
    category: "Marketing & social", platform: "GPT",
    url: "https://chatgpt.com/g/g-Hkqnd7mFV-video-gpt-by-veed",
  },

  // ── Additional: Research & analysis ───────────────────────────────────────
  {
    name: "NotebookLM",
    tagline: "Ground a research session in your own documents.",
    description: "Google's AI research tool indexes your uploaded sources — papers, notes, PDFs, transcripts — and answers questions, writes briefings, and generates audio summaries based solely on what you provide.",
    category: "Research & analysis", platform: "Gemini",
    url: "https://notebooklm.google.com",
  },

  // ── Additional: Design & images ────────────────────────────────────────────
  {
    name: "Whimsical Diagrams",
    tagline: "Sketch flowcharts, mind maps and wireframes from text.",
    description: "One of the most popular design GPTs — describe a system or idea and get an editable diagram rendered in Whimsical: flowcharts, mind maps, org charts and sequence diagrams.",
    category: "Design & images", platform: "GPT",
    url: "https://chatgpt.com/g/g-vI2kaiM9N-whimsical-diagrams",
  },

  // ── Additional: Productivity & docs ───────────────────────────────────────
  {
    name: "Zapier",
    tagline: "Trigger 7,000+ app automations from the chat.",
    description: "Zapier's official GPT lets you run and manage Zaps in natural language — connect your tools, automate repetitive work, and check automation status without leaving the conversation.",
    category: "Productivity & docs", platform: "GPT",
    url: "https://chatgpt.com/g/g-zdG3jFbLN-zapier",
  },

  // ── Additional: Learning ───────────────────────────────────────────────────
  {
    name: "Speak",
    tagline: "Practice a foreign language with a real tutor dynamic.",
    description: "A popular language-learning GPT that runs realistic conversation practice, corrects errors in context, and adapts the lesson to your level and target language.",
    category: "Learning", platform: "GPT",
    url: "https://chatgpt.com/g/g-pe1WRgEi8-speak",
  },
  {
    name: "Mr. Ranedeer",
    tagline: "Adaptive tutor — builds a curriculum to your level.",
    description: "One of the most used learning GPTs: generates a structured lesson plan on any topic, explains concepts at the right depth, quizzes you, and adjusts as you improve.",
    category: "Learning", platform: "GPT",
    url: "https://chatgpt.com/g/g-pdWLoE6XT-mr-ranedeer",
  },
];

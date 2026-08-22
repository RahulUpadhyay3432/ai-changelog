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
    description: "A prebuilt Gemini Gem that reviews your writing line by line, tightening structure, fixing grammar, and suggesting cleaner phrasing.",
    category: "Writing & content", platform: "Gemini",
    url: "https://gemini.google.com/app#writing-editor",
  },
  {
    name: "Word documents",
    tagline: "Generate and edit .docx with real formatting.",
    description: "A Claude Skill that produces proper Word files, headings, styles, tables and tracked structure , instead of plain text you have to reformat.",
    category: "Writing & content", platform: "Claude",
    url: "https://github.com/anthropics/skills/tree/main/skills/docx",
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
    description: "A prebuilt Gemini Gem aimed at developers, scaffolds functions, walks through logic, and helps you debug without leaving the chat.",
    category: "Coding & dev", platform: "Gemini",
    url: "https://gemini.google.com/app#coding-partner",
  },
  {
    name: "MCP builder",
    tagline: "Scaffold a working MCP server from a spec.",
    description: "A Claude Skill that turns a description of the tools you want into a runnable Model Context Protocol server, wiring and boilerplate included.",
    category: "Coding & dev", platform: "Claude",
    url: "https://github.com/anthropics/skills/tree/main/skills/mcp-builder",
  },
  {
    name: "Grimoire",
    tagline: "Build apps from a prompt, with a coding course built in.",
    description: "A popular GPT that ships small projects from a single line of intent and teaches the patterns behind them as you go.",
    category: "Coding & dev", platform: "GPT",
    url: "https://chatgpt.com/g/g-n7Rs0IK86-grimoire",
  },
  {
    name: "Superpowers",
    tagline: "A full brainstorm-to-merge agentic dev workflow.",
    description: "A composable Claude Skills framework that guides the agent through brainstorm, design spec, plan, subagent-driven build, review and merge. One of the most-starred skill projects on GitHub.",
    category: "Coding & dev", platform: "Claude",
    url: "https://github.com/obra/superpowers",
  },
  {
    name: "Karpathy Behavioural",
    tagline: "Teach the agent to avoid the classic LLM coding pitfalls.",
    description: "Encodes Andrej Karpathy's observations about where LLMs go wrong writing software, think before coding, keep it simple, make surgical changes, verify the result , as rules the agent follows. One of the most-starred skill repos on GitHub.",
    category: "Coding & dev", platform: "Claude",
    url: "https://github.com/multica-ai/andrej-karpathy-skills",
  },
  {
    name: "Caveman",
    tagline: "Cut agent output tokens by writing terse, high-signal replies.",
    description: "A widely-starred Claude skill that reshapes the model's verbosity, 65% average output-token reduction across benchmarks , so long agent sessions stay cheaper and faster without losing the substance.",
    category: "Coding & dev", platform: "Claude",
    url: "https://github.com/JuliusBrussee/caveman",
  },
  {
    name: "Code reviewer",
    tagline: "Review a diff like a careful senior engineer.",
    description: "The most-installed community Claude Code skill of 2026, it walks a change for correctness, edge cases, and style, and reports findings ranked by severity instead of a wall of nitpicks.",
    category: "Coding & dev", platform: "Claude",
    url: "https://github.com/anthropics/skills",
  },
  {
    name: "Web app testing",
    tagline: "Drive your local app through Playwright to verify a change.",
    description: "An official Anthropic skill that tells Claude Code how to interact with a running web app via Playwright, inspect browser behaviour, and confirm a change actually works, not just that it compiles.",
    category: "Coding & dev", platform: "Claude",
    url: "https://github.com/anthropics/skills/tree/main/skills/webapp-testing",
  },
  {
    name: "Google Workspace CLI",
    tagline: "Drive all of Google Workspace from the assistant.",
    description: "A skill wrapping the gws CLI, which discovers every Google Workspace API and exposes them through one interface plus a built-in MCP server, Gmail, Docs, Sheets and Drive from natural language.",
    category: "Coding & dev", platform: "Claude",
    url: "https://github.com/anthropics/skills",
  },

  {
    name: "Claude API",
    tagline: "Build against the Claude API without reading the whole docs site.",
    description: "The official Anthropic skill for writing code that calls Claude, model selection, streaming, tool use and prompt caching, with the current parameter shapes rather than remembered ones.",
    category: "Coding & dev", platform: "Claude",
    url: "https://github.com/anthropics/skills/tree/main/skills/claude-api",
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
    description: "Finds academic sources, extracts the key claims, and helps you critique methods, a fast first pass over a literature you don't know yet.",
    category: "Research & analysis", platform: "GPT",
    url: "https://chatgpt.com/g/g-kZ0eYXlJe-scholar-gpt",
  },
  {
    name: "Deep Research",
    tagline: "Plan, browse and compile a cited report.",
    description: "A Gemini capability that runs a multi-step web investigation on your behalf and returns a structured, sourced brief on the question.",
    category: "Research & analysis", platform: "Gemini",
    url: "https://gemini.google.com/app#deep-research",
  },

  // ── Design & images ────────────────────────────────────────────────────────
  {
    name: "Frontend design",
    tagline: "Give the assistant a real design system and taste.",
    description: "The official Anthropic Claude Skill that hands the model a design philosophy, distinctive typography, purposeful colour, intentional motion , so generated UIs look designed rather than default.",
    category: "Design & images", platform: "Claude",
    url: "https://github.com/anthropics/skills/tree/main/skills/frontend-design",
  },
  {
    name: "Image generator",
    tagline: "Generate and refine images from a description.",
    description: "A widely used GPT for art and product visuals, iterate on a prompt, adjust style and composition, and export the result.",
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
    name: "Web artifacts builder",
    tagline: "Generate self-contained interactive web artifacts.",
    description: "The official Anthropic skill for building single-file HTML artifacts that run standalone, the successor to the older artifacts-builder path.",
    category: "Design & images", platform: "Claude",
    url: "https://github.com/anthropics/skills/tree/main/skills/web-artifacts-builder",
  },
  {
    name: "Canvas design",
    tagline: "Lay out visual compositions the model can reason about.",
    description: "An official Anthropic skill for canvas-based design work, giving the assistant structure for composition and layout rather than one-shot image prompts.",
    category: "Design & images", platform: "Claude",
    url: "https://github.com/anthropics/skills/tree/main/skills/canvas-design",
  },
  {
    name: "Theme factory",
    tagline: "Produce a coherent visual theme instead of ad-hoc colours.",
    description: "An official Anthropic skill that generates consistent colour, type and spacing systems, so generated interfaces share one visual language.",
    category: "Design & images", platform: "Claude",
    url: "https://github.com/anthropics/skills/tree/main/skills/theme-factory",
  },
  // ── Productivity & docs ────────────────────────────────────────────────────
  {
    name: "PowerPoint decks",
    tagline: "Build polished slide decks, no template wrangling.",
    description: "A Claude Skill that generates real .pptx presentations, layouts, speaker notes and consistent styling , from an outline or brief.",
    category: "Productivity & docs", platform: "Claude",
    url: "https://github.com/anthropics/skills/tree/main/skills/pptx",
  },
  {
    name: "PDF tools",
    tagline: "Fill, merge and extract data from PDFs.",
    description: "A Claude Skill that reads and writes PDFs, pulling fields out of forms, filling them in, and combining files programmatically.",
    category: "Productivity & docs", platform: "Claude",
    url: "https://github.com/anthropics/skills/tree/main/skills/pdf",
  },
  {
    name: "Gemini in Workspace",
    tagline: "Pull in Gmail, Docs, Drive and Calendar.",
    description: "Gemini's Workspace extensions let it summarise threads, find files and draft replies using your own Google account context.",
    category: "Productivity & docs", platform: "Gemini",
    url: "https://gemini.google.com/app#workspace",
  },

  {
    name: "Doc co-authoring",
    tagline: "Draft and revise long documents alongside the model.",
    description: "An official Anthropic skill for collaborative writing, the assistant edits in place, tracks what changed and keeps a consistent voice across a long document.",
    category: "Productivity & docs", platform: "Claude",
    url: "https://github.com/anthropics/skills/tree/main/skills/doc-coauthoring",
  },
  // ── Data & sheets ──────────────────────────────────────────────────────────
  {
    name: "Excel spreadsheets",
    tagline: "Create .xlsx with formulas and charts.",
    description: "A Claude Skill that builds working spreadsheets, formulas, pivot-style summaries and charts , not just a table of numbers.",
    category: "Data & sheets", platform: "Claude",
    url: "https://github.com/anthropics/skills/tree/main/skills/xlsx",
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
    description: "A prebuilt Gemini Gem that builds a study plan, quizzes you, and adapts the pace, a patient tutor for exam prep or a new field.",
    category: "Learning", platform: "Gemini",
    url: "https://gemini.google.com/app#learning-coach",
  },
  {
    name: "Career guide",
    tagline: "Explore roles and build a path into them.",
    description: "A prebuilt Gemini Gem for career moves, maps skills to roles, suggests next steps, and helps you prep for interviews.",
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
    description: "A Claude Skill that loads a company's brand kit and styles every output to match, the canonical example of a reusable skill.",
    category: "Marketing & social", platform: "Claude",
    url: "https://github.com/anthropics/skills#brand-guidelines",
  },
  {
    name: "Brainstormer",
    tagline: "Spin up campaign ideas, names and angles.",
    description: "A prebuilt Gemini Gem for ideation, generates concepts, names and hooks, then pressure-tests the strongest ones with you.",
    category: "Marketing & social", platform: "Gemini",
    url: "https://gemini.google.com/app#brainstormer",
  },

  // ── Additional: Research & analysis ───────────────────────────────────────
  {
    name: "NotebookLM",
    tagline: "Ground a research session in your own documents.",
    description: "Google's AI research tool indexes your uploaded sources, papers, notes, PDFs, transcripts , and answers questions, writes briefings, and generates audio summaries based solely on what you provide.",
    category: "Research & analysis", platform: "Gemini",
    url: "https://notebooklm.google.com",
  },

  // ── Additional: Design & images ────────────────────────────────────────────
  {
    name: "Whimsical Diagrams",
    tagline: "Sketch flowcharts, mind maps and wireframes from text.",
    description: "One of the most popular design GPTs, describe a system or idea and get an editable diagram rendered in Whimsical: flowcharts, mind maps, org charts and sequence diagrams.",
    category: "Design & images", platform: "GPT",
    url: "https://chatgpt.com/g/g-vI2kaiM9N-whimsical-diagrams",
  },
  // ── Refreshed July 2026 (GitHub trending + market scan) ──
  {
    name: "Hallmark",
    tagline: "Generate web UI that doesn't read as AI-generated.",
    description: "A design skill for Claude Code, Cursor, and Codex that picks a layout, applies a theme, and runs around 57 anti-pattern checks before emitting a frontend. It can build new UI, audit or redesign existing code, or extract design DNA from a screenshot. Built by Nutlope at Together AI; installs via npx skills add nutlope/hallmark.",
    category: "Design & images",
    platform: "Multi",
    url: "https://github.com/Nutlope/hallmark",
  },
  {
    name: "skill-creator",
    tagline: "Scaffold and package a new Claude Agent Skill to the current spec.",
    description: "Anthropic's official meta-skill that walks you through authoring a skill \u2014 writing the SKILL.md, adding reference files and scripts, and packaging it correctly. It is the standard entry point for building on the Agent Skills ecosystem, and the skill counterpart to the MCP builder.",
    category: "Coding & dev",
    platform: "Claude",
    url: "https://github.com/anthropics/skills/tree/main/skills/skill-creator",
  },
  {
    name: "Trail of Bits Security Skills",
    tagline: "Run professional security audits and static analysis from a coding agent.",
    description: "A Claude Code plugin marketplace from security firm Trail of Bits covering code auditing, static analysis with CodeQL and Semgrep, variant analysis, fix verification, and reverse engineering. It brings audit-grade security workflows into an agent. Maintained by the team behind Slither and Echidna.",
    category: "Coding & dev",
    platform: "Claude",
    url: "https://github.com/trailofbits/skills",
  },
  {
    name: "video-use",
    tagline: "Edit a folder of raw footage into a finished cut by chatting with an agent.",
    description: "A skill for Claude Code and Codex that cuts filler words and dead space, color-grades, adds subtitles, and overlays animation, returning a final.mp4. The model works from a timestamped transcript rather than raw frames. Built by the Browser Use team.",
    category: "Design & images",
    platform: "Multi",
    url: "https://github.com/browser-use/video-use",
  },

  // ── Refreshed August 2026 (GitHub trending — the skills ecosystem itself) ──
  {
    name: "Agent Skills",
    tagline: "Production engineering practice, encoded as skills a coding agent follows.",
    description: "Addy Osmani's collection of engineering skills for AI coding agents, testing discipline, performance work, review standards and refactoring patterns, written as rules an agent applies rather than advice a human reads. The most-starred community skills collection.",
    category: "Coding & dev",
    platform: "Claude",
    url: "https://github.com/addyosmani/agent-skills",
  },
  {
    name: "Reverse skill",
    tagline: "Route an agent through reverse engineering and authorised security testing.",
    description: "A skill router for reverse engineering, authorised penetration testing and security research, aimed at coding clients. It selects the right analysis path for a target rather than exposing one flat prompt. For authorised work only.",
    category: "Coding & dev",
    platform: "Claude",
    url: "https://github.com/zhaoxuya520/reverse-skill",
  },
  {
    name: "Google skills",
    tagline: "Work with Google products and technologies from an agent.",
    description: "Google's own Agent Skills collection covering its products and platforms, so an assistant handles Google-specific APIs and conventions from current documentation rather than recalled details.",
    category: "Coding & dev",
    platform: "Gemini",
    url: "https://github.com/google/skills",
  },
  {
    name: "Design engineering skills",
    tagline: "Give an agent a designer's eye for interface work.",
    description: "Emil Kowalski's skills for designers and engineers, covering animation, interaction detail and interface craft, the judgment that separates a working UI from a considered one.",
    category: "Design & images",
    platform: "Claude",
    url: "https://github.com/emilkowalski/skills",
  },
  {
    name: "Diagram design",
    tagline: "Draw 29 editorial diagram types instead of one default flowchart.",
    description: "A Claude Code skill with 29 editorial diagram types rendered as self-contained HTML and SVG, comparison matrices, timelines, system maps and more, each with a defined structure so the model picks a form that fits the argument.",
    category: "Design & images",
    platform: "Claude",
    url: "https://github.com/cathrynlavery/diagram-design",
  },
  {
    name: "Book to skill",
    tagline: "Turn a technical book into a skill the agent can study and apply.",
    description: "Converts a technical book PDF into a Claude Code skill, so the material becomes something an agent references while working rather than a file you meant to read.",
    category: "Learning",
    platform: "Claude",
    url: "https://github.com/virgiliojr94/book-to-skill",
  },
];

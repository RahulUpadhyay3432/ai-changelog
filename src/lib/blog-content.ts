// ─── Kapyn blog — hand-authored seed content ─────────────────────────────────
// The blog engine (Phase 2) will generate posts into a `blog_posts` table; until
// then these are hand-written seed posts. The (web)/blog routes read from here,
// so swapping the data source later is a drop-in change. Calm voice, sources
// cited, no hype — same rules as the rest of Kapyn.

export interface BlogTool {
  name: string;
  valueLine: string;
  url: string;
}

export interface BlogSection {
  heading: string;
  intro: string;
  tools: BlogTool[];
}

export interface BlogPost {
  slug: string;
  title: string;
  deck: string;
  /** ISO date */
  date: string;
  readingMin: number;
  tag: string;
  intro: string[];
  sections: BlogSection[];
  closing: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "ai-stack-for-indie-hackers-2026",
    title: "The AI stack for indie hackers in 2026",
    deck:
      "The exact tools — models, code assistants, infrastructure, and MCP servers — a solo builder actually needs. No survey. A prescription.",
    date: "2026-06-23",
    readingMin: 8,
    tag: "Guide",
    intro: [
      "The most confusing thing about building with AI in 2026 isn't the technology — it's the noise around it. Every week there's a new model, a new framework, a new primitive that promises to change everything. Most of it doesn't matter at indie scale. Here is the stack a solo builder actually needs.",
      "This is not a list of every option. It's a recommendation. Everything here has been through real projects, not demos. The goal is a stack you can hold in your head, ship with in a weekend, and not regret in three months.",
    ],
    sections: [
      {
        heading: "Pick one model and commit to it",
        intro:
          "The model layer feels like a weekly decision. It isn't. For most indie work, Claude Sonnet is the right call — it reads code well, follows multi-step instructions, and doesn't hallucinate APIs you have to look up. GPT-4o mini is the right call when you're optimizing for cost at scale: fast, cheap, and good enough for classification and extraction tasks. Gemini 2.5 Flash is the right call when the bill needs to be zero — the free tier is genuinely usable for prototyping. Pick one for the current project and don't switch mid-build.",
        tools: [
          { name: "Anthropic API", valueLine: "Claude Sonnet — the model that reads code like a senior engineer.", url: "https://www.anthropic.com/api" },
          { name: "OpenAI API", valueLine: "GPT-4o mini — fast, cheap, right for high-volume extraction and classification.", url: "https://platform.openai.com" },
          { name: "Google AI Studio", valueLine: "Gemini 2.5 Flash — capable, free tier, good for prototyping before you have a budget.", url: "https://aistudio.google.com" },
        ],
      },
      {
        heading: "Your code assistant stack",
        intro:
          "The pairing that works: Cursor for navigating and editing the file tree, Claude Code for terminal-first, multi-step tasks — refactors, migrations, adding an entire feature with context across ten files. They complement each other. Don't try to replace either with the other. Windsurf is the alternative if Cursor's pricing bothers you — same model access, slightly different UX philosophy, worth a week of comparison before you commit.",
        tools: [
          { name: "Cursor", valueLine: "AI-native code editor — the fastest way to navigate and edit a codebase with LLM assistance.", url: "https://cursor.com" },
          { name: "Claude Code", valueLine: "Terminal-first AI coding agent — best for multi-file refactors and long-horizon tasks.", url: "https://www.anthropic.com/claude-code" },
          { name: "Windsurf", valueLine: "AI code editor from Codeium — solid Cursor alternative with a different collaboration model.", url: "https://codeium.com/windsurf" },
        ],
      },
      {
        heading: "Infrastructure that disappears",
        intro:
          "Vercel for frontend and API routes — Next.js on its home turf, zero-config deploys, built-in cron jobs, edge middleware. Supabase for everything else: Postgres, auth, file storage, realtime, Edge Functions — free to $25/month covers most indie projects end to end. Railway is the right fallback if you need more control: deploy anything via Dockerfile, no config overhead, pricing that doesn't punish you for running always-on servers.",
        tools: [
          { name: "Vercel", valueLine: "Zero-config deployment for Next.js — cron, edge middleware, and analytics included.", url: "https://vercel.com" },
          { name: "Supabase", valueLine: "Postgres + auth + storage + realtime as a managed service. Replaces your backend.", url: "https://supabase.com" },
          { name: "Railway", valueLine: "Deploy anything via Dockerfile with no platform config — the escape hatch when Vercel isn't enough.", url: "https://railway.app" },
        ],
      },
      {
        heading: "Auth in a morning",
        intro:
          "Don't build auth from scratch. The attack surface is real and the maintenance tail is long. Clerk is the fastest path for most projects — prebuilt React components, handles email/password, OAuth, passkeys, and MFA out of the box, generous free tier up to 10,000 monthly active users. Better Auth is the open-source self-hosted alternative if you'd rather own the code and run it on your own database — same features, no vendor lock-in.",
        tools: [
          { name: "Clerk", valueLine: "Drop-in auth components for React — email, OAuth, passkeys, and MFA, all handled.", url: "https://clerk.com" },
          { name: "Better Auth", valueLine: "Open-source auth framework — own your session data, deploy on your own database.", url: "https://www.better-auth.com" },
        ],
      },
      {
        heading: "The MCP servers worth wiring up now",
        intro:
          "Model Context Protocol is the emerging standard for giving AI agents structured access to tools and data sources. In 2026, three servers are worth wiring into Claude Code or any MCP-compatible client before reaching for anything more complex: the filesystem server (read and write local files by path), the fetch server (let the model make HTTP requests and read the response), and the Supabase server (query and mutate your database rows directly in conversation). These three together cover the majority of what an AI coding agent needs to be genuinely useful.",
        tools: [
          { name: "MCP Filesystem", valueLine: "Gives AI agents read/write access to local files — the foundation of any coding workflow.", url: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem" },
          { name: "MCP Fetch", valueLine: "Lets an AI agent make HTTP requests and read the response — essential for API testing and scraping.", url: "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch" },
          { name: "Supabase MCP", valueLine: "Query and mutate your Supabase database directly from an AI agent conversation.", url: "https://github.com/supabase-community/supabase-mcp" },
        ],
      },
      {
        heading: "Skip LangChain. Use the Vercel AI SDK.",
        intro:
          "LangChain adds abstraction overhead that only pays off at team scale — chains, agents, callbacks, and retrieval components that take longer to understand than the underlying API calls they wrap. For a solo builder on Next.js, the Vercel AI SDK is the right choice: it handles streaming, tool calling, and multi-step agent loops with a small, readable API, and it's maintained by the same team as your deployment platform. For pure backend work without a UI, call the provider SDK directly — the overhead of an orchestration framework rarely pays for itself on a one-person project.",
        tools: [
          { name: "Vercel AI SDK", valueLine: "Streaming, tool calling, and agent loops for Next.js — the right abstraction for solo AI projects.", url: "https://sdk.vercel.ai" },
        ],
      },
    ],
    closing:
      "The stack isn't what makes a product — the product makes the product. But the right stack gets out of your way and keeps the decision load low. Every tool here has one job, does it well, and won't become a liability when you need to move fast. Find them all on the Radar.",
  },
  {
    slug: "why-ai-tool-directories-are-useless",
    title: "Why most AI tool directories are useless — and what we did differently",
    deck:
      "Futurepedia lists 50,000 tools. That number is not a feature. Here's the curation problem nobody in the AI directory space is talking about.",
    date: "2026-06-22",
    readingMin: 5,
    tag: "Opinion",
    intro: [
      "Futurepedia lists more than 50,000 AI tools. There's An AI For That has tens of thousands more. Product Hunt has catalogued every AI launch since 2020. And yet — ask a working engineer which AI tool to use for a specific job, and the answer they trust is from a colleague, a tweet, or a Slack message. Not a directory.",
      "That gap is the whole story. Most AI tool directories are SEO farms dressed as products. Here's what went wrong, and what a useful directory actually looks like.",
    ],
    sections: [
      {
        heading: "The 50,000-tool trap",
        intro:
          "When a directory has 50,000 entries, it has made a deliberate choice: quantity over signal. The implicit promise — 'everything is here' — is achieved by listing everything that exists. But the user's problem was never 'I need to know that this tool exists.' It was 'I need to know which of these five similar tools is the right one for my situation.' A 50,000-entry directory doesn't answer that. It restates the problem at larger scale. You arrived with a question and left with a longer list to evaluate.",
        tools: [],
      },
      {
        heading: "The description problem",
        intro:
          "Pull up any five tool pages on a large AI directory. The descriptions will read like this: 'ToolName is an AI-powered platform that helps teams accomplish X more efficiently with the power of artificial intelligence.' That sentence contains no information. It doesn't tell you what the tool actually does, who it's for, when to reach for it, or what makes it meaningfully different from the three tools listed next to it. Most of these descriptions are generated by crawling the tool's homepage and summarizing with GPT. They're fluent and empty — SEO text shaped like product knowledge.",
        tools: [],
      },
      {
        heading: "What we built instead",
        intro:
          "Every entry on Kapyn Radar earns its place. The value line — the single sentence under each tool's name — answers one question: what is this for, specifically? Not the category it belongs to. Not the founder's pitch. What you would actually use it for, in a sentence plain enough that a colleague could read it over your shoulder and immediately understand. Entries are cross-linked: if a tool runs on a specific model, we link to the model. If two tools solve the same problem, they sit in the same section side by side so you can compare them directly. Nothing is listed because it exists — only because someone should know it exists.",
        tools: [
          { name: "Kapyn Radar", valueLine: "Curated AI tool directory — every entry hand-picked, every value line written by a human.", url: "https://kapyn.app/radar" },
        ],
      },
      {
        heading: "The standard we hold every entry to",
        intro:
          "One question. Would a thoughtful engineer recommend this to a colleague, unprompted, because it genuinely solved a real problem better than the alternatives — not because it got press coverage, not because the founder submitted it, not because it landed on Product Hunt? If yes, it belongs on the Radar. If no, it doesn't. That standard keeps the count low and the signal high. Some well-funded, well-marketed tools aren't here because the underlying product hasn't earned the recommendation. Some obscure projects with small communities are here because they solve a real problem and nobody is talking about them yet. Curation is a point of view. Listing everything is the absence of one.",
        tools: [],
      },
    ],
    closing:
      "A directory with 50,000 entries and a directory with 500 entries can describe the same world. One of them is a monument to comprehensiveness. The other is useful. We'd rather be useful.",
  },
  {
    slug: "tools-every-vibe-coder-should-know",
    title: "Tools every vibe coder should know",
    deck:
      "A working set of free front-end tools — the well-known and the deliberately niche — for shipping interfaces that don't look like a template.",
    date: "2026-06-21",
    readingMin: 6,
    tag: "Guide",
    intro: [
      "The gap between a project that looks like a template and one that looks considered is rarely the framework. It's the small, often niche tools a builder reaches for — a component you didn't have to design, a background that took a minute instead of an afternoon, a typeface nobody else is using yet.",
      "Here's a working set, from the names most people already know to the deliberately niche. Everything here is free and copy-paste friendly, and every one lives on the Radar — so you can save the ones that fit into a Loadout and find them again.",
    ],
    sections: [
      {
        heading: "Components you copy and ship",
        intro:
          "Why hand-build a pricing section or an animated hero when someone has already designed, animated, and accessibility-checked it? These libraries hand you whole blocks — copy the code, own it, move on.",
        tools: [
          { name: "Magic UI", valueLine: "Animated React and Tailwind components for landing pages.", url: "https://magicui.design" },
          { name: "Cult UI", valueLine: "Copy-paste animated React and shadcn components and blocks.", url: "https://cult-ui.com" },
          { name: "Motion Primitives", valueLine: "Animation-first React components built on Framer Motion.", url: "https://motion-primitives.com" },
          { name: "Watermelon UI", valueLine: "React components built on Tailwind, Radix, and Framer Motion.", url: "https://ui.watermelon.sh" },
          { name: "Componentry", valueLine: "Animated React components built with Tailwind and Framer Motion.", url: "https://componentry.fun" },
          { name: "Uiverse", valueLine: "Thousands of free CSS and Tailwind UI elements to copy.", url: "https://uiverse.io" },
        ],
      },
      {
        heading: "Icons and type that kill the template look",
        intro:
          "Two of the fastest ways a project stops looking generic: one consistent icon set instead of a mix of three, and a typeface most people haven't seen yet.",
        tools: [
          { name: "Phosphor Icons", valueLine: "Open-source icon family in six weights, including duotone.", url: "https://phosphoricons.com" },
          { name: "Fontshare", valueLine: "Free professional-grade fonts from the Indian Type Foundry.", url: "https://fontshare.com" },
        ],
      },
      {
        heading: "Motion, without the wiring",
        intro:
          "Movement is what makes an interface feel alive — but writing keyframes and transition logic by hand is a tax. These two remove it.",
        tools: [
          { name: "Animista", valueLine: "Preview, tune, and copy ready-made CSS keyframe animations.", url: "https://animista.net" },
          { name: "AutoAnimate", valueLine: "Add smooth enter, leave, and move transitions in one line.", url: "https://auto-animate.formkit.com" },
        ],
      },
      {
        heading: "Backgrounds that feel expensive",
        intro:
          "A flat background reads as unfinished; a considered one reads as premium. Generate it in a minute, export, and drop it in.",
        tools: [
          { name: "Shader Gradient", valueLine: "Configure animated WebGL gradient backgrounds and export them.", url: "https://shadergradient.co" },
          { name: "Mesh Gradient", valueLine: "Create warped shader mesh gradients to export as backgrounds.", url: "https://meshgradient.com" },
          { name: "Haikei", valueLine: "Generate SVG wave, blob, and gradient backgrounds to export.", url: "https://haikei.app" },
          { name: "Pattern Monster", valueLine: "Customize repeatable SVG patterns, then copy the CSS or SVG.", url: "https://pattern.monster" },
        ],
      },
    ],
    closing:
      "None of this is about adding more — it's about reaching for the right small tool at the right moment. Save the ones that fit into a Loadout on the Radar, and they'll be there the next time you're staring at a blank section.",
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/** Flat list of every tool across a post's sections — for index teasers / chips. */
export function postTools(post: BlogPost): BlogTool[] {
  return post.sections.flatMap((s) => s.tools);
}

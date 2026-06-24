// ─── Kapyn blog — hand-authored seed content ─────────────────────────────────
// The blog engine (Phase 2) will generate posts into a `blog_posts` table; until
// then these are hand-written seed posts. The (web)/blog routes read from here,
// so swapping the data source later is a drop-in change. Calm voice, sourced,
// no hype — same rules as the rest of Kapyn.
//
// Content is a flat array of typed blocks (`BlogBlock`) so a post can be a real
// article — multi-paragraph prose, lists, pull quotes, callouts, code, figures,
// diagrams, and tool grids — not a fixed heading→paragraph→cards template.
// Inline markup inside `text` fields: **bold**, [label](url), `code`.

export interface BlogTool {
  name: string;
  valueLine: string;
  url: string;
}

export type BlogBlock =
  | { type: "paragraph"; text: string; lead?: boolean }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "callout"; variant: "note" | "tip" | "warning"; title?: string; text: string }
  | { type: "code"; lang?: string; code: string }
  | { type: "tools"; title?: string; items: BlogTool[] }
  | { type: "diagram"; chart: string; caption?: string }
  | { type: "figure"; src: string; alt: string; caption?: string; credit?: string }
  | { type: "divider" };

export interface BlogPost {
  slug: string;
  title: string;
  deck: string;
  /** ISO date */
  date: string;
  readingMin: number;
  tag: string;
  hero: { src: string; alt: string; credit?: string };
  body: BlogBlock[];
}

// Unsplash served via plain <img> (no next/image remote config needed). Sizing
// params keep payloads small; the standard Unsplash license permits free use.
const U = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=75&auto=format&fit=crop`;

export const BLOG_POSTS: BlogPost[] = [
  // ─── Guide: indie stack ───────────────────────────────────────────────────
  {
    slug: "ai-stack-for-indie-hackers-2026",
    title: "The AI stack for indie hackers in 2026",
    deck:
      "The exact tools — models, code assistants, infrastructure, and MCP servers — a solo builder actually needs. No survey. A prescription.",
    date: "2026-06-23",
    readingMin: 9,
    tag: "Guide",
    hero: {
      src: U("1517180102446-f3ece451e9d8"),
      alt: "A glowing blue circuit board, abstract technology",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The most confusing thing about building with AI in 2026 isn't the technology — it's the noise around it. Every week brings a new model, a new framework, a new primitive that promises to change everything. Most of it does not matter at indie scale.",
      },
      {
        type: "paragraph",
        text: "This is not a list of every option. It is a recommendation — a stack you can hold in your head, ship with over a weekend, and not regret in three months. Everything here has been through real projects, not demos. Where there's a fork in the road, I'll tell you which way I'd go and why.",
      },
      {
        type: "callout",
        variant: "note",
        title: "How to read this",
        text: "Each section ends with the specific tools I'd reach for. Pick **one per layer** and move on. The fastest way to stall a solo project is to keep re-litigating decisions that don't move the product forward.",
      },

      { type: "heading", level: 2, text: "Pick one model and commit to it" },
      {
        type: "paragraph",
        text: "The model layer feels like a weekly decision. It isn't. Switching models mid-build means re-testing every prompt, re-tuning every output parser, and re-learning a new set of failure modes — all for a marginal quality delta that your users will never notice. Choose once, at the start, based on the job in front of you.",
      },
      {
        type: "paragraph",
        text: "For most indie work, **Claude Sonnet** is the right call. It reads code like a senior engineer, follows multi-step instructions without losing the thread, and rarely invents APIs you then have to go and verify. When you're optimizing for cost at volume — classification, extraction, the boring high-throughput stuff — **GPT-4o mini** is fast and cheap and good enough. And when the bill needs to be zero, **Gemini 2.5 Flash** has a free tier that is genuinely usable for prototyping.",
      },
      {
        type: "quote",
        text: "Choosing a model is not a technology decision. It's a decision to stop choosing, so you can start building.",
      },
      {
        type: "tools",
        items: [
          { name: "Anthropic API", valueLine: "Claude Sonnet — the model that reads code like a senior engineer.", url: "https://www.anthropic.com/api" },
          { name: "OpenAI API", valueLine: "GPT-4o mini — fast, cheap, right for high-volume extraction and classification.", url: "https://platform.openai.com" },
          { name: "Google AI Studio", valueLine: "Gemini 2.5 Flash — capable, free tier, good for prototyping before you have a budget.", url: "https://aistudio.google.com" },
        ],
      },

      { type: "heading", level: 2, text: "Your code assistant stack" },
      {
        type: "paragraph",
        text: "This is the one place I'll tell you to run two tools at once, because they do genuinely different jobs. **Cursor** is where you live: navigating the file tree, making edits in context, asking questions about code you're staring at. **Claude Code** is the terminal-first agent you hand the bigger, scarier tasks to — a migration across ten files, adding a whole feature, a refactor that needs to hold context no editor tab can.",
      },
      {
        type: "paragraph",
        text: "They complement each other; don't try to make one do the other's job. If Cursor's pricing rubs you the wrong way, **Windsurf** is a real alternative with the same model access and a slightly different collaboration philosophy — worth a week of side-by-side before you commit.",
      },
      {
        type: "figure",
        src: U("1498050108023-c5249f4df085", 1400),
        alt: "A laptop open to a code editor",
        caption: "Two assistants, two jobs: one for editing in context, one for long-horizon agentic work.",
        credit: "Unsplash",
      },
      {
        type: "tools",
        items: [
          { name: "Cursor", valueLine: "AI-native code editor — the fastest way to navigate and edit a codebase with LLM assistance.", url: "https://cursor.com" },
          { name: "Claude Code", valueLine: "Terminal-first AI coding agent — best for multi-file refactors and long-horizon tasks.", url: "https://www.anthropic.com/claude-code" },
          { name: "Windsurf", valueLine: "AI code editor from Codeium — solid Cursor alternative with a different collaboration model.", url: "https://codeium.com/windsurf" },
        ],
      },

      { type: "heading", level: 2, text: "Infrastructure that disappears" },
      {
        type: "paragraph",
        text: "The best infrastructure for a solo builder is the kind you forget exists. You want to push code and have it be live; you want a database that's already there; you want auth, storage, and cron without standing up a single server. In 2026 that's a two-product answer for the vast majority of projects.",
      },
      {
        type: "paragraph",
        text: "**Vercel** for the frontend and API routes — Next.js on its home turf, zero-config deploys, built-in cron, edge middleware. **Supabase** for everything behind it: Postgres, auth, file storage, realtime, and Edge Functions. Free to roughly $25/month carries most indie projects end to end. Reach for **Railway** only when you need to run something always-on or off the serverless happy path — deploy any Dockerfile, no platform ceremony.",
      },
      {
        type: "tools",
        items: [
          { name: "Vercel", valueLine: "Zero-config deployment for Next.js — cron, edge middleware, and analytics included.", url: "https://vercel.com" },
          { name: "Supabase", valueLine: "Postgres + auth + storage + realtime as a managed service. Replaces your backend.", url: "https://supabase.com" },
          { name: "Railway", valueLine: "Deploy anything via Dockerfile with no platform config — the escape hatch when serverless isn't enough.", url: "https://railway.app" },
        ],
      },

      { type: "heading", level: 2, text: "Auth in a morning, not a month" },
      {
        type: "paragraph",
        text: "Do not build auth from scratch. The attack surface is real, the edge cases are endless, and the maintenance tail outlives the dopamine of getting login working. This is a solved problem — buy or borrow the solution and spend your hours on the thing only you can build.",
      },
      {
        type: "list",
        items: [
          "**Clerk** — the fastest path for most projects. Prebuilt React components handle email, OAuth, passkeys, and MFA; the free tier runs to 10,000 monthly active users.",
          "**Better Auth** — the open-source, self-hosted alternative. Same feature set, your database, no vendor lock-in. Reach for it when owning the session data matters.",
        ],
      },
      {
        type: "tools",
        items: [
          { name: "Clerk", valueLine: "Drop-in auth components for React — email, OAuth, passkeys, and MFA, all handled.", url: "https://clerk.com" },
          { name: "Better Auth", valueLine: "Open-source auth framework — own your session data, deploy on your own database.", url: "https://www.better-auth.com" },
        ],
      },

      { type: "heading", level: 2, text: "The MCP servers worth wiring up now" },
      {
        type: "paragraph",
        text: "Model Context Protocol is the emerging standard for giving an AI agent structured access to tools and data. The ecosystem is large and growing, but you do not need most of it. Three servers cover the majority of what a coding agent needs to be genuinely useful — wire these into Claude Code (or any MCP client) before you reach for anything fancier.",
      },
      {
        type: "code",
        lang: "json",
        code: `// claude_desktop_config.json — three servers, most of the value
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/project"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}`,
      },
      {
        type: "paragraph",
        text: "The **filesystem** server lets the agent read and write files by path — the foundation of any real coding workflow. **Fetch** lets it make HTTP requests and read the response, which turns it into a capable API tester and researcher. And the **Supabase** server lets it query and mutate your database rows directly in the conversation, so \"add a column and backfill it\" becomes a sentence instead of a chore.",
      },
      {
        type: "tools",
        items: [
          { name: "MCP Filesystem", valueLine: "Gives AI agents read/write access to local files — the foundation of any coding workflow.", url: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem" },
          { name: "MCP Fetch", valueLine: "Lets an AI agent make HTTP requests and read the response — essential for API testing and scraping.", url: "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch" },
          { name: "Supabase MCP", valueLine: "Query and mutate your Supabase database directly from an AI agent conversation.", url: "https://github.com/supabase-community/supabase-mcp" },
        ],
      },

      { type: "heading", level: 2, text: "Skip LangChain. Use the Vercel AI SDK." },
      {
        type: "paragraph",
        text: "This one is opinionated, so let me be direct. **LangChain** adds abstraction that only pays off at team scale — chains, agents, callbacks, and retrieval components that take longer to understand than the API calls they wrap. On a one-person project, that's a tax with no return.",
      },
      {
        type: "paragraph",
        text: "On Next.js, the **Vercel AI SDK** is the right abstraction: streaming, tool calling, and multi-step agent loops behind a small, readable API, maintained by the same team as your deployment platform. For pure backend work with no UI, skip the framework entirely and call the provider SDK directly — the orchestration overhead rarely earns its keep solo.",
      },
      {
        type: "callout",
        variant: "warning",
        title: "The frameworks-as-resume-padding trap",
        text: "Adopting a heavy orchestration framework because it's what \"serious\" teams use is a common way to lose a weekend. Match the tool to the project in front of you, not the company you imagine you'll become.",
      },
      {
        type: "tools",
        items: [
          { name: "Vercel AI SDK", valueLine: "Streaming, tool calling, and agent loops for Next.js — the right abstraction for solo AI projects.", url: "https://sdk.vercel.ai" },
        ],
      },

      { type: "divider" },
      {
        type: "paragraph",
        text: "The stack isn't what makes a product — the product makes the product. But the right stack gets out of your way and keeps the decision load low. Every tool here has one job, does it well, and won't become a liability when you need to move fast. Pick one per layer, ship something this weekend, and find them all on the [Radar](/radar/browse).",
      },
    ],
  },

  // ─── Opinion: directories ─────────────────────────────────────────────────
  {
    slug: "why-ai-tool-directories-are-useless",
    title: "Why most AI tool directories are useless — and what we did differently",
    deck:
      "Futurepedia lists 50,000 tools. That number is not a feature. Here's the curation problem nobody in the AI directory space is talking about.",
    date: "2026-06-22",
    readingMin: 6,
    tag: "Opinion",
    hero: {
      src: U("1499750310107-5fef28a66643"),
      alt: "A minimal desk with a laptop, overhead view",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "Futurepedia lists more than 50,000 AI tools. There's An AI For That has tens of thousands more. Product Hunt has catalogued every AI launch since 2020. And yet — ask a working engineer which tool to use for a specific job, and the answer they trust comes from a colleague, a tweet, or a Slack thread. Not a directory.",
      },
      {
        type: "paragraph",
        text: "That gap is the whole story. Most AI tool directories are SEO farms wearing the costume of a product. They rank, they collect affiliate clicks, and they leave you exactly as undecided as you arrived. Here is what goes wrong, and what a directory looks like when it's built to be used instead of indexed.",
      },

      { type: "heading", level: 2, text: "The 50,000-tool trap" },
      {
        type: "paragraph",
        text: "When a directory has 50,000 entries, it has made a deliberate choice: quantity over signal. The implicit promise — \"everything is here\" — is delivered by listing everything that exists. But your problem was never \"I need to know this tool exists.\" It was \"I need to know which of these five similar tools is right for my situation.\"",
      },
      {
        type: "paragraph",
        text: "A 50,000-entry directory doesn't answer that question. It restates it at larger scale. You came with a decision to make and left with a longer list to evaluate. The work the directory was supposed to do — narrowing — got quietly handed back to you.",
      },
      {
        type: "quote",
        text: "You arrived with a question and left with a longer list. That's not a catalogue doing its job. That's a catalogue outsourcing its job to you.",
      },

      { type: "heading", level: 2, text: "The description problem" },
      {
        type: "paragraph",
        text: "Pull up any five tool pages on a large AI directory. The descriptions read like this:",
      },
      {
        type: "callout",
        variant: "note",
        text: "\"ToolName is an AI-powered platform that helps teams accomplish more efficiently with the power of artificial intelligence.\"",
      },
      {
        type: "paragraph",
        text: "That sentence contains no information. It doesn't tell you what the tool does, who it's for, when to reach for it, or how it differs from the three tools listed beside it. Most of these blurbs are generated by crawling the homepage and summarizing with an LLM. They are fluent and empty — SEO text shaped like product knowledge, optimized for a crawler, useless to a human with a decision to make.",
      },
      {
        type: "figure",
        src: U("1460925895917-afdab827c52f", 1400),
        alt: "An analytics dashboard on a laptop screen",
        caption: "Optimized for crawlers, not for the person trying to choose.",
        credit: "Unsplash",
      },

      { type: "heading", level: 2, text: "What we built instead" },
      {
        type: "paragraph",
        text: "Every entry on Kapyn Radar earns its place. The value line — the single sentence under each tool's name — answers exactly one question: what is this for, specifically? Not the category it belongs to. Not the founder's pitch. What you would actually use it for, written plainly enough that a colleague could read it over your shoulder and get it instantly.",
      },
      {
        type: "list",
        items: [
          "**Human value lines.** Every one is written by a person who has used the tool or knows the space — not summarized from a homepage.",
          "**Cross-linked entries.** If a tool runs on a specific model, we link to the model. If two tools solve the same problem, they sit side by side so you can compare.",
          "**Nothing listed for existing.** An entry is here because someone should know about it — not because it shipped.",
        ],
      },
      {
        type: "tools",
        items: [
          { name: "Kapyn Radar", valueLine: "Curated AI tool directory — every entry hand-picked, every value line written by a human.", url: "https://kapyn.app/radar" },
        ],
      },

      { type: "heading", level: 2, text: "The standard we hold every entry to" },
      {
        type: "paragraph",
        text: "One question decides it. **Would a thoughtful engineer recommend this to a colleague, unprompted, because it genuinely solved a real problem better than the alternatives** — not because it got press, not because the founder submitted it, not because it trended on Product Hunt? If yes, it belongs on the Radar. If no, it doesn't.",
      },
      {
        type: "paragraph",
        text: "That standard keeps the count low and the signal high. Some well-funded, well-marketed tools aren't here, because the product hasn't earned the recommendation yet. Some obscure projects with tiny communities are here, because they solve a real problem and nobody is talking about them. Curation is a point of view. Listing everything is the absence of one.",
      },

      { type: "divider" },
      {
        type: "paragraph",
        text: "A directory with 50,000 entries and a directory with 500 entries can describe the same world. One is a monument to comprehensiveness. The other is useful. We'd rather be useful — [see for yourself](/radar/browse).",
      },
    ],
  },

  // ─── Guide: vibe coder tools ──────────────────────────────────────────────
  {
    slug: "tools-every-vibe-coder-should-know",
    title: "Tools every vibe coder should know",
    deck:
      "A working set of free front-end tools — the well-known and the deliberately niche — for shipping interfaces that don't look like a template.",
    date: "2026-06-21",
    readingMin: 7,
    tag: "Guide",
    hero: {
      src: U("1561070791-2526d30994b5"),
      alt: "Colorful paint strokes blending together",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The gap between a project that looks like a template and one that looks considered is rarely the framework. It's the small, often niche tools a builder reaches for — a component you didn't have to design, a background that took a minute instead of an afternoon, a typeface nobody else is using yet.",
      },
      {
        type: "paragraph",
        text: "Here's a working set, from the names most people already know to the deliberately obscure. Everything is free and copy-paste friendly, and every one lives on the [Radar](/radar/browse) — so you can save the ones that fit and find them again. Reach for them the moment you're staring at a blank section.",
      },

      { type: "heading", level: 2, text: "Components you copy and ship" },
      {
        type: "paragraph",
        text: "Why hand-build a pricing section or an animated hero when someone has already designed, animated, and accessibility-checked it? These libraries hand you whole blocks. You copy the code, you own it, you move on — and you skip the slowest part of front-end work, which is getting the first version of a component onto the screen.",
      },
      {
        type: "tools",
        items: [
          { name: "Magic UI", valueLine: "Animated React and Tailwind components for landing pages.", url: "https://magicui.design" },
          { name: "Cult UI", valueLine: "Copy-paste animated React and shadcn components and blocks.", url: "https://cult-ui.com" },
          { name: "Motion Primitives", valueLine: "Animation-first React components built on Framer Motion.", url: "https://motion-primitives.com" },
          { name: "Watermelon UI", valueLine: "React components built on Tailwind, Radix, and Framer Motion.", url: "https://ui.watermelon.sh" },
          { name: "Componentry", valueLine: "Animated React components built with Tailwind and Framer Motion.", url: "https://componentry.fun" },
          { name: "Uiverse", valueLine: "Thousands of free CSS and Tailwind UI elements to copy.", url: "https://uiverse.io" },
        ],
      },
      {
        type: "callout",
        variant: "tip",
        title: "Own it, don't depend on it",
        text: "Copy-paste libraries beat installed component kits for one reason: the code lives in your repo, so you can bend it to your design instead of fighting a package's defaults.",
      },

      { type: "heading", level: 2, text: "Icons and type that kill the template look" },
      {
        type: "paragraph",
        text: "Two of the fastest ways a project stops looking generic: one consistent icon set instead of a mix of three, and a typeface most people haven't seen yet. Both are nearly free to adopt and both punch far above their effort.",
      },
      {
        type: "figure",
        src: U("1487058792275-0ad4aaf24ca7", 1400),
        alt: "Colorful lines of code on a dark screen",
        caption: "A single icon family and an unfamiliar typeface do more for \"considered\" than any amount of CSS.",
        credit: "Unsplash",
      },
      {
        type: "tools",
        items: [
          { name: "Phosphor Icons", valueLine: "Open-source icon family in six weights, including duotone.", url: "https://phosphoricons.com" },
          { name: "Fontshare", valueLine: "Free professional-grade fonts from the Indian Type Foundry.", url: "https://fontshare.com" },
        ],
      },

      { type: "heading", level: 2, text: "Motion, without the wiring" },
      {
        type: "paragraph",
        text: "Movement is what makes an interface feel alive — but hand-writing keyframes and transition logic is a tax most solo projects can't afford to pay on every element. These two remove the tax: one gives you ready-made CSS animations to tune and copy, the other adds enter, leave, and move transitions to a list in a single line.",
      },
      {
        type: "tools",
        items: [
          { name: "Animista", valueLine: "Preview, tune, and copy ready-made CSS keyframe animations.", url: "https://animista.net" },
          { name: "AutoAnimate", valueLine: "Add smooth enter, leave, and move transitions in one line.", url: "https://auto-animate.formkit.com" },
        ],
      },

      { type: "heading", level: 2, text: "Backgrounds that feel expensive" },
      {
        type: "paragraph",
        text: "A flat background reads as unfinished; a considered one reads as premium. The difference is usually a minute of work, not an afternoon. Generate a gradient, mesh, or pattern, export it, and drop it behind your hero — the whole page levels up.",
      },
      {
        type: "quote",
        text: "Polish is rarely one big move. It's twenty small ones, each reachable in under a minute if you know where the tool lives.",
      },
      {
        type: "tools",
        items: [
          { name: "Shader Gradient", valueLine: "Configure animated WebGL gradient backgrounds and export them.", url: "https://shadergradient.co" },
          { name: "Mesh Gradient", valueLine: "Create warped shader mesh gradients to export as backgrounds.", url: "https://meshgradient.com" },
          { name: "Haikei", valueLine: "Generate SVG wave, blob, and gradient backgrounds to export.", url: "https://haikei.app" },
          { name: "Pattern Monster", valueLine: "Customize repeatable SVG patterns, then copy the CSS or SVG.", url: "https://pattern.monster" },
        ],
      },

      { type: "divider" },
      {
        type: "paragraph",
        text: "None of this is about adding more — it's about reaching for the right small tool at the right moment. Save the ones that fit into a Loadout on the [Radar](/radar/browse), and they'll be there the next time the blank section is staring back at you.",
      },
    ],
  },

  // ─── Architecture: AI tech stack ──────────────────────────────────────────
  {
    slug: "best-ai-tech-stack-for-any-product-2026",
    title: "The AI tech stack for any product in 2026",
    deck:
      "A pragmatic blueprint — from frontend to LLM layer to observability — for building AI-powered products that ship, scale, and don't embarrass you.",
    date: "2026-06-20",
    readingMin: 9,
    tag: "Architecture",
    hero: {
      src: U("1451187580459-43490279c0fa"),
      alt: "A glowing network of connections wrapping a dark globe",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "Every builder eventually asks the same question: what do I actually wire together? The answer in 2026 is simpler than it looks. The ecosystem has converged on a short list of composable primitives — pick one from each layer and you're most of the way there.",
      },
      {
        type: "paragraph",
        text: "This isn't a beginner tutorial. It's the blueprint experienced builders actually use, with honest notes on where each choice gets you and where it costs you. Here is the whole shape of it before we go layer by layer.",
      },
      {
        type: "diagram",
        caption: "The five layers — frontend, data, LLM, deployment, and observability — and how a request flows through them.",
        chart: `flowchart TD
  U([User]) --> F["Next.js App Router\n(Vercel Edge)"]
  F --> DB[("Supabase\nPostgres + pgvector")]
  F --> LLM["LLM API\nAnthropic · OpenAI\nOpenRouter"]
  LLM --> STR["Streaming response"]
  STR --> F
  DB --> VEC["Vector search\nRAG retrieval"]
  VEC --> LLM
  F --> MON["PostHog · Sentry\nObservability"]`,
      },

      { type: "heading", level: 2, text: "Frontend" },
      {
        type: "paragraph",
        text: "**Next.js App Router** is the de facto standard, and for an AI product the reasons compound. Vercel deploys it in seconds, edge caching absorbs most of your traffic, server components keep secrets on the server, and the AI SDK gives you token streaming with almost no plumbing. For UI, reach for **Radix** primitives under a custom theme rather than a heavy component library — you inherit correct, accessible behavior and keep full control of the look.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "Stream early",
        text: "An AI feature that streams tokens feels twice as fast as one that waits for the full response, even at identical total latency. Wire streaming in on day one — retrofitting it later touches every layer.",
      },
      {
        type: "tools",
        items: [
          { name: "Next.js", valueLine: "App Router, RSC, and built-in API routes — the standard React framework for production apps.", url: "https://nextjs.org" },
          { name: "Vercel", valueLine: "Deploy Next.js globally with zero config — built-in CDN, preview URLs, and cron support.", url: "https://vercel.com" },
          { name: "Radix UI", valueLine: "Unstyled, accessible component primitives — own the look, inherit the behavior.", url: "https://radix-ui.com" },
          { name: "Framer Motion", valueLine: "Production-grade animation for React — springs, gestures, and layout transitions.", url: "https://www.framer.com/motion/" },
        ],
      },

      { type: "heading", level: 2, text: "Backend & database" },
      {
        type: "paragraph",
        text: "**Supabase** gives you Postgres, auth, storage, and **pgvector** in a single hosted product. That last piece is the one that matters for AI: your embeddings live in the same database as your rows, so retrieval is a SQL query, not a second system to operate. No separate vector database to provision, sync, and pay for.",
      },
      {
        type: "code",
        lang: "sql",
        code: `-- Retrieval is just SQL when embeddings live next to your data
select id, title, summary
from documents
order by embedding <=> $1   -- cosine distance to the query vector
limit 8;`,
      },
      {
        type: "paragraph",
        text: "For heavier ingestion — queues, rate limiting, background jobs — add **Upstash** (serverless Redis and Kafka). If you outgrow Supabase's Postgres or want a database-per-PR-branch workflow, **Neon** is the serverless Postgres to graduate to, with branching and zero cold start.",
      },
      {
        type: "tools",
        items: [
          { name: "Supabase", valueLine: "Postgres + auth + storage + pgvector. The fastest path to a production-ready backend.", url: "https://supabase.com" },
          { name: "Upstash", valueLine: "Serverless Redis and Kafka — rate limiting, queues, and pub/sub without managing infra.", url: "https://upstash.com" },
          { name: "Neon", valueLine: "Serverless Postgres with branching — a database per PR branch, zero cold start.", url: "https://neon.tech" },
        ],
      },

      { type: "heading", level: 2, text: "The AI & LLM layer" },
      {
        type: "paragraph",
        text: "Route through **OpenRouter** unless you have a strong reason not to. One API gives you fallback across providers, unified billing, and access to every frontier model — which means a model outage or a price change is a config tweak, not an incident. For structured outputs and tool use, **Claude** consistently produces the most reliable JSON. For embeddings, `text-embedding-3-small` is fast and cheap enough for almost every use case.",
      },
      {
        type: "quote",
        text: "Treat the model as a swappable dependency, not a foundation. The teams that move fastest are the ones who can change models without changing code.",
      },
      {
        type: "tools",
        items: [
          { name: "OpenRouter", valueLine: "One API for 100+ LLMs — switch models without code changes, unified billing.", url: "https://openrouter.ai" },
          { name: "Vercel AI SDK", valueLine: "Streaming AI responses with built-in support for tool use, RSC, and multiple providers.", url: "https://sdk.vercel.ai" },
          { name: "LangChain", valueLine: "Composable chains and agents — useful when you need multi-step reasoning or RAG pipelines.", url: "https://www.langchain.com" },
          { name: "Instructor", valueLine: "Guaranteed structured outputs from LLMs — Pydantic/Zod schemas with automatic retries.", url: "https://python.useinstructor.com" },
        ],
      },

      { type: "heading", level: 2, text: "Deployment & observability" },
      {
        type: "paragraph",
        text: "Vercel handles deployment, so observability is the part most teams under-invest in — and then regret. Three tools answer the three questions you'll ask every week: did it ship, are people using it, and what broke?",
      },
      {
        type: "list",
        items: [
          "**PostHog** — product analytics, funnels, feature flags, and session replay. Answers \"are people using it?\"",
          "**Sentry** — error tracking with full stack traces. Answers \"what broke?\" before users tell you.",
          "**Axiom** — serverless log ingestion at any scale, with structured queries and no ops overhead.",
        ],
      },
      {
        type: "tools",
        items: [
          { name: "PostHog", valueLine: "Open-source product analytics — events, funnels, feature flags, and session replay.", url: "https://posthog.com" },
          { name: "Sentry", valueLine: "Error tracking with full stack traces — catch what breaks before users report it.", url: "https://sentry.io" },
          { name: "Axiom", valueLine: "Serverless log ingestion at any scale — structured queries, zero operational overhead.", url: "https://axiom.co" },
        ],
      },

      { type: "divider" },
      {
        type: "paragraph",
        text: "This stack isn't magic — it's the combination that eliminates the most decisions. You're not choosing between 30 databases; you're choosing between Supabase and Neon. Start with the defaults here. The moment you outgrow one, you'll know exactly why and exactly what to replace it with — and that clarity is worth more than any single tool on the list.",
      },
    ],
  },

  // ─── Design: vibe-coding checklist ────────────────────────────────────────
  {
    slug: "vibe-coding-design-checklist",
    title: "How to make sure your vibe-coded project doesn't suck design-wise",
    deck:
      "The handful of decisions that separate a project that looks shipped from one that looks like a demo. Practical, visual, and opinionated.",
    date: "2026-06-22",
    readingMin: 7,
    tag: "Design",
    hero: {
      src: U("1558655146-9f40138edfeb"),
      alt: "Abstract geometric color shapes on a dark background",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "AI coding tools are extraordinary at generating functional code. They're far weaker at generating considered design. The result is everywhere: a sea of projects that work but look slightly off — too much contrast in the wrong places, font sizes that don't scale, paddings that feel arbitrary.",
      },
      {
        type: "paragraph",
        text: "This won't turn you into a designer. But it will stop the specific mistakes that make otherwise solid projects look unfinished. The decisions below are the ones with the highest ratio of polish-per-minute — start here, in this order.",
      },
      {
        type: "diagram",
        caption: "The order matters: lock the system first, then layout, then test on a real phone.",
        chart: `flowchart LR
  A["Start design"] --> B{"Using a\ndesign system?"}
  B -- Yes --> C["shadcn/ui or\nRadix + Tailwind"]
  B -- No --> D["Pick ONE\naccent color"]
  C --> E["Dark or light\nbackground?"]
  D --> E
  E --> F["Set font scale:\nbody 16-18px\nheadings 24-32px"]
  F --> G["Check mobile\n430px width"]
  G --> H{"Looks good\non phone?"}
  H -- No --> F
  H -- Yes --> I["Ship it"]`,
      },

      { type: "heading", level: 2, text: "Color and typography" },
      {
        type: "paragraph",
        text: "Most design mistakes trace back to two things: too many colors and too many font sizes. The fix is restraint. Pick **one** accent color, define **three** text shades (primary, body, muted), and enforce a type scale of about four sizes. That's the entire system — and a small, consistent system reads as intentional in a way a large, ad-hoc one never will.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "The three-shade rule",
        text: "On a dark UI, one near-white for headings, one soft grey for body, one dim grey for metadata. If you're reaching for a fourth, you probably want a weight change, not a new color.",
      },
      {
        type: "tools",
        items: [
          { name: "Realtime Colors", valueLine: "Visualize a full color palette live on a sample UI before committing to it.", url: "https://www.realtimecolors.com" },
          { name: "Fontpair", valueLine: "Curated font pairings that actually work — see them together before picking.", url: "https://www.fontpair.co" },
          { name: "Type Scale", valueLine: "Generate a modular type scale from a base size and ratio — copy the CSS vars.", url: "https://typescale.com" },
          { name: "Radix Colors", valueLine: "12-step accessible color scales, dark mode included — drop into any design system.", url: "https://www.radix-ui.com/colors" },
        ],
      },

      { type: "heading", level: 2, text: "Layout and spacing" },
      {
        type: "paragraph",
        text: "Inconsistent spacing is the single most common tell that a project was vibe-coded. The cure is a base unit. Use **4px or 8px for everything** — padding, gap, margin — so every measurement is a multiple of one number. Arbitrary values like 13px or 17px are what make a layout feel subtly wrong even when nobody can point to why.",
      },
      {
        type: "quote",
        text: "Consistency is cheaper than taste. You don't need a designer's eye if every number on the page is a multiple of four.",
      },
      {
        type: "tools",
        items: [
          { name: "Tailwind CSS", valueLine: "Utility-first CSS with a built-in 4px spacing scale — makes consistent spacing automatic.", url: "https://tailwindcss.com" },
          { name: "Every Layout", valueLine: "CSS layout primitives (Stack, Sidebar, Grid) that work at every viewport size.", url: "https://every-layout.dev" },
        ],
      },

      { type: "heading", level: 2, text: "Component quality" },
      {
        type: "paragraph",
        text: "A few components define the entire feel of a product: the primary button, the input, and the card. Get these three right and everything else inherits the quality. Get them wrong and no amount of polish elsewhere will save the impression.",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "**Button** — 12–14px border-radius, 500–600 font-weight, generous horizontal padding (16px or more), an obvious hover and active state.",
          "**Input** — same border-radius as the button, a visible focus ring, comfortable height (40px+), placeholder text that's dimmer than typed text.",
          "**Card** — a subtle border instead of a hard drop shadow, consistent internal padding, a corner radius that matches the buttons inside it.",
        ],
      },
      {
        type: "tools",
        items: [
          { name: "shadcn/ui", valueLine: "Copy-paste components built on Radix — you own the code, you control the style.", url: "https://ui.shadcn.com" },
          { name: "Radix UI", valueLine: "Unstyled accessible primitives — the behavior is correct, the look is yours to define.", url: "https://radix-ui.com" },
          { name: "Lucide React", valueLine: "Clean, consistent icon set — 1000+ icons that all feel like they belong together.", url: "https://lucide.dev" },
        ],
      },

      { type: "heading", level: 2, text: "Mobile-first testing" },
      {
        type: "paragraph",
        text: "Most vibe-coded projects are built and reviewed at desktop width, then quietly fall apart on a phone — where most of the traffic actually is. Catch it before anyone else does: open DevTools, set the viewport to 430×932 (iPhone 15 Pro), and scroll every page top to bottom.",
      },
      {
        type: "callout",
        variant: "warning",
        title: "What to look for at 430px",
        text: "Text too small to read comfortably, tap targets under 44px or overlapping, content overflowing the viewport, and navigation that breaks below 480px. Fix these before you ship — not after a user reports them.",
      },
      {
        type: "tools",
        items: [
          { name: "Polypane", valueLine: "Browser for developers — test multiple viewports simultaneously, inspect spacing visually.", url: "https://polypane.app" },
          { name: "BrowserStack", valueLine: "Real device testing across 3000+ device/browser combinations — catch what DevTools misses.", url: "https://www.browserstack.com" },
          { name: "Storybook", valueLine: "Build and test UI components in isolation — see every state, every viewport, every theme.", url: "https://storybook.js.org" },
        ],
      },

      { type: "divider" },
      {
        type: "paragraph",
        text: "Design polish isn't about talent — it's about decisions made consistently. Lock the palette, enforce the spacing scale, sweat the three core components, and test at 430px. That's roughly 80% of the gap between \"looks like a demo\" and \"looks like a product\" — and every tool you need to close it is on the [Radar](/radar/browse).",
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/** Flat list of every tool across a post's `tools` blocks — for index teasers. */
export function postTools(post: BlogPost): BlogTool[] {
  return post.body.flatMap((b) => (b.type === "tools" ? b.items : []));
}

/** Stable, URL-safe id for a heading — shared by the renderer and the TOC. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Level-2 headings, for building an "On this page" table of contents. */
export function tableOfContents(post: BlogPost): { id: string; text: string }[] {
  return post.body
    .filter((b): b is Extract<BlogBlock, { type: "heading" }> => b.type === "heading" && b.level === 2)
    .map((b) => ({ id: slugify(b.text), text: b.text }));
}

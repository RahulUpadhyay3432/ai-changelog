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
    title: "Why most AI tool directories are useless, and what we did differently",
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

  // ─── SEO: Best AI coding assistants ─────────────────────────────────────────
  {
    slug: "best-ai-coding-assistants-2026",
    title: "Best AI coding assistants in 2026",
    deck: "The five tools that actually belong in a developer's workflow, ranked by what they do best, not by hype cycle position.",
    date: "2026-06-25",
    readingMin: 9,
    tag: "Guide",
    hero: {
      src: U("1498050108023-c5249f4df085"),
      alt: "Code editor open on a laptop screen",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The best AI coding assistant in 2026 depends on what you're doing: **Cursor** wins for interactive editing inside a large codebase; **Claude Code** wins for long-horizon agentic tasks you hand off from the terminal; **GitHub Copilot** is still the safest choice for teams with strict data-governance requirements. The rest of this article explains the tradeoffs so you can stop re-evaluating and start building.",
      },
      {
        type: "paragraph",
        text: "AI coding tools have split into two distinct categories: editors (where you work alongside the model in real time) and agents (where you describe a task, walk away, and come back to a diff). The best workflow in 2026 combines one from each column — they do genuinely different jobs and don't cannibalize each other.",
      },
      {
        type: "callout",
        variant: "note",
        title: "How this list is structured",
        text: "Each tool is assessed on three axes: **quality of suggestions**, **context window / codebase understanding**, and **agentic capability**. A tool that scores high on all three doesn't exist yet — but the combinations that cover all three do.",
      },

      { type: "heading", level: 2, text: "Cursor — best for interactive editing" },
      {
        type: "paragraph",
        text: "Cursor is an AI-native fork of VS Code. It ships with a composer panel (multi-file context), an inline edit command (`Cmd+K`), and a chat sidebar that can reference the entire codebase. The core innovation is that Cursor treats the whole repo as context rather than just the open file — so \"how does this relate to the auth middleware?\" is a question it can actually answer.",
      },
      {
        type: "paragraph",
        text: "The model underneath is your choice: Claude Sonnet, GPT-4o, or Cursor's own fine-tuned model. In practice, Claude Sonnet gives the most coherent multi-file edits; the fine-tuned model is faster for quick completions. Pricing is $20/month for Pro, which includes unlimited slow requests and 500 fast ones — most developers hit the fast limit mid-month and barely notice.",
      },
      {
        type: "paragraph",
        text: "The main weakness: Cursor's composer will sometimes go far off-track on complex refactors, making changes you didn't ask for. You need to review every diff. That's true of every AI editor, but Cursor's confidence can make it more aggressive than alternatives.",
      },
      { type: "heading", level: 2, text: "Claude Code — best for agentic tasks" },
      {
        type: "paragraph",
        text: "Claude Code is a terminal-first agent from Anthropic. You give it a task in plain language — \"add pagination to the dashboard, write tests, make sure the existing tests still pass\" — and it works through the codebase independently: reading files, writing code, running commands, checking its own output. It's the closest thing to delegating a whole feature to a junior engineer who actually delivers.",
      },
      {
        type: "paragraph",
        text: "What separates it from similar tools is the context window and the instruction-following. Claude holds much longer chains of reasoning without losing the plot, which matters enormously on tasks that touch more than three files. It's slower than Cursor for quick edits and has no GUI, but for the kind of work you'd previously batch up for a contractor, it's the right tool.",
      },
      {
        type: "quote",
        text: "The mental model shift: Cursor is a faster keyboard. Claude Code is a colleague you can assign a ticket to.",
      },
      { type: "heading", level: 2, text: "GitHub Copilot — best for teams" },
      {
        type: "paragraph",
        text: "Copilot's competitive moat is trust and integration, not raw quality. It plugs into VS Code, JetBrains, Visual Studio, Neovim, and the GitHub web editor. It has enterprise data-handling agreements that meet most corporate compliance requirements. And it's where most developers first encountered AI completion — which means less re-training friction on a team.",
      },
      {
        type: "paragraph",
        text: "The suggestion quality has improved significantly with Copilot's upgrade to Claude and GPT-4o as underlying models. It's no longer the quality-laggard it was in 2023. For an organization that needs single-vendor, audited, SLA-backed AI tooling, it's the clear answer.",
      },
      { type: "heading", level: 2, text: "Windsurf — best Cursor alternative" },
      {
        type: "paragraph",
        text: "Windsurf (from Codeium) is the closest full-feature alternative to Cursor. It has a similar composer panel, the same model choices, and a free tier that's genuinely useful — unlimited slow requests on the Claude Haiku level model. The UX philosophy is slightly different: Windsurf leans more into long-running flows it calls \"Cascade\", which track your intent across multiple files and many turns.",
      },
      {
        type: "paragraph",
        text: "If Cursor's pricing is a blocker, or if you want to evaluate the field before committing, Windsurf is the right test drive. Most developers who switch stay.",
      },
      { type: "heading", level: 2, text: "Aider — best for the command line" },
      {
        type: "paragraph",
        text: "Aider is open-source, runs in the terminal, and is the choice for developers who want full control over which model they use and exactly what context they pass. It has a `--model` flag that accepts any OpenAI-compatible endpoint — meaning you can point it at Ollama for local models, or the Anthropic API, or OpenRouter. No subscription, no vendor lock-in, no data sent to a third-party editor.",
        },
      {
        type: "paragraph",
        text: "The tradeoff: Aider is more work to set up, has no GUI, and requires you to manage your own API spend. For developers with those skills and that preference, it's the most flexible option in the category.",
      },
      {
        type: "tools",
        title: "The coding assistants worth using",
        items: [
          { name: "Cursor", valueLine: "AI-native code editor — multi-file context, inline edit, best for interactive codebase work.", url: "https://cursor.com" },
          { name: "Claude Code", valueLine: "Terminal-first AI agent — hand it a task, come back to a diff. Best for long-horizon agentic work.", url: "https://www.anthropic.com/claude-code" },
          { name: "GitHub Copilot", valueLine: "Enterprise-grade AI completion across every major IDE — the safe, auditable choice for teams.", url: "https://github.com/features/copilot" },
          { name: "Windsurf", valueLine: "Cursor alternative from Codeium — generous free tier, strong multi-file Cascade flows.", url: "https://codeium.com/windsurf" },
          { name: "Aider", valueLine: "Open-source terminal AI agent — use any model, full control, no subscription.", url: "https://aider.chat" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "The answer to \"which AI coding assistant should I use?\" is rarely one tool. Pick an editor for your day-to-day work and an agent for the tasks you'd otherwise batch. For most developers that's Cursor + Claude Code, or Windsurf + Claude Code if you want to keep the bill lower. Find all of them and more on the [Radar](/radar/browse).",
      },
    ],
  },

  // ─── SEO: Best AI tools for designers ────────────────────────────────────────
  {
    slug: "best-ai-tools-for-designers-2026",
    title: "Best AI tools for designers in 2026",
    deck: "Which AI tools actually save design time, and which ones produce work you'll have to redo. A no-hype breakdown.",
    date: "2026-06-24",
    readingMin: 8,
    tag: "Guide",
    hero: {
      src: U("1561070791-2526d30994b5"),
      alt: "Design work on a screen showing UI components",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The AI tools that actually belong in a designer's stack in 2026 are: **Figma AI** for in-context design work, **Midjourney** for reference imagery and mood boards, **Framer AI** for shipping interactive prototypes without engineering hand-off, and **Galileo AI** for generating editable UI scaffolds from text. Everything else is either a toy or a novelty that breaks down on real work.",
      },
      {
        type: "paragraph",
        text: "The failure mode for most designers adopting AI tools is treating them as final-output machines. They are not. The output of an AI image tool is raw material — a starting point for refinement, not a deliverable. Designers who understand this use AI tools to move 3x faster. Those who don't produce work that looks generically AI-flavored and requires more cleanup than it saved.",
      },
      { type: "heading", level: 2, text: "For UI and product design: Figma AI" },
      {
        type: "paragraph",
        text: "Figma's AI features (First Draft, Auto Layout suggestions, content fill) are the lowest-friction way to add AI to an existing design workflow because they're already inside the tool you use all day. First Draft generates a UI scaffold from a text prompt — not final-quality, but a skeleton you can iterate from. Auto Layout suggestions help with responsive structure. Content fill replaces placeholder text and images with realistic dummy content, which significantly cuts the time between wireframe and stakeholder presentation.",
      },
      {
        type: "paragraph",
        text: "The important nuance: Figma AI generates work in Figma's component system, so the output is editable vector layers rather than a rasterized image. That's what makes it useful for production design. Compare this to Canva AI or Adobe Firefly, which generate images you then need to re-implement.",
      },
      { type: "heading", level: 2, text: "For imagery and references: Midjourney" },
      {
        type: "paragraph",
        text: "Midjourney is still the best image generation model for design work — not because of resolution or speed, but because of aesthetic quality and controllability at the mood board stage. The `/imagine` command is useful; the real power is in `--style`, `--sref` (style reference), and `--cref` (character reference), which let you lock in visual identity across a series of images.",
      },
      {
        type: "paragraph",
        text: "The practical workflow: generate 20 variants from a brief, pull the three that read strongest, use those as reference in your actual design file. You're not shipping Midjourney output — you're using it to resolve visual direction decisions faster than a Pinterest rabbit hole would.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "Where Midjourney breaks down",
        text: "Text rendering inside images is still unreliable. For any image that needs readable words — UI screenshots, product mockups, social cards — generate the image without text in Midjourney, then add the type in Figma or your design tool.",
      },
      { type: "heading", level: 2, text: "For prototyping and shipping: Framer AI" },
      {
        type: "paragraph",
        text: "Framer sits at the intersection of design tool and web builder. The AI layer lets you describe a section in text and generate interactive, responsive HTML/CSS that's ready to publish — not a mockup, but a real live page. For landing pages, portfolios, and marketing sites, the gap between design and shipping has collapsed to nearly zero.",
      },
      {
        type: "paragraph",
        text: "The constraint: Framer is a CMS-hosted tool, not a component library you bring into an existing codebase. It's right for self-contained sites. For complex product UI, you still need Figma and an engineering handoff.",
      },
      { type: "heading", level: 2, text: "For generating UI scaffolds: Galileo AI and v0" },
      {
        type: "paragraph",
        text: "**Galileo AI** generates multi-screen UI from a brief and exports to Figma as editable components. It's useful in the earliest stage of a product — when you need something to react to, not something finished. **v0 by Vercel** does the same thing but outputs React/Tailwind code rather than a Figma file, which makes it the right tool when you're building a product and want to skip the handoff entirely.",
      },
      {
        type: "paragraph",
        text: "Both tools produce work that requires significant refinement. But they eliminate the blank-canvas problem — having something specific to react to is consistently faster than starting from nothing.",
      },
      {
        type: "tools",
        title: "The AI design tools worth using",
        items: [
          { name: "Figma AI", valueLine: "First Draft, Auto Layout, and content fill — AI inside the design tool you're already using.", url: "https://figma.com/ai" },
          { name: "Midjourney", valueLine: "Best aesthetic quality for reference imagery and mood boards — strongest style control in the category.", url: "https://midjourney.com" },
          { name: "Framer", valueLine: "AI-powered web builder — describe a section and get live, responsive HTML. Collapses design-to-publish.", url: "https://framer.com" },
          { name: "v0 by Vercel", valueLine: "Generate React/Tailwind UI from a prompt — skip the Figma-to-code handoff entirely.", url: "https://v0.dev" },
          { name: "Adobe Firefly", valueLine: "Commercially safe image generation inside the Creative Cloud ecosystem — generative fill in Photoshop.", url: "https://firefly.adobe.com" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "AI doesn't replace design judgment — it removes friction from the parts that don't require it. The designers who get the most from these tools are the ones who keep a clear line between AI-generated starting material and finished work. All of these tools are on the [Radar](/radar/browse) if you want to explore further.",
      },
    ],
  },

  // ─── SEO: Best MCP servers ───────────────────────────────────────────────────
  {
    slug: "best-mcp-servers-for-claude-2026",
    title: "Best MCP servers for Claude in 2026",
    deck: "MCP turns Claude from a chatbot into an agent that can read your files, query your database, and call your APIs. Here are the servers worth wiring up.",
    date: "2026-06-23",
    readingMin: 8,
    tag: "Guide",
    hero: {
      src: U("1451187580459-43490279c0fa"),
      alt: "Server racks in a data center with blue lighting",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The best MCP servers to install in 2026 are: **Filesystem** (read and write local files), **Fetch** (make HTTP requests), **Supabase MCP** (query your database), **Playwright MCP** (control a browser), and **GitHub MCP** (manage repos and PRs from the conversation). These five cover 90% of real agentic workflows. Everything else is additive.",
      },
      {
        type: "paragraph",
        text: "Model Context Protocol (MCP) is the open standard that lets AI models communicate with external tools. Instead of copy-pasting data into a chat window, an MCP server exposes tools the model can call natively — read a file, run a query, submit a form — and get structured results back. The practical effect: Claude can operate your development environment, not just advise on it.",
      },
      {
        type: "callout",
        variant: "note",
        title: "Setup: where does MCP config live?",
        text: "MCP servers are configured in `~/Library/Application Support/Claude/claude_desktop_config.json` on Mac (or the equivalent path on Windows/Linux). Most servers run via `npx` with no separate install step — just add the config and restart Claude Desktop.",
      },
      { type: "heading", level: 2, text: "The core three: Filesystem, Fetch, and Memory" },
      {
        type: "paragraph",
        text: "The **Filesystem** server is non-negotiable for any coding or file-management workflow. It gives Claude read and write access to specified directories — meaning it can read a config file, edit a component, and create a new file in one conversation turn. The security model lets you restrict access to specific paths, so you don't need to give it access to your whole machine.",
      },
      {
        type: "paragraph",
        text: "The **Fetch** server lets Claude make HTTP requests and parse the responses. This turns it into a capable API tester, web researcher, and scraper. \"Check the status of this endpoint\" or \"fetch the docs for this library and summarize the auth section\" go from multi-step copy-paste exercises to single instructions.",
      },
      {
        type: "paragraph",
        text: "The **Memory** server maintains a persistent knowledge graph across conversations. By default, Claude forgets everything between sessions. With Memory, it can store facts, preferences, and working knowledge that carry forward — making it far more useful as a long-running assistant on a project.",
      },
      {
        type: "code",
        lang: "json",
        code: `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/you/projects"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}`,
      },
      { type: "heading", level: 2, text: "For developers: GitHub and Supabase" },
      {
        type: "paragraph",
        text: "The **GitHub MCP** server exposes the GitHub API as tools Claude can call directly: create a branch, open a PR, read issue comments, push a commit. This is the bridge between an AI that can write code and one that can actually participate in a development workflow. It's particularly powerful combined with Claude Code — describe a feature, have it implement and commit, then open the PR from the same conversation.",
      },
      {
        type: "paragraph",
        text: "The **Supabase MCP** server connects Claude to your Supabase database. It can read and write rows, run SQL queries, and introspect the schema. The most useful pattern: describe a data migration in plain English, have Claude write and validate the SQL, then execute it — all inside the conversation, with the SQL visible for review before it runs.",
      },
      { type: "heading", level: 2, text: "For research and automation: Playwright and Brave Search" },
      {
        type: "paragraph",
        text: "**Playwright MCP** gives Claude control of a real browser — it can navigate to URLs, click elements, fill forms, and extract page content. This is qualitatively different from the Fetch server, which only retrieves raw HTML. Playwright handles JavaScript-rendered pages, can log into services, and can automate multi-step web workflows. The obvious power tool for QA automation and web scraping.",
      },
      {
        type: "paragraph",
        text: "**Brave Search MCP** connects Claude to Brave's search API (requires a free API key). Useful for any research workflow where the model needs current information beyond its training cutoff — competitive analysis, recent product releases, latest documentation.",
      },
      {
        type: "tools",
        title: "MCP servers worth installing",
        items: [
          { name: "MCP Filesystem", valueLine: "Read and write local files by path — the foundation of any coding or file-management workflow.", url: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem" },
          { name: "MCP Fetch", valueLine: "Make HTTP requests from the conversation — API testing, web research, live docs.", url: "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch" },
          { name: "GitHub MCP", valueLine: "Manage repos, branches, PRs, and issues from the Claude conversation.", url: "https://github.com/github/github-mcp-server" },
          { name: "Supabase MCP", valueLine: "Query and mutate your Supabase database directly from an AI conversation.", url: "https://github.com/supabase-community/supabase-mcp" },
          { name: "Playwright MCP", valueLine: "Give Claude full browser control — navigation, clicks, forms, and JS-rendered page extraction.", url: "https://github.com/microsoft/playwright-mcp" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "Start with Filesystem and Fetch. Add GitHub or Supabase once your codebase is involved. Add Playwright when you need real browser automation. The full MCP catalog — with hundreds of community servers for Slack, Linear, Notion, AWS, and more — lives on the [Radar](/radar/mcp).",
      },
    ],
  },

  // ─── SEO: What is MCP ────────────────────────────────────────────────────────
  {
    slug: "what-is-mcp-model-context-protocol",
    title: "What is MCP? The Model Context Protocol explained",
    deck: "MCP is the USB-C of AI tooling: a single standard that lets any model talk to any tool. Here's what it is, why it matters, and how to get started in 10 minutes.",
    date: "2026-06-22",
    readingMin: 7,
    tag: "Explainer",
    hero: {
      src: U("1451187580459-43490279c0fa"),
      alt: "Abstract network connections representing data flow",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "MCP (Model Context Protocol) is an open standard, created by Anthropic in late 2024, that defines how AI models communicate with external tools and data sources. In plain terms: instead of manually copying context into a chat window, MCP lets Claude (or any MCP-compatible model) call tools directly — read a file, query a database, run a browser — and get structured results back. It's the difference between an AI advisor and an AI that can actually do things.",
      },
      {
        type: "paragraph",
        text: "The analogy that sticks: MCP is the USB-C of AI tooling. Before USB-C, every device had its own proprietary connector. USB-C created one standard that works everywhere. MCP does the same for AI tools — one integration protocol, usable across Claude, GPT-4, Gemini, and any model that adopts the spec. A server you build once works with every MCP client.",
      },
      { type: "heading", level: 2, text: "How MCP works, without the jargon" },
      {
        type: "paragraph",
        text: "An MCP setup has two parts: a **client** (the AI model) and a **server** (the thing that exposes tools). The server declares what it can do — \"I can read files\", \"I can run SQL queries\", \"I can fetch web pages\" — and the client can call those tools during a conversation. The AI decides when to use them based on context.",
      },
      {
        type: "paragraph",
        text: "Concretely: you're talking to Claude in Claude Desktop and you ask \"how many users signed up this week?\". Without MCP, Claude can only answer if you paste in the data. With a Supabase MCP server configured, Claude calls the query tool, gets the number from your database, and answers directly. The conversation never left Claude's interface.",
      },
      {
        type: "diagram",
        chart: `graph LR
  A[Claude Desktop] -->|tool call| B[MCP Server]
  B -->|reads| C[Files / DB / APIs]
  C -->|structured result| B
  B -->|response| A`,
        caption: "MCP flow: the model calls a server tool, gets a result, uses it in the response.",
      },
      { type: "heading", level: 2, text: "MCP vs function calling: what's the difference?" },
      {
        type: "paragraph",
        text: "If you've used OpenAI's function calling or Claude's tool use, MCP will feel familiar — but there's a key architectural difference. Function calling defines tools inline in the API request (each call, each time). MCP is a persistent, separate process: you run a server, the client connects to it, and the connection stays open across the whole conversation. This means MCP servers can maintain state, hold open connections, and be shared across multiple clients and models.",
      },
      {
        type: "paragraph",
        text: "Another difference: MCP is local-first. Most MCP servers run on your machine as a subprocess, which means your data never leaves your environment unless the tool explicitly calls an external service. This is important for developers who need to keep code or data local.",
      },
      { type: "heading", level: 2, text: "Getting started: 10 minutes to your first server" },
      {
        type: "paragraph",
        text: "The fastest path to MCP is Claude Desktop + the official filesystem server. Install [Claude Desktop](https://claude.ai/download), then add this to your config file (`~/Library/Application Support/Claude/claude_desktop_config.json` on Mac):",
      },
      {
        type: "code",
        lang: "json",
        code: `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/yourname/projects"
      ]
    }
  }
}`,
      },
      {
        type: "paragraph",
        text: "Restart Claude Desktop and the model now has read/write access to your projects folder. Ask it to \"list all TypeScript files in my current project\" or \"read the README and summarize the setup steps\" — it'll call the filesystem tools and answer from the actual files.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "Security model",
        text: "MCP servers only have access to what you explicitly grant. The filesystem server only reads/writes paths you specify in the config. No tool can access anything outside its declared scope — the model cannot \"jailbreak\" a server to access your whole machine.",
      },
      { type: "heading", level: 2, text: "The MCP ecosystem in 2026" },
      {
        type: "paragraph",
        text: "When Anthropic open-sourced MCP in November 2024, the ecosystem was a handful of official servers. By mid-2026, there are hundreds: Slack, Linear, Notion, GitHub, AWS, Google Drive, Postgres, MongoDB, Stripe, and more. The community has built servers for almost every developer tool and SaaS product.",
      },
      {
        type: "paragraph",
        text: "Adoption has spread beyond Claude too. OpenAI added MCP support to their agents framework. Google's Gemini supports MCP in Vertex AI. The standard is becoming the default integration layer for agentic AI across the industry.",
      },
      {
        type: "tools",
        title: "MCP servers to start with",
        items: [
          { name: "MCP Filesystem", valueLine: "Read and write local files — the first server to install.", url: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem" },
          { name: "MCP Fetch", valueLine: "HTTP requests and web content from the conversation.", url: "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch" },
          { name: "MCP Memory", valueLine: "Persistent knowledge graph — context that survives across sessions.", url: "https://github.com/modelcontextprotocol/servers/tree/main/src/memory" },
          { name: "GitHub MCP", valueLine: "Repos, PRs, and issues from the Claude conversation.", url: "https://github.com/github/github-mcp-server" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "MCP is the biggest practical upgrade to daily AI use since streaming responses. Once you have one server running, the question of \"what else can I connect?\" becomes an interesting one. The full catalog of community MCP servers is on the [Radar](/radar/mcp).",
      },
    ],
  },

  // ─── SEO: Claude vs GPT-4o ───────────────────────────────────────────────────
  {
    slug: "claude-vs-gpt4o-which-to-use-2026",
    title: "Claude vs GPT-4o: Which AI model should you use in 2026?",
    deck: "The honest comparison. Not a benchmark table, a breakdown of which tasks each model handles better, and when the difference actually matters.",
    date: "2026-06-21",
    readingMin: 8,
    tag: "Comparison",
    hero: {
      src: U("1487058792275-0ad4aaf24ca7"),
      alt: "Two abstract AI network visualizations side by side",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "For most developers in 2026: use **Claude Sonnet** for coding, reasoning, and anything that requires following long, nuanced instructions; use **GPT-4o** for multimodal tasks (image analysis, voice), for workflows deeply integrated with the OpenAI ecosystem, and for high-volume low-cost work via GPT-4o mini. The two models are closer in quality than they've ever been — the choice is increasingly about workflow fit, not raw capability.",
      },
      {
        type: "paragraph",
        text: "Benchmark tables are useful for headline numbers but misleading for actual decisions. A model that scores 3% better on MMLU might produce worse output on your specific task — because prompting style, instruction format, and task type all interact with model strengths in ways benchmarks don't capture. This comparison focuses on the differences that practitioners actually notice.",
      },
      { type: "heading", level: 2, text: "Where Claude is better" },
      {
        type: "paragraph",
        text: "**Code quality and architecture**: Claude reliably writes code that follows the conventions of an existing codebase. Ask it to add a feature to a Next.js app and it will match the file structure, import style, naming conventions, and error handling patterns already present — without being told to. GPT-4o produces correct code more often than not, but is more likely to introduce new patterns or miss contextual norms.",
      },
      {
        type: "paragraph",
        text: "**Long document processing**: Claude's 200K context window handles a full codebase or a 300-page PDF without losing coherence. GPT-4o's 128K context is usually enough, but Claude edges ahead on tasks that require holding many inter-related facts simultaneously — financial document analysis, codebase-wide refactors, legal contract review.",
      },
      {
        type: "paragraph",
        text: "**Instruction following**: Multi-step, conditional instructions (\"if the user is a new account, do X; if returning, do Y; and in both cases, never do Z\") are handled more consistently by Claude. The failure mode for GPT-4o is selectively ignoring constraints mid-response, especially in long outputs. Claude's refusal to override its instructions can feel frustrating in creative tasks, but makes it more reliable in production.",
      },
      {
        type: "quote",
        text: "Claude writes code that fits your codebase. GPT-4o writes code that works. The difference shows up at scale.",
      },
      { type: "heading", level: 2, text: "Where GPT-4o is better" },
      {
        type: "paragraph",
        text: "**Multimodal tasks**: GPT-4o's vision capability is more polished for complex image analysis — reading dense charts, interpreting screenshots, describing UI for accessibility. Claude's vision is capable but the gap narrows significantly on straightforward image tasks. If you're building a pipeline that processes images at scale, test both and measure.",
      },
      {
        type: "paragraph",
        text: "**Ecosystem integration**: The OpenAI ecosystem is larger. More third-party tools, libraries, and hosted solutions default to the OpenAI API. LangChain, LlamaIndex, and most RAG frameworks have better first-party support for OpenAI. If you're integrating into an existing stack, the path of least resistance often runs through GPT-4o.",
      },
      {
        type: "paragraph",
        text: "**Cost at volume**: GPT-4o mini is the most cost-effective capable model in the category. For high-volume pipelines — content classification, extraction, summarization at scale — mini is hard to beat on the $/token/quality ratio. Claude Haiku is the equivalent offer from Anthropic, but GPT-4o mini has a larger track record in production.",
      },
      { type: "heading", level: 2, text: "The verdict by use case" },
      {
        type: "list",
        items: [
          "**Coding assistant / agent**: Claude Sonnet — better instruction following and context retention",
          "**High-volume extraction / classification**: GPT-4o mini — cheaper and fast enough",
          "**Long document analysis**: Claude — 200K context, coherent over long spans",
          "**Image analysis**: GPT-4o — better multimodal pipeline support",
          "**Creative writing**: Similar quality; Claude has more consistent voice",
          "**Existing OpenAI stack**: GPT-4o — less migration friction",
          "**MCP / agentic workflows**: Claude — native MCP origin, better tool use on complex chains",
        ],
      },
      {
        type: "callout",
        variant: "tip",
        title: "Test on your actual task",
        text: "The single best way to choose is to run 50 examples from your real use case through both models, score the outputs, and pick the winner. Benchmarks tell you nothing about performance on your specific data and task.",
      },
      {
        type: "tools",
        items: [
          { name: "Anthropic API", valueLine: "Claude Sonnet and Haiku — best for coding, long-context reasoning, and agentic chains.", url: "https://www.anthropic.com/api" },
          { name: "OpenAI API", valueLine: "GPT-4o and mini — best multimodal support, widest ecosystem, cheapest at volume.", url: "https://platform.openai.com" },
          { name: "OpenRouter", valueLine: "Single API for 200+ models — test Claude and GPT-4o side by side with one integration.", url: "https://openrouter.ai" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "The \"which model?\" question will be irrelevant within a year as quality converges further. What won't converge is the ecosystem and the workflow fit. Build integrations with the API abstraction layer (Vercel AI SDK, OpenRouter) rather than the provider directly, and switching when the quality picture shifts will cost you an afternoon, not a sprint.",
      },
    ],
  },

  // ─── SEO: Best AI tools for startups ────────────────────────────────────────
  {
    slug: "best-ai-tools-for-startups-2026",
    title: "Best AI tools for startups and founders in 2026",
    deck: "The tools worth paying for when your runway is finite and your time is more finite. Sorted by where they save the most hours.",
    date: "2026-06-20",
    readingMin: 8,
    tag: "Guide",
    hero: {
      src: U("1499750310107-5fef28a66643"),
      alt: "A startup workspace with laptops and whiteboards",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The AI tools that actually matter for founders in 2026: **Claude Code** for building product 5x faster than a traditional dev workflow, **Cursor** for the in-editor experience, **Notion AI** for writing and documentation, **Perplexity** for research, and **ElevenLabs** for voice content. Beyond these five, most AI tools for founders are either nice-to-haves or solutions to problems a small team doesn't yet have.",
      },
      {
        type: "paragraph",
        text: "The framing that works: AI tools are leverage multipliers, not headcount replacements. A founder using Claude Code effectively can build and iterate on product at a pace that would previously have required two senior engineers. The constraint is no longer \"can I afford to build this?\" — it's \"do I understand what to build?\"",
      },
      { type: "heading", level: 2, text: "Building product: the dev stack" },
      {
        type: "paragraph",
        text: "The most impactful AI use for a technical founder is in the development workflow. **Cursor** handles day-to-day editing — multi-file context, inline corrections, code explanation. **Claude Code** handles the bigger tasks: \"add stripe billing to the app\", \"migrate the database schema\", \"write the full test suite for this module\". Together they eliminate the bottleneck of coding velocity for anyone who can think in systems.",
      },
      {
        type: "paragraph",
        text: "For non-technical founders, the combination of **v0** (AI-generated React components), **Supabase** (backend as a service), and **Vercel** (zero-config deployment) means the gap between an idea and a working prototype is now measured in days. You don't need to be a strong engineer to ship a real product in 2026 — you need to be a strong product thinker.",
      },
      { type: "heading", level: 2, text: "Writing and communication" },
      {
        type: "paragraph",
        text: "**Notion AI** is the most practical writing tool for founders because it's embedded inside the tool most teams already use for documentation and planning. Ask it to draft a spec from bullet points, rewrite a paragraph for clarity, or generate a first draft of an investor update — the context from surrounding notes makes the output materially better than a blank-slate chat.",
      },
      {
        type: "paragraph",
        text: "For customer-facing copy — landing pages, emails, pitch decks — **Claude (the web interface)** with the project feature (persistent system prompt) is the fastest path to consistent brand voice. Build a project once with your positioning, voice guidelines, and examples. Every piece of copy you generate from it stays on-brand without repeated prompting.",
      },
      { type: "heading", level: 2, text: "Research and competitive intelligence" },
      {
        type: "paragraph",
        text: "**Perplexity** is the best research tool available because it combines web search with synthesis — you get an answer with cited sources, not a list of links to open. For market research, competitor tracking, technical deep dives, and anything that needs current information, it beats a Google search + GPT-4o workflow for speed.",
      },
      {
        type: "paragraph",
        text: "For deeper competitive analysis, **Claude with a long context window** and uploaded documents outperforms any search-based tool. Paste in three competitor homepages and a set of user reviews and ask \"what's the narrative gap I can exploit?\" — the synthesis that comes back is often better-structured than a consultant's deliverable.",
      },
      { type: "heading", level: 2, text: "Sales and outreach" },
      {
        type: "paragraph",
        text: "**Clay** is the AI-native tool for outbound sales at a startup that can't afford a full GTM team. It enriches contact data, writes personalized emails at scale based on real signals (funding announcements, LinkedIn posts, job changes), and integrates with most CRMs. The cost-per-qualified-meeting drops substantially when personalization is automated at this level.",
      },
      {
        type: "paragraph",
        text: "**Apollo.io** still leads on the data side (contact database, firmographics), but its AI writing features are weaker than Clay. The practical approach: use Apollo for prospecting, export to Clay for enrichment and email generation.",
      },
      {
        type: "tools",
        title: "The founder's AI stack",
        items: [
          { name: "Claude Code", valueLine: "Terminal-first AI coding agent — delegate features, migrations, and test suites as tasks.", url: "https://www.anthropic.com/claude-code" },
          { name: "Cursor", valueLine: "AI-native code editor for day-to-day editing — multi-file context and inline corrections.", url: "https://cursor.com" },
          { name: "Notion AI", valueLine: "AI writing inside your docs and wikis — drafts, rewrites, and summaries in context.", url: "https://notion.so/product/ai" },
          { name: "Perplexity", valueLine: "AI search with citations — faster than Google + GPT for research and competitive intelligence.", url: "https://perplexity.ai" },
          { name: "v0 by Vercel", valueLine: "Generate React/Tailwind UI from a prompt — ship without a designer or frontend engineer.", url: "https://v0.dev" },
          { name: "Clay", valueLine: "AI-powered outbound — enrich contacts, write personalized emails at scale, fill your pipeline.", url: "https://clay.com" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "The ROI on AI tools compounds with usage — teams that build fluency early have a durable speed advantage over those who treat them as occasional utilities. The full catalog, including everything mentioned here, is on the [Radar](/radar/browse).",
      },
    ],
  },

  // ─── SEO: Best AI writing tools ─────────────────────────────────────────────
  {
    slug: "best-ai-writing-tools-2026",
    title: "Best AI writing tools in 2026",
    deck: "Which AI writing tools actually improve your output, and which ones produce forgettable prose that sounds like everyone else. An honest ranking.",
    date: "2026-06-19",
    readingMin: 7,
    tag: "Guide",
    hero: {
      src: U("1558655146-9f40138edfeb"),
      alt: "A person writing in a notebook at a desk",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The best AI writing tools in 2026 are: **Claude** for long-form, nuanced writing that requires following a specific voice; **Notion AI** for writing inside your existing docs workflow; **Perplexity** for research-backed writing; and **Grammarly** for final-pass editing. The tools to avoid are the ones trained purely on marketing copy — their output is grammatically correct and completely forgettable.",
      },
      {
        type: "paragraph",
        text: "The most common failure mode with AI writing tools is using them to write from scratch. They produce text that's structurally sound, inoffensive, and indistinct from the median of everything they've trained on. The better frame: AI writing tools are at their best as collaborators — you bring the ideas and distinctive perspective, they handle the structural scaffolding, the first draft, the rewrite on request.",
      },
      { type: "heading", level: 2, text: "For long-form and nuanced writing: Claude" },
      {
        type: "paragraph",
        text: "Claude is the best general-purpose writing assistant because it follows tone, voice, and format instructions more precisely than any alternative. Give it a 500-word sample of your own writing as a style reference, specify what you're writing and who it's for, and the drafts it produces are genuinely close to your voice rather than a generic approximation of it. This is the difference between \"this could have been written by anyone\" and \"this sounds like me\".",
      },
      {
        type: "paragraph",
        text: "The pattern that works: use Claude's Projects feature to create a persistent context with your brand voice guide, example copy, and any constraints (no exclamation marks, always active voice, etc.). Every piece you generate from that project inherits the style without you restating it each time.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "The best prompt for a first draft",
        text: "Don't start with \"write me an article about X\". Start with: \"Here are my main points: [bullet list]. My audience is [description]. My voice is [3 adjectives]. Write a first draft that I'll revise — don't polish, just get the structure right.\" Revision of a rough draft is 3x faster than iterating on an over-polished first attempt.",
      },
      { type: "heading", level: 2, text: "For in-context documentation: Notion AI" },
      {
        type: "paragraph",
        text: "Notion AI's strength is access to context — it can read the surrounding document, the database, and linked pages. Asking it to \"summarize this meeting notes page into three action items\" or \"write the spec based on the notes in this project\" produces output that's materially better than a chat assistant that starts cold. If your team lives in Notion, the AI features are worth enabling for the context awareness alone.",
      },
      { type: "heading", level: 2, text: "For research-backed writing: Perplexity" },
      {
        type: "paragraph",
        text: "Perplexity generates text that is sourced and current — it fetches from the live web and cites every claim. For any writing that requires up-to-date facts, statistics, or references (technical articles, market analysis, newsletters), starting a draft in Perplexity gives you a sourced skeleton to build on rather than having to research and write in separate passes.",
      },
      { type: "heading", level: 2, text: "For editing: Grammarly and Hemingway" },
      {
        type: "paragraph",
        text: "**Grammarly** is still the best final-pass editing tool — it catches comma splices, passive voice, wordiness, and inconsistencies that a first reader would notice. The premium tier adds style and clarity suggestions that go beyond grammar. **Hemingway Editor** is the blunter instrument: it highlights long sentences, adverbs, and passive constructions in-line, forcing you to simplify. Use Hemingway if your writing tends toward complexity; skip it if your voice is already direct.",
      },
      {
        type: "tools",
        title: "AI writing tools worth using",
        items: [
          { name: "Claude", valueLine: "Best long-form AI writing assistant — follows voice instructions, excellent at tone matching.", url: "https://claude.ai" },
          { name: "Notion AI", valueLine: "AI writing inside your docs — leverages surrounding context for much better output.", url: "https://notion.so/product/ai" },
          { name: "Perplexity", valueLine: "Research-backed writing with citations — the right starting point for fact-dense content.", url: "https://perplexity.ai" },
          { name: "Grammarly", valueLine: "Final-pass editing for grammar, clarity, and style — still the benchmark for text polish.", url: "https://grammarly.com" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "The writers who get the most from AI tools are the ones who have something to say and use AI to say it faster — not the ones who outsource the having-something-to-say part. Use AI to move from \"blank page\" to \"rough draft\" faster; keep the revision and judgment work to yourself.",
      },
    ],
  },

  // ─── SEO: Best AI agents ─────────────────────────────────────────────────────
  {
    slug: "best-ai-agents-2026",
    title: "Best AI agents in 2026",
    deck: "AI agents that can actually complete tasks end-to-end, not chatbots with extra steps. The ones worth building with, and the ones worth deploying.",
    date: "2026-06-18",
    readingMin: 9,
    tag: "Guide",
    hero: {
      src: U("1620712943543-bcc4688e7485"),
      alt: "Robot arm working autonomously in a digital environment",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The best AI agents in 2026: **Claude Code** for software development tasks, **Devin** for fully autonomous engineering work, **Operator** (OpenAI) for web-based tasks and form-filling, **Lindy** for business process automation without code, and **CrewAI** for building multi-agent workflows in Python. The category has matured enough that \"agent\" means something specific now — a system that plans, executes, observes, and iterates without a human in the loop.",
      },
      {
        type: "paragraph",
        text: "The definition of an AI agent that actually holds up: an agent is an LLM that can use tools, observe the results of those tools, and plan its next action based on what it observed — iterating until a task is complete or it needs human input. This is qualitatively different from a chatbot. The output isn't text, it's work.",
      },
      { type: "heading", level: 2, text: "For software development: Claude Code and Devin" },
      {
        type: "paragraph",
        text: "**Claude Code** is Anthropic's terminal-first coding agent. You give it a task in natural language — \"implement the search feature from the spec\", \"fix the failing CI tests\" — and it reads your codebase, writes code, runs tests, and iterates. The critical differentiator is its ability to hold a large codebase in context and make changes that are coherent across many files. Most developers using it report getting 5-10x more code written per hour than with a non-agentic workflow.",
      },
      {
        type: "paragraph",
        text: "**Devin** (Cognition AI) is the more fully autonomous option — designed to work asynchronously on a GitHub issue and produce a PR with minimal supervision. For tasks that are well-specified and don't require novel judgment, Devin's output quality is remarkable. The limitation: less-specified tasks produce less-reliable outputs. It's most useful as the right tool for tasks with a clear success criterion (tests pass, endpoint returns 200) rather than open-ended product work.",
      },
      { type: "heading", level: 2, text: "For web tasks: Operator and Browser Use" },
      {
        type: "paragraph",
        text: "**Operator** (OpenAI) and **Browser Use** (open-source alternative) are agents that control a web browser to complete tasks. \"Book a meeting on Calendly\", \"fill out this grant application\", \"check my order status on three suppliers\" — tasks that require navigating the real web are now delegatable. The current limitation is reliability on complex multi-step web flows, but for simple structured tasks the failure rate is low enough for production use.",
      },
      { type: "heading", level: 2, text: "For business automation without code: Lindy" },
      {
        type: "paragraph",
        text: "**Lindy** is the most accessible agent builder for non-developers. You describe a workflow in natural language — \"when I get an email from a customer asking for a refund, check their order history in Shopify, draft a response based on our policy, and flag it for my review if the order is over $200\" — and Lindy builds and runs the automation. Integrations include Gmail, Slack, Notion, CRMs, and most SaaS tools. No code, no YAML.",
      },
      { type: "heading", level: 2, text: "For building custom agents: CrewAI and LangGraph" },
      {
        type: "paragraph",
        text: "**CrewAI** is the most intuitive Python framework for multi-agent systems — you define agents with roles, goals, and tools, then define a crew (how they collaborate). It handles the orchestration: which agent speaks when, how they hand off tasks, how to pool their outputs. The abstraction level is right for most use cases without needing to hand-code a state machine.",
      },
      {
        type: "paragraph",
        text: "**LangGraph** (from LangChain) is lower-level — you define agent behavior as a directed graph with explicit nodes and edges. More control, more code. Right when you need deterministic flow, retry logic, or complex conditional behavior that CrewAI's higher-level API doesn't expose.",
      },
      {
        type: "tools",
        title: "AI agents worth deploying",
        items: [
          { name: "Claude Code", valueLine: "Terminal-first coding agent — plans, writes, tests, and iterates on software tasks end-to-end.", url: "https://www.anthropic.com/claude-code" },
          { name: "Devin", valueLine: "Fully autonomous software engineer — takes a GitHub issue, produces a PR.", url: "https://cognition.ai/devin" },
          { name: "Lindy", valueLine: "No-code AI agent builder — automate business workflows across email, CRM, and SaaS tools.", url: "https://lindy.ai" },
          { name: "CrewAI", valueLine: "Python framework for multi-agent systems — define roles, goals, and crew collaboration.", url: "https://crewai.com" },
          { name: "LangGraph", valueLine: "Low-level agent orchestration as a directed graph — full control over flow and state.", url: "https://langchain-ai.github.io/langgraph/" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "The meaningful shift in 2026 is that agents are reliable enough for production use on well-defined tasks. The design challenge has moved from \"can the agent do this?\" to \"how do I define the task precisely enough that the agent can succeed consistently?\" That's a product problem, not a technology problem — and it's a solvable one.",
      },
    ],
  },

  // ─── SEO: Best AI productivity tools ────────────────────────────────────────
  {
    slug: "best-ai-tools-for-productivity-2026",
    title: "Best AI tools for productivity in 2026",
    deck: "The tools that actually reclaim hours, not the ones that add a chat window to something that was already working fine.",
    date: "2026-06-17",
    readingMin: 7,
    tag: "Guide",
    hero: {
      src: U("1517180102446-f3ece451e9d8"),
      alt: "A clean desk with a laptop and a notebook",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The AI productivity tools that actually save time in 2026: **Notion AI** for thinking and documentation, **Superhuman** for email, **Otter.ai** for meetings, **Perplexity** for research, and **Claude with Projects** for any recurring writing task that benefits from consistent context. Productivity tools that add AI to an interface you'd stop using if the AI were removed are not productivity tools — they're AI demos.",
      },
      {
        type: "paragraph",
        text: "The question worth asking about any AI productivity tool: does using it mean you finish something that mattered faster, or does it mean you spend the same time producing more output that doesn't matter? Tools that automate low-value work are valuable. Tools that accelerate the production of low-value work are not.",
      },
      { type: "heading", level: 2, text: "For thinking and documentation: Notion AI" },
      {
        type: "paragraph",
        text: "Notion AI earns its place because it's embedded in the tool most knowledge workers use for notes and wikis. The context access is what makes it useful — it can summarize a meeting note, extract action items from a project page, or draft a document from bullet points you've already written. The blank-page problem effectively goes away for any structured document type.",
      },
      {
        type: "paragraph",
        text: "The specific feature worth using: the Notion AI database feature, which lets you generate summaries and extractions across all records in a database. For a CRM database with raw meeting notes, it can generate a structured summary column across hundreds of rows — tasks that would take hours of manual work.",
      },
      { type: "heading", level: 2, text: "For email: Superhuman" },
      {
        type: "paragraph",
        text: "Superhuman is the only email client where AI is native to the interaction model, not bolted on. The AI features — smart summaries, reply drafts, auto-categorization, follow-up reminders — are integrated into a keyboard-first interface designed around reaching inbox zero faster. The $30/month pricing is steep, but for anyone who spends more than 90 minutes a day on email, the time recovery usually justifies it.",
      },
      {
        type: "paragraph",
        text: "If Superhuman is out of budget, **Google Workspace's Gemini features** in Gmail have improved enough to be genuinely useful — summary of long threads, draft suggestions, and smart reply. Not as polished, but included in a subscription most businesses already have.",
      },
      { type: "heading", level: 2, text: "For meetings: Otter.ai and Fireflies" },
      {
        type: "paragraph",
        text: "The highest-leverage AI productivity intervention for most teams is automatic meeting transcription and summarization. **Otter.ai** joins your calls, transcribes in real time, identifies speakers, and generates a summary with action items afterward. The output isn't perfect, but it eliminates the \"who said what?\" archaeology that follows undocumented meetings. **Fireflies** offers similar functionality with stronger CRM integration.",
      },
      {
        type: "paragraph",
        text: "The cultural change this enables: no one needs to take notes, so everyone can be present. The transcript is searchable. The action items get assigned. For teams with a heavy meeting load, this category is the highest ROI AI intervention available.",
      },
      { type: "heading", level: 2, text: "For research: Perplexity" },
      {
        type: "paragraph",
        text: "Perplexity collapses the research workflow: instead of opening five tabs, reading each one, and synthesizing manually, you ask a question and get a sourced synthesis. For anyone whose job involves staying current — market analysts, journalists, technical leads tracking the field — it replaces 30-minute rabbit holes with a 2-minute briefing. The paid Pro tier adds access to more sources and longer responses.",
      },
      {
        type: "tools",
        title: "The AI productivity stack",
        items: [
          { name: "Notion AI", valueLine: "AI inside your docs and wikis — summaries, drafts, and database-wide extractions.", url: "https://notion.so/product/ai" },
          { name: "Superhuman", valueLine: "AI-native email client — designed around reaching inbox zero faster.", url: "https://superhuman.com" },
          { name: "Otter.ai", valueLine: "Automatic meeting transcription and action-item extraction — eliminate note-taking entirely.", url: "https://otter.ai" },
          { name: "Perplexity", valueLine: "AI search with citations — research in 2 minutes instead of 30.", url: "https://perplexity.ai" },
          { name: "Reclaim.ai", valueLine: "AI calendar manager — schedules focus time, buffers, and habits automatically.", url: "https://reclaim.ai" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "The AI productivity tools with the highest leverage are the ones embedded in high-frequency activities — email, meetings, documentation. Start there before exploring tools that solve problems you encounter once a week. All of these are on the [Radar](/radar/browse).",
      },
    ],
  },

  // ─── SEO: Best free AI tools ─────────────────────────────────────────────────
  {
    slug: "best-free-ai-tools-2026",
    title: "Best free AI tools in 2026",
    deck: "The AI tools with meaningful free tiers, ranked by how far you can actually get before hitting a paywall.",
    date: "2026-06-16",
    readingMin: 7,
    tag: "Guide",
    hero: {
      src: U("1460925895917-afdab827c52f"),
      alt: "A laptop and coffee cup on a desk with bright light",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The best free AI tools in 2026 — tools with genuinely useful free tiers, not crippled demos: **Claude.ai** (free tier covers most personal use), **Gemini 2.5 Flash** via Google AI Studio (free with a Google account), **Perplexity** (free tier good enough for most research), **Windsurf** (generous free coding tier), and **Canva AI** (free image generation in a full design tool). Every tool on this list is usable without a credit card for real work.",
      },
      {
        type: "paragraph",
        text: "The landscape for free AI tools has improved significantly in 2026. Competition has forced providers to offer more on free tiers to acquire users, and the cost of inference has dropped enough that free usage is sustainable for high-traffic products. The caveat: free tiers usually mean rate limits, smaller models, or no access to the latest release. Know the constraint before you depend on it.",
      },
      { type: "heading", level: 2, text: "AI assistants and chat" },
      {
        type: "paragraph",
        text: "**Claude.ai** free tier gives you access to Claude Sonnet with a daily usage limit — enough for most personal tasks: writing, research, coding questions, document analysis. The context window on the free tier (32K) is smaller than Pro (200K), which matters for long documents but not for typical Q&A use. **ChatGPT** (GPT-4o) has a similar free structure. **Google Gemini** via the Gemini web interface is fully free with a Google account and uses the Gemini 1.5 Flash model.",
      },
      { type: "heading", level: 2, text: "AI coding tools" },
      {
        type: "paragraph",
        text: "**Windsurf** (Codeium) has the most generous free tier in the AI code editor category: unlimited autocomplete and a set of free AI calls per month on the Cascade agent. For developers who need an AI editor but can't justify $20/month for Cursor, Windsurf free is a genuinely useful tool rather than a taste. **GitHub Copilot** also has a free tier with 2,000 completions per month — enough to evaluate whether it's worth paying for.",
      },
      {
        type: "paragraph",
        text: "**Google AI Studio** lets you use Gemini 2.5 Flash and Pro via the API for free up to the quota limit — and Gemini 2.5 Flash is a legitimately capable model, not a stripped-down freeware version. For developers who want to experiment with AI features in their own apps without a billing commitment, this is the lowest-friction starting point.",
      },
      { type: "heading", level: 2, text: "Image generation" },
      {
        type: "paragraph",
        text: "**Canva's AI features** (Magic Media, text-to-image, background removal) are available on the free Canva plan — and because they're embedded in a full design tool, they're more useful than standalone free image generators. The quality isn't Midjourney-level, but it's good enough for social media assets, presentations, and basic marketing material. **Adobe Firefly** also offers 25 free generative credits per month with an Adobe account.",
      },
      { type: "heading", level: 2, text: "Research and search" },
      {
        type: "paragraph",
        text: "**Perplexity** free tier covers daily research use — up to 5 Pro searches per day (which use the better models) and unlimited standard searches. For most people this is sufficient; power users who do research-intensive work will hit the limit. **You.com** is a free Perplexity alternative with similar capabilities and no daily cap on standard searches.",
      },
      {
        type: "callout",
        variant: "note",
        title: "When to upgrade",
        text: "Upgrade from a free tier when: you hit rate limits mid-task more than twice a week, you need the larger context window for documents you regularly work with, or you need API access for something you're building. The threshold is clear once you reach it.",
      },
      {
        type: "tools",
        title: "Free AI tools worth bookmarking",
        items: [
          { name: "Claude", valueLine: "Free tier covers most personal use — Sonnet model, daily limit, 32K context.", url: "https://claude.ai" },
          { name: "Google AI Studio", valueLine: "Gemini 2.5 Flash free via API — best free starting point for developers building AI features.", url: "https://aistudio.google.com" },
          { name: "Windsurf", valueLine: "Free AI code editor with unlimited autocomplete — the best free Cursor alternative.", url: "https://codeium.com/windsurf" },
          { name: "Perplexity", valueLine: "Free AI research with citations — 5 Pro searches/day, unlimited standard.", url: "https://perplexity.ai" },
          { name: "Canva AI", valueLine: "Free AI image generation inside a full design tool — better than a standalone generator.", url: "https://canva.com" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "Free tiers are good enough to build a meaningful daily AI workflow. Start with Claude for reasoning, Windsurf or Copilot for coding, and Perplexity for research — and upgrade only when a specific tool has clearly earned the spend by recovering more time than the subscription costs.",
      },
    ],
  },

  // ─── SEO: Best AI tools for developers ──────────────────────────────────────
  {
    slug: "best-ai-tools-for-developers-2026",
    title: "Best AI tools for developers in 2026",
    deck: "The complete developer AI stack: editors, agents, APIs, testing, and infrastructure tools that belong in every engineering workflow.",
    date: "2026-06-15",
    readingMin: 10,
    tag: "Guide",
    hero: {
      src: U("1555066931-bf19f8fd1085"),
      alt: "A developer working at a desk with multiple monitors showing code",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The essential AI tools for developers in 2026: **Cursor** or **Windsurf** for daily editing, **Claude Code** for agentic tasks, **GitHub Copilot** for team environments, **Vercel AI SDK** for building AI features into products, and the **Anthropic API** (Claude) or **OpenAI API** (GPT-4o) as the model layer. Beyond these, the right additions depend on your stack — here's what to add and when.",
      },
      {
        type: "paragraph",
        text: "Developer AI tooling has stratified into three distinct layers in 2026: the editor layer (tools that help you write and edit code), the agent layer (tools that execute multi-step development tasks), and the integration layer (SDKs and APIs for building AI into your own products). A complete developer stack typically includes one tool from each layer.",
      },
      { type: "heading", level: 2, text: "The editor layer: where you spend your time" },
      {
        type: "paragraph",
        text: "**Cursor** is the dominant AI-native code editor — built on VS Code, with a multi-file composer, inline edit (`Cmd+K`), and a chat panel that can reference the whole repo. The quality of edits is notably better than Copilot for complex multi-file changes because Cursor was designed around codebase-level context, not file-level completion.",
      },
      {
        type: "paragraph",
        text: "**Windsurf** (Codeium) is the strongest alternative with a more generous free tier. Its Cascade agent handles long, multi-step editing flows well. If you want to evaluate before committing to Cursor's $20/month, Windsurf is the right test drive.",
      },
      {
        type: "paragraph",
        text: "**GitHub Copilot** is the right choice for teams with existing Microsoft/GitHub infrastructure, compliance requirements, or a need for IDE diversity (it supports VS Code, JetBrains, Neovim, and Visual Studio). The quality gap with Cursor has closed significantly in 2026.",
      },
      { type: "heading", level: 2, text: "The agent layer: tasks you delegate" },
      {
        type: "paragraph",
        text: "**Claude Code** is the terminal-first agent for tasks you'd otherwise batch up: \"implement the payment flow\", \"add tests for the auth module\", \"migrate the database schema and update all the queries\". The instruction-following quality and context retention on multi-file tasks is the best in the category. It integrates with MCP servers, so it can also query your database, fetch documentation, and interact with external services during a task.",
      },
      {
        type: "paragraph",
        text: "For fully autonomous tasks on a clearly-specified GitHub issue, **Devin** (Cognition) produces higher-quality autonomous output than any other system. The constraint: it works best on tasks with clear success criteria, not open-ended product work. Use it for the kind of work where you'd write a detailed spec and hand it to a contractor.",
      },
      { type: "heading", level: 2, text: "The integration layer: building AI into your product" },
      {
        type: "paragraph",
        text: "The **Vercel AI SDK** is the right abstraction for any Next.js or Node.js project. It provides streaming, tool calling, multi-step agent loops, and RAG primitives behind a clean API — and it's maintained by the same team as Vercel, so it tracks Next.js improvements closely. Call it with Claude, GPT-4o, or Gemini with the same interface.",
      },
      {
        type: "paragraph",
        text: "For Python, **LangChain** is the most widely adopted framework, but its abstraction cost is real — prefer calling the provider SDK directly for simple use cases. **LlamaIndex** is the right choice specifically for RAG (retrieval-augmented generation) pipelines — its chunking, embedding, and retrieval abstractions are more mature than LangChain's equivalents.",
      },
      { type: "heading", level: 2, text: "Testing and observability" },
      {
        type: "paragraph",
        text: "**Braintrust** is the best evaluation framework for AI features — it lets you run prompts across versions, score outputs, and track quality regressions as you change models or prompts. For any AI feature in production, \"does this still work?\" needs a quantitative answer. Braintrust provides the infrastructure to get one.",
      },
      {
        type: "paragraph",
        text: "**LangSmith** (from LangChain) provides traces and evaluation for LangChain-based applications. If you're on LangChain, it's the natural observability layer. If you're not, Braintrust is more model-agnostic.",
      },
      {
        type: "tools",
        title: "The full developer AI stack",
        items: [
          { name: "Cursor", valueLine: "AI-native code editor — multi-file composer, inline edit, codebase-level context.", url: "https://cursor.com" },
          { name: "Claude Code", valueLine: "Terminal-first AI agent — delegates multi-step development tasks end-to-end.", url: "https://www.anthropic.com/claude-code" },
          { name: "GitHub Copilot", valueLine: "AI coding assistant for teams — every major IDE, enterprise data handling.", url: "https://github.com/features/copilot" },
          { name: "Vercel AI SDK", valueLine: "Streaming, tool use, and agent loops for Next.js — model-agnostic, well-maintained.", url: "https://sdk.vercel.ai" },
          { name: "Anthropic API", valueLine: "Claude Sonnet — best for coding tasks, long-context reasoning, and agent chains.", url: "https://www.anthropic.com/api" },
          { name: "Braintrust", valueLine: "Evaluation framework for AI features — run prompts across versions, track quality regressions.", url: "https://braintr.us" },
          { name: "Windsurf", valueLine: "Cursor alternative — strong free tier, Cascade multi-step agent flows.", url: "https://codeium.com/windsurf" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "The developer AI stack has stabilized enough that the core choices — editor, agent, model API — are worth making once and committing to for at least a quarter. Constant tool-switching is its own productivity tax. Pick the stack, build fluency, and revisit at the next natural inflection point. Everything here is on the [Radar](/radar/browse).",
      },
    ],
  },

  // ─── SEO: Best AI tools for marketing ───────────────────────────────────────
  {
    slug: "best-ai-tools-for-marketing-2026",
    title: "Best AI tools for marketing teams in 2026",
    deck: "From campaign copy to ad creative to analytics. The AI tools marketing teams are actually using to ship faster and spend less.",
    date: "2026-06-14",
    readingMin: 8,
    tag: "Guide",
    hero: {
      src: U("1557804506-669a67965ba0"),
      alt: "Marketing team collaborating around a table with laptops",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The best AI tools for marketing in 2026: **Claude** or **ChatGPT** for copy and strategy, **Midjourney** or **Adobe Firefly** for ad creative, **Perplexity** for competitive research, **HubSpot AI** for CRM-integrated workflows, and **Jasper** for teams that need brand-voice controls across writers. These five cover 90% of what a modern marketing team needs from AI.",
      },
      {
        type: "paragraph",
        text: "Marketing was the first domain where AI delivered measurable ROI — not because the tools are flashy but because the core task (moving from brief to draft to approved asset) maps perfectly onto what language models do well. The challenge in 2026 isn't \"can AI help?\" — it's figuring out which tools to standardize on so the team isn't running seven different subscriptions with no shared asset library.",
      },
      { type: "heading", level: 2, text: "Copywriting and strategy" },
      {
        type: "paragraph",
        text: "**Claude** (Anthropic) is the strongest writer for long-form and nuanced content — brand manifestos, email sequences, white papers, and anything that requires consistent tone over several thousand words. The extended context window means you can paste in an entire brand guide and the output will actually follow it. For structured marketing formats (ad copy, landing page headlines, email subject lines), **ChatGPT** with a custom GPT trained on your brand voice is slightly more flexible.",
      },
      {
        type: "paragraph",
        text: "**Jasper** earns its price for larger teams because it adds the one thing raw LLMs lack: organizational controls. You can lock in a brand voice, create templates others fill in, and maintain an asset library — so the intern and the CMO are starting from the same place. For a solo marketer, Jasper is overkill; for a 10-person team shipping to multiple markets, it's the missing infrastructure.",
      },
      { type: "heading", level: 2, text: "Creative and visual" },
      {
        type: "paragraph",
        text: "**Adobe Firefly** is the pragmatic choice if your team already uses Creative Cloud. The outputs are commercially safe (trained on licensed content), the integration with Photoshop and Illustrator is seamless, and the generative fill for extending or cleaning up photos is genuinely excellent. **Midjourney** produces better raw image quality for concept work and campaign ideation — use it in the exploration phase, Firefly for production.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "Creative workflow",
        text: "Run Midjourney for mood boards and concept exploration. Once direction is locked, move to Firefly for production-ready assets that are safe to license. Don't reverse the order.",
      },
      { type: "heading", level: 2, text: "Research and analytics" },
      {
        type: "paragraph",
        text: "**Perplexity** has become the fastest tool for competitive research — it synthesizes up-to-date web results with citations, which means you can ask \"what are Notion's current pricing plans and who's running their newsletter?\" and get a usable answer in 30 seconds instead of 20 minutes of Googling. For deeper market research, **Claude** with the right prompt and source documents is more thorough.",
      },
      {
        type: "paragraph",
        text: "For analytics, most teams are better served by AI features inside their existing stack (Google Analytics 4's AI insights, HubSpot's predictive scoring) than by a dedicated AI analytics tool. The integrations are better and the learning curve is lower.",
      },
      {
        type: "tools",
        title: "The marketing AI stack",
        items: [
          { name: "Claude", valueLine: "Best for long-form copy, brand strategy, and nuanced brand-voice control.", url: "https://claude.ai" },
          { name: "Jasper", valueLine: "Brand voice controls and asset management for teams — the infrastructure layer.", url: "https://jasper.ai" },
          { name: "Adobe Firefly", valueLine: "Commercial-safe AI image generation inside Creative Cloud — production use.", url: "https://firefly.adobe.com" },
          { name: "Midjourney", valueLine: "Best raw image quality for concept work, mood boards, and campaign ideation.", url: "https://midjourney.com" },
          { name: "Perplexity", valueLine: "Cited competitive research in seconds — replaces 80% of Google for market research.", url: "https://perplexity.ai" },
          { name: "HubSpot AI", valueLine: "AI features built into CRM workflows — predictive scoring, email optimization.", url: "https://hubspot.com" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "The highest-ROI move for most marketing teams isn't adopting more tools — it's going deeper on fewer. Pick Claude (or ChatGPT) for copy, Firefly for creative, and Perplexity for research. That stack handles 80% of AI use cases. Add Jasper only when brand-voice drift across writers becomes an actual problem. Find all of these on the [Radar](/radar/browse).",
      },
    ],
  },

  // ─── SEO: Best AI video generators ──────────────────────────────────────────
  {
    slug: "best-ai-video-generators-2026",
    title: "Best AI video generators in 2026",
    deck: "Runway, Kling, Sora, Pika, and more: which AI video tool to use for which job, and what each can realistically produce.",
    date: "2026-06-13",
    readingMin: 7,
    tag: "Guide",
    hero: {
      src: U("1451187580459-43490279c0fa"),
      alt: "Film camera and production equipment on a professional set",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The best AI video generators in 2026 by use case: **Runway Gen-4** for the highest-quality short-form clips and professional creative work, **Kling 2.0** for the best image-to-video quality at the price, **Sora** (OpenAI) for long prompt fidelity and cinematic scenes, and **Pika** for fast iteration and social media content. None of these replace a production team — but all of them meaningfully accelerate one.",
      },
      {
        type: "paragraph",
        text: "AI video generation in 2026 has stabilized into a clear pattern: the tools are genuinely useful for B-roll, product demos, social content, and creative exploration — and still unreliable for anything requiring consistent characters, accurate text rendering, or more than 10 seconds of coherent narrative. Understanding which category your project falls into determines which tool to use.",
      },
      { type: "heading", level: 2, text: "For professional creative work: Runway" },
      {
        type: "paragraph",
        text: "**Runway Gen-4** is the professional standard for AI-assisted video production. The output quality for short cinematic clips is the best in the class — motion is smooth, lighting is consistent, and the model follows complex style prompts reliably. Runway's editing suite (green screen removal, inpainting, motion brush) adds tools that are genuinely useful mid-production, not just for generation. The pricing reflects the professional tier: $15/month for casual use, $35/month for serious projects.",
      },
      { type: "heading", level: 2, text: "For image-to-video: Kling" },
      {
        type: "paragraph",
        text: "**Kling 2.0** (Kuaishou) produces the most realistic image-to-video results — give it a static image and it generates natural, physics-accurate motion that most competitors still can't match. For product shots, fashion, and lifestyle content where you already have an image and want to add life to it, Kling is the clear winner. The pricing is competitive and the international team ships updates fast.",
      },
      { type: "heading", level: 2, text: "For long prompts and cinematic scenes: Sora" },
      {
        type: "paragraph",
        text: "**Sora** (OpenAI) handles the most complex prompt descriptions with the most fidelity — if you write a 300-word cinematic scene description, Sora is most likely to produce something that actually matches it. The footage style leans cinematic by default. Sora also supports the longest generation lengths, making it useful for longer-form narrative clips. Available to ChatGPT Plus and Pro subscribers.",
      },
      { type: "heading", level: 2, text: "For social media speed: Pika" },
      {
        type: "paragraph",
        text: "**Pika** is the fastest tool for social-first content — short clips, effects, and product animations. The generation speed is significantly faster than Runway or Sora, which matters when you're iterating on 20 variations to find one that works for an ad. The quality ceiling is lower, but for TikTok, Reels, and product ads, it's usually more than good enough.",
      },
      {
        type: "tools",
        title: "AI video generators by use case",
        items: [
          { name: "Runway", valueLine: "Professional-grade AI video — best output quality, full editing suite, consistent motion.", url: "https://runwayml.com" },
          { name: "Kling", valueLine: "Best image-to-video results — realistic physics, ideal for product and lifestyle content.", url: "https://klingai.com" },
          { name: "Sora", valueLine: "OpenAI's model — best prompt fidelity for complex cinematic scene descriptions.", url: "https://sora.com" },
          { name: "Pika", valueLine: "Fast iteration for social content — quick generations, product animations, Reels-ready.", url: "https://pika.art" },
          { name: "Luma Dream Machine", valueLine: "Free tier, smooth camera motion — good starting point before committing to a paid tool.", url: "https://lumalabs.ai/dream-machine" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "The honest summary: start with Kling if you have source images, Runway if you need professional-grade output, Pika if you're producing for social at volume, and Sora if you're writing detailed scene descriptions. Test each on your actual use case before subscribing — the quality gap between them is real but use-case-dependent. Browse video tools on the [Radar](/radar/browse).",
      },
    ],
  },

  // ─── SEO: Best AI image generators ─────────────────────────────────────────
  {
    slug: "best-ai-image-generators-2026",
    title: "Best AI image generators in 2026",
    deck: "Midjourney, Ideogram, Adobe Firefly, Flux, and more: which AI image generator to use for each kind of creative work.",
    date: "2026-06-12",
    readingMin: 7,
    tag: "Guide",
    hero: {
      src: U("1561070791-2526d30994b5"),
      alt: "A colorful digital art canvas with abstract shapes and gradients",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The best AI image generators in 2026: **Midjourney v7** for the highest aesthetic quality in any style, **Ideogram 3** for accurate text rendering in images, **Adobe Firefly** for commercially safe assets inside Creative Cloud, **Flux.1** for local/API generation with precise control, and **DALL-E 3** (via ChatGPT) for the best natural-language-to-image prompt handling. Each has a distinct strength — picking the right one for your use case matters more than picking the \"best\" one.",
      },
      {
        type: "paragraph",
        text: "AI image generation has split into distinct market segments in 2026: aesthetic quality (Midjourney), text accuracy (Ideogram), commercial licensing (Firefly), technical control (Flux), and ease of use (DALL-E 3). The models are close enough in overall quality that your choice should be driven by the one dimension that matters most for your specific project.",
      },
      { type: "heading", level: 2, text: "For best overall quality: Midjourney" },
      {
        type: "paragraph",
        text: "**Midjourney v7** still produces the most aesthetically compelling images across styles — photorealism, illustration, concept art, editorial photography. The Discord-based interface is a genuine friction point, but Midjourney is now available via a web app too. The model has excellent taste: even mediocre prompts produce visually coherent results. At $10/month for basic, it's the right starting point for anyone who cares primarily about output quality.",
      },
      { type: "heading", level: 2, text: "For text in images: Ideogram" },
      {
        type: "paragraph",
        text: "**Ideogram 3** solved the problem that broke every other image generator: accurate text rendering. It can produce posters, logos, banners, and typographic designs with readable, correctly spelled text — which was essentially impossible with earlier AI image models. For any project where text needs to appear in the image (marketing materials, social cards, presentations), Ideogram is the only tool worth using.",
      },
      { type: "heading", level: 2, text: "For commercial use: Adobe Firefly" },
      {
        type: "paragraph",
        text: "**Adobe Firefly** is trained exclusively on licensed Adobe Stock content and public domain imagery, making it the only major AI image generator with a credible commercial indemnity promise. If you're generating assets that go into client work, product packaging, or advertising, Firefly removes the licensing risk that other tools carry. The quality has improved significantly and the Photoshop/Illustrator integration is seamless.",
      },
      { type: "heading", level: 2, text: "For API and fine-tuning control: Flux" },
      {
        type: "paragraph",
        text: "**Flux.1** (Black Forest Labs) is the open-weights model that has displaced Stable Diffusion as the preferred foundation for fine-tuning and API-based applications. It produces better default outputs than SDXL, supports LoRA fine-tuning for consistent character/style, and runs efficiently on consumer hardware. For developers building image generation into their own products, Flux is the foundation to build on.",
      },
      {
        type: "tools",
        title: "AI image generators by use case",
        items: [
          { name: "Midjourney", valueLine: "Best overall aesthetic quality — photorealism, illustration, concept art, editorial.", url: "https://midjourney.com" },
          { name: "Ideogram", valueLine: "Only tool with reliable text rendering — posters, banners, typographic design.", url: "https://ideogram.ai" },
          { name: "Adobe Firefly", valueLine: "Commercially licensed — safe for client work, ad creative, and product packaging.", url: "https://firefly.adobe.com" },
          { name: "Flux.1", valueLine: "Open weights, fine-tuning support — the foundation for custom AI image products.", url: "https://blackforestlabs.ai" },
          { name: "DALL-E 3", valueLine: "Best natural language following — available free via ChatGPT, good for casual use.", url: "https://openai.com/dall-e-3" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "Start with Midjourney for quality, switch to Ideogram the moment your project includes text, and use Firefly when commercial licensing matters. For building products, Flux gives you the most control. All five of these tools are moving fast — the quality rankings may shift, but the specialization pattern is stable. Explore AI creative tools on the [Radar](/radar/browse).",
      },
    ],
  },

  // ─── SEO: Best AI chatbots ───────────────────────────────────────────────────
  {
    slug: "best-ai-chatbots-2026",
    title: "Best AI chatbots in 2026",
    deck: "Claude, ChatGPT, Gemini, Perplexity, and more: an honest comparison of the top AI assistants and which to choose.",
    date: "2026-06-11",
    readingMin: 8,
    tag: "Comparison",
    hero: {
      src: U("1531746790731-6c087fecd65a"),
      alt: "Abstract chat interface with glowing blue orbs representing AI communication",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The best AI chatbot in 2026 depends on your primary use case: **Claude** (Anthropic) for writing, reasoning, and coding; **ChatGPT** (OpenAI) for the broadest tool ecosystem and plugins; **Gemini** (Google) for Google Workspace integration and real-time web access; and **Perplexity** for research and fact-checked web queries with citations. For most knowledge workers, Claude is the primary tool and Perplexity is the research companion.",
      },
      {
        type: "paragraph",
        text: "The AI chatbot market has matured to the point where all four major players are good — the question is no longer \"which one works?\" but \"which one is optimized for what I actually do?\" The capability differences are real but narrower than they were in 2024. The bigger differentiators in 2026 are: integrations (what apps does it connect to?), context window (how much can it hold?), and reasoning quality for the specific tasks you run most often.",
      },
      { type: "heading", level: 2, text: "Claude — best for writing and reasoning" },
      {
        type: "paragraph",
        text: "**Claude** (Anthropic) is the model most knowledge workers reach for when quality matters. The writing is cleaner and more nuanced than GPT-4o's — Claude doesn't pad, doesn't add unnecessary caveats, and calibrates formality to the context without being told. For coding, Claude Code is the best agentic implementation of any frontier model. The extended thinking mode (Claude Sonnet with `thinking: extended`) produces noticeably better results on hard reasoning problems. The main limitation: no image generation, and the free tier is limited.",
      },
      { type: "heading", level: 2, text: "ChatGPT — best for breadth and ecosystem" },
      {
        type: "paragraph",
        text: "**ChatGPT** (OpenAI) has the widest ecosystem: DALL-E 3 for image generation, Code Interpreter for data analysis, a plugin store with hundreds of integrations, and GPT-4o's voice mode for natural conversation. If you need one tool that does everything, ChatGPT Plus is the right choice. The quality ceiling is slightly lower than Claude on writing tasks, but the breadth is genuinely unmatched.",
      },
      { type: "heading", level: 2, text: "Gemini — best for Google Workspace users" },
      {
        type: "paragraph",
        text: "**Gemini** (Google) is the right choice if your workflow is built around Google products. The integration with Gmail, Docs, Drive, and Sheets is seamless — Gemini can draft emails, summarize documents, and query your Drive without copy-paste. Gemini 2.0 Pro is a genuinely strong model for reasoning, and the 1 million token context window (Gemini 1.5 Pro) is larger than any competitor. For non-Google users, the integrations are less compelling.",
      },
      { type: "heading", level: 2, text: "Perplexity — best for research" },
      {
        type: "paragraph",
        text: "**Perplexity** occupies a distinct niche: it's a search engine with a language model interface. Every answer includes citations, and the results are current (it searches the web in real time). For competitive research, fact-checking, and any question where you need to know where the information came from, Perplexity is faster and more reliable than asking a chatbot that might hallucinate. It's the one AI tool that's genuinely better than Google for research queries.",
      },
      {
        type: "tools",
        title: "Best AI chatbots by use case",
        items: [
          { name: "Claude", valueLine: "Best for writing, coding, and nuanced reasoning — the quality benchmark in 2026.", url: "https://claude.ai" },
          { name: "ChatGPT", valueLine: "Broadest ecosystem — image gen, code interpreter, plugin store, voice mode.", url: "https://chatgpt.com" },
          { name: "Gemini", valueLine: "Google Workspace integration — Gmail, Docs, Drive, Sheets; massive context window.", url: "https://gemini.google.com" },
          { name: "Perplexity", valueLine: "Real-time cited search — the best tool for research, fact-checking, competitive intel.", url: "https://perplexity.ai" },
          { name: "Mistral Le Chat", valueLine: "Fast European alternative — strong coding model, GDPR-friendly data handling.", url: "https://chat.mistral.ai" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "Use Claude as your primary writing and reasoning tool, Perplexity for research, and ChatGPT when you need the plugin ecosystem or image generation. Gemini is the right swap for Claude if your life runs in Google Docs. You don't need all four — pick two and build fluency. Compare all AI assistants on the [Radar](/radar/browse).",
      },
    ],
  },

  // ─── SEO: Best AI tools for SEO ─────────────────────────────────────────────
  {
    slug: "best-ai-tools-for-seo-2026",
    title: "Best AI tools for SEO in 2026",
    deck: "The AI tools that actually move rankings: from keyword research to content briefs to technical audits and internal linking.",
    date: "2026-06-10",
    readingMin: 7,
    tag: "Guide",
    hero: {
      src: U("1460925895917-afdab827c52f"),
      alt: "Analytics dashboard showing SEO performance graphs on a laptop",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The best AI tools for SEO in 2026: **Semrush** or **Ahrefs** (both have AI features now) for keyword research and competitive analysis, **Surfer SEO** for content optimization briefs, **Claude** for writing content that ranks, **Screaming Frog** with AI integration for technical audits, and **Perplexity** for understanding what searchers actually want from a query. The hardest SEO work — finding the right angle for a topic — is still human judgment.",
      },
      {
        type: "paragraph",
        text: "AI has changed two things in SEO: it has dramatically lowered the cost of producing content, which means quality differentiation matters more than ever, and it has improved the tooling around keyword research and content briefs to the point where an individual can compete with much larger teams. What AI hasn't changed: Google still rewards expertise, authoritativeness, and trustworthiness — and none of those are automatable.",
      },
      { type: "heading", level: 2, text: "Keyword research and competitive analysis" },
      {
        type: "paragraph",
        text: "**Semrush** added AI-powered keyword clustering and topic modeling in 2025, which makes it significantly faster to go from \"I want to write about AI tools\" to a structured content calendar organized around search intent clusters. **Ahrefs** has comparable AI features and slightly better backlink data. Both cost $100-200/month — if you can only afford one research tool, Ahrefs tends to edge out Semrush on data quality.",
      },
      {
        type: "paragraph",
        text: "For budget-constrained teams, **Google Search Console** with AI analysis (paste your data into Claude) gets you 80% of the value for the cost of your Claude subscription. The data is first-party and trustworthy; you're just not getting competitor intelligence.",
      },
      { type: "heading", level: 2, text: "Content briefs and optimization" },
      {
        type: "paragraph",
        text: "**Surfer SEO** is the most direct translation of \"what does Google want to see on this page?\" — it analyzes the top-ranking pages for a keyword and produces a brief with recommended word count, headings, and semantic terms to include. The AI content editor shows you a score as you write. The caveat: following Surfer too literally produces generic content that matches competitors. Use it for structure, not voice.",
      },
      {
        type: "callout",
        variant: "warning",
        title: "The AI content trap",
        text: "AI-generated content that exactly matches Surfer recommendations tends to look identical to 10 other articles on the same topic. Google's Helpful Content Update penalizes thin, pattern-matched content. Use AI for research and structure, but add unique insight, data, or perspective that competitors don't have.",
      },
      { type: "heading", level: 2, text: "Writing the content" },
      {
        type: "paragraph",
        text: "**Claude** writes the cleanest SEO content of any current model — it doesn't default to listicles, doesn't over-pad, and follows nuanced style instructions. The right workflow: use Surfer or Ahrefs for the brief, write the outline yourself, and use Claude to draft sections. Then edit to add original insight, examples, and your own perspective. Fully AI-written content from a brief rarely ranks well in 2026 — Google has gotten good at detecting it.",
      },
      {
        type: "tools",
        title: "AI SEO tool stack",
        items: [
          { name: "Ahrefs", valueLine: "Best backlink data + AI keyword clustering — the research foundation.", url: "https://ahrefs.com" },
          { name: "Surfer SEO", valueLine: "Content briefs from top-ranking competitors — structure optimization, not voice.", url: "https://surferseo.com" },
          { name: "Claude", valueLine: "Best model for writing content that reads naturally — essential for quality differentiation.", url: "https://claude.ai" },
          { name: "Semrush", valueLine: "Competitive analysis, topic modeling, AI-powered content calendar planning.", url: "https://semrush.com" },
          { name: "Screaming Frog", valueLine: "Technical SEO audit — crawl issues, broken links, internal link analysis.", url: "https://screamingfrog.co.uk" },
          { name: "Perplexity", valueLine: "Understand searcher intent — see what real AI-generated answers say about your topic.", url: "https://perplexity.ai" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "The highest-leverage AI SEO workflow: Ahrefs for keyword clusters → Claude to understand search intent → Surfer for content structure → Claude to draft → human editing for unique perspective. AI handles the scaffolding; your expertise is still the differentiator. Find SEO tools on the [Radar](/radar/browse).",
      },
    ],
  },

  // ─── SEO: Best AI tools for social media ────────────────────────────────────
  {
    slug: "best-ai-tools-for-social-media-2026",
    title: "Best AI tools for social media in 2026",
    deck: "From caption writing to scheduling to analytics. The AI tools that help individuals and teams show up consistently on social.",
    date: "2026-06-09",
    readingMin: 6,
    tag: "Guide",
    hero: {
      src: U("1611162617213-7d7a39e9b1d7"),
      alt: "Person holding a smartphone showing colorful social media feed",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The best AI tools for social media in 2026: **Buffer** with AI Assistant for scheduling and caption suggestions, **Claude** for writing posts that sound like you instead of a content calendar, **Canva AI** for graphics and carousels, **Taplio** for LinkedIn specifically, and **Opus Clip** for automatically cutting long videos into short-form clips. The biggest unlock isn't any single tool — it's a workflow where AI handles the first draft and you provide the voice.",
      },
      {
        type: "paragraph",
        text: "The pattern across every successful social media AI use case in 2026 is the same: AI dramatically compresses the time between \"I have something to say\" and \"this is ready to post.\" The voice and ideas still need to be yours — pure AI-generated social content is recognizable and tends to underperform. The right question is: what's the smallest AI intervention that makes you 3x more consistent?",
      },
      { type: "heading", level: 2, text: "Content creation" },
      {
        type: "paragraph",
        text: "**Claude** is the best tool for writing social media posts that don't sound AI-written. Give it your raw notes or a voice memo transcript and ask it to draft a LinkedIn post in your established style — it will produce something you'll recognize as close to your voice. **Taplio** is a more opinionated choice for LinkedIn specifically: it has a built-in post library, AI suggestions, and scheduling, which makes it faster if LinkedIn is your main channel.",
      },
      {
        type: "paragraph",
        text: "For graphics, **Canva AI** adds generative features (background generation, image expansion, AI text effects) directly inside Canva — no context switching. For Reels and TikToks, **Opus Clip** watches a long video (a podcast, a talk, a webinar) and automatically extracts the best 30-90 second clips with captions. One 60-minute podcast episode can become 15 short-form clips in under 10 minutes.",
      },
      { type: "heading", level: 2, text: "Scheduling and analytics" },
      {
        type: "paragraph",
        text: "**Buffer** remains the cleanest scheduling tool with the most sensible AI features: it suggests posting times based on your historical performance, drafts caption variations, and has a content repurposing feature that turns a blog post into Twitter/X threads and LinkedIn posts. **Later** is the stronger choice for Instagram-heavy workflows — the visual grid preview and hashtag suggestions are better.",
      },
      {
        type: "tools",
        title: "AI social media tool stack",
        items: [
          { name: "Buffer", valueLine: "Scheduling + AI caption suggestions — smart posting times, content repurposing.", url: "https://buffer.com" },
          { name: "Claude", valueLine: "Best for writing posts that sound like you — paste notes, get a real post.", url: "https://claude.ai" },
          { name: "Canva AI", valueLine: "AI graphics inside Canva — background gen, image expand, text effects.", url: "https://canva.com" },
          { name: "Opus Clip", valueLine: "Auto-cut long videos into short clips with captions — one podcast to 15 Reels.", url: "https://opus.pro" },
          { name: "Taplio", valueLine: "LinkedIn-first — post library, AI suggestions, scheduling, engagement analytics.", url: "https://taplio.com" },
          { name: "Later", valueLine: "Instagram-focused scheduler — visual grid preview, hashtag suggestions.", url: "https://later.com" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "The minimal viable AI social stack: Buffer for scheduling, Claude for first drafts, Canva AI for graphics, Opus Clip if you produce video. Add Taplio only if LinkedIn is your primary channel. Keep your voice and ideas front and center — that's still the part AI can't replace. Browse social media tools on the [Radar](/radar/browse).",
      },
    ],
  },

  // ─── SEO: Best AI tools for customer support ────────────────────────────────
  {
    slug: "best-ai-tools-for-customer-support-2026",
    title: "Best AI tools for customer support in 2026",
    deck: "Intercom, Zendesk AI, Freshdesk, and more: which AI support tools actually deflect tickets and which just add complexity.",
    date: "2026-06-08",
    readingMin: 6,
    tag: "Guide",
    hero: {
      src: U("1499750310107-5fef28a66643"),
      alt: "Customer support agent working at a desk with headset and computer",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The best AI tools for customer support in 2026: **Intercom Fin** for the highest-quality AI resolution rate, **Zendesk AI** for teams already on Zendesk, **Freshdesk Freddy** for mid-market teams on a budget, and **Claude API** (via a custom integration) for teams who need full control over the resolution logic. The key metric to track before buying any of these: how many tickets are actually deflectable by AI? Start there.",
      },
      {
        type: "paragraph",
        text: "AI customer support has divided into two clear markets: all-in-one platforms with built-in AI (Intercom, Zendesk, Freshdesk) and custom builds using foundation models via API. The platform tools are faster to deploy and good enough for most use cases; the custom build is worth it only when your product is complex enough that canned answers consistently fail.",
      },
      { type: "heading", level: 2, text: "All-in-one platforms" },
      {
        type: "paragraph",
        text: "**Intercom Fin** (powered by Claude) consistently achieves the highest deflection rates in the category — independent comparisons put it at 45-65% ticket deflection for typical SaaS products. It pulls from your help documentation, gives confident answers, and escalates to a human when it's uncertain. The pricing is per-resolution ($0.99 per AI resolution), which aligns costs with outcomes. At scale, this is more expensive than per-seat pricing — calculate your expected volume before committing.",
      },
      {
        type: "paragraph",
        text: "**Zendesk AI** (powered by OpenAI) integrates more deeply with Zendesk's existing workflow automation, routing, and CSAT tools. If you're already on Zendesk and your team lives in Zendesk, the AI feels native rather than bolted-on. **Freshdesk Freddy** is the right choice for teams who want AI support without enterprise pricing — the deflection rates are lower than Fin but the cost is significantly lower too.",
      },
      { type: "heading", level: 2, text: "Custom builds" },
      {
        type: "paragraph",
        text: "For complex products — developer tools, enterprise software, anything with extensive APIs and configuration options — canned AI responses from a help doc corpus frequently fail on edge cases. Building a custom support bot on the **Anthropic API** with RAG over your documentation, changelogs, and support history typically outperforms off-the-shelf tools for these use cases. The investment is 4-8 weeks of engineering; the quality ceiling is much higher.",
      },
      {
        type: "tools",
        title: "AI customer support tools",
        items: [
          { name: "Intercom Fin", valueLine: "Highest deflection rates — Claude-powered, per-resolution pricing, pulls from your help docs.", url: "https://intercom.com/fin" },
          { name: "Zendesk AI", valueLine: "Native Zendesk integration — best for teams already in the Zendesk ecosystem.", url: "https://zendesk.com/ai" },
          { name: "Freshdesk Freddy", valueLine: "Mid-market budget option — lower deflection than Fin but much lower price.", url: "https://freshworks.com/freshdesk/freddy-ai" },
          { name: "Anthropic API", valueLine: "Foundation model for custom support bots — best quality ceiling for complex products.", url: "https://anthropic.com/api" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "Before evaluating any AI support tool: audit your last 200 tickets and count how many had clear, documentable answers. If it's less than 40%, AI deflection won't move your metrics much regardless of the tool. If it's over 60%, Intercom Fin is likely the fastest path to ROI. Find all customer support AI tools on the [Radar](/radar/browse).",
      },
    ],
  },

  // ─── SEO: Claude vs Gemini ───────────────────────────────────────────────────
  {
    slug: "claude-vs-gemini-which-to-use-2026",
    title: "Claude vs Gemini: which AI model should you use in 2026?",
    deck: "An honest comparison of Anthropic's Claude and Google's Gemini across writing, coding, research, and integrations.",
    date: "2026-06-07",
    readingMin: 7,
    tag: "Comparison",
    hero: {
      src: U("1487058792275-0ad4aaf24ca7"),
      alt: "Two laptops side by side with glowing screens representing a comparison",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "**Claude** wins for writing quality, coding, and nuanced reasoning. **Gemini** wins for Google Workspace integration, real-time web search, and the largest context window (1M tokens in Gemini 1.5 Pro). If you live in Google Docs and Gmail and care most about web access, use Gemini. If you care most about the quality of what you produce — prose, code, analysis — use Claude. Both are genuinely good; the choice is about your workflow, not about one being broken.",
      },
      {
        type: "paragraph",
        text: "The Claude vs. Gemini comparison is increasingly about ecosystem fit rather than raw model capability. Both models are frontier-class in 2026 — the capability gap has narrowed. The differences that remain are meaningful but narrow: writing quality, instruction following, and coding favor Claude; real-time information, Google integration, and context length favor Gemini.",
      },
      { type: "heading", level: 2, text: "Writing quality" },
      {
        type: "paragraph",
        text: "Claude's writing is consistently more natural and better-calibrated to context. It doesn't pad, avoids clichéd phrasings, and matches formality to the situation without being instructed. Gemini's writing is competent but tends toward a slightly more formal, report-like tone that requires more instruction to adjust. For anything where the quality of the prose matters — marketing, essays, documentation — Claude produces better first drafts.",
      },
      { type: "heading", level: 2, text: "Coding" },
      {
        type: "paragraph",
        text: "Claude Sonnet is the preferred model among developers for coding tasks — the instruction following on complex multi-file changes is more reliable, and the error messages when something goes wrong are more specific and actionable. Gemini 2.0 Pro is a strong coder, but independent benchmarks and developer feedback consistently put Claude ahead on real-world coding tasks (as opposed to benchmark tests). Claude Code (the agentic CLI) is a significant capability that Gemini has no equivalent for.",
      },
      { type: "heading", level: 2, text: "Research and web access" },
      {
        type: "paragraph",
        text: "Gemini has real-time Google Search integration that Claude lacks. For questions where current information matters — recent news, live stock prices, recent product releases — Gemini is more reliable because it actually searches the web rather than relying on training data. Claude's knowledge has a cutoff; Gemini's doesn't when search is enabled.",
      },
      { type: "heading", level: 2, text: "Google Workspace integration" },
      {
        type: "paragraph",
        text: "If your work lives in Google Docs, Gmail, Sheets, and Drive, Gemini's integration advantage is real and significant. It can draft emails, summarize Google Docs, analyze Sheets data, and search your Drive — all without copy-paste. Claude has no equivalent deep integration with Google products. For Google-heavy workflows, this is often the deciding factor.",
      },
      {
        type: "tools",
        title: "Claude vs Gemini by use case",
        items: [
          { name: "Claude", valueLine: "Best for writing, coding, and reasoning — Anthropic's frontier model, excellent instruction following.", url: "https://claude.ai" },
          { name: "Gemini", valueLine: "Best for Google Workspace users — real-time search, 1M token context, Gmail/Docs integration.", url: "https://gemini.google.com" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "The honest answer: use both. Claude for writing and coding, Gemini when you need current information or are working inside Google products. At $20/month each, using both is the right call for professional use. See both on the [Radar](/radar/browse).",
      },
    ],
  },

  // ─── SEO: Best AI tools for education ───────────────────────────────────────
  {
    slug: "best-ai-tools-for-education-2026",
    title: "Best AI tools for teachers and students in 2026",
    deck: "From lesson planning to personalized tutoring to research. The AI tools that are actually changing how people teach and learn.",
    date: "2026-06-06",
    readingMin: 7,
    tag: "Guide",
    hero: {
      src: U("1503676260728-1c00da094a0b"),
      alt: "Student studying at a desk surrounded by books and a laptop",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The best AI tools for education in 2026: **Khan Academy Khanmigo** for personalized tutoring and homework help, **Claude** for essay writing assistance and research summaries, **Notebook LM** (Google) for synthesizing study materials from PDFs and notes, **Diffit** for teachers creating differentiated reading materials, and **Perplexity** for cited research that's safer than Wikipedia. The biggest shift: AI tutors are replacing office hours for accessible, immediate explanations.",
      },
      {
        type: "paragraph",
        text: "Education is one of the domains where the productivity-vs-learning tension is sharpest: AI can write a student's essay, but doing so removes the learning that writing produces. The tools that are genuinely valuable in education are the ones that help you understand things faster and better — not the ones that do the work for you. This distinction matters when evaluating which AI tool to use and how.",
      },
      { type: "heading", level: 2, text: "For tutoring and homework help" },
      {
        type: "paragraph",
        text: "**Khan Academy Khanmigo** is the most pedagogically thoughtful AI tutor available — it's designed to guide you toward understanding rather than just giving answers. When a student asks \"what's the answer to this math problem?\", Khanmigo asks questions back to help them work through the reasoning. It covers K-12 subjects and SAT/ACT prep. For younger students especially, this approach produces better learning outcomes than just asking ChatGPT.",
      },
      {
        type: "paragraph",
        text: "For university-level and adult learning, **Claude** is the better tutor for complex topics. It explains things at the right level when you specify your background, generates examples tailored to your situation, and can work through problems step-by-step without just stating the answer. The \"explain this like I have a background in X but not Y\" pattern works extremely well with Claude.",
      },
      { type: "heading", level: 2, text: "For research and note-taking" },
      {
        type: "paragraph",
        text: "**NotebookLM** (Google) is genuinely transformative for research-heavy students. Upload your lecture notes, textbook chapters, and research papers, and NotebookLM lets you ask questions against the full corpus — it answers from your sources and cites them. No more rereading a 300-page book to find the passage you half-remember. For exam preparation, the ability to generate study guides, practice questions, and summaries from your own notes is powerful.",
      },
      { type: "heading", level: 2, text: "For teachers" },
      {
        type: "paragraph",
        text: "**Diffit** is the most practical AI tool for teachers who need to differentiate materials for different reading levels. Give it any text or a topic, and it generates a version at any Lexile level with comprehension questions, vocabulary lists, and discussion prompts. What used to take 2 hours takes 5 minutes. **Claude** is the right tool for lesson planning, writing assessment rubrics, and generating a variety of practice problems on a topic.",
      },
      {
        type: "tools",
        title: "AI education tools",
        items: [
          { name: "Khan Academy Khanmigo", valueLine: "Socratic AI tutor for K-12 — guides toward understanding, doesn't give direct answers.", url: "https://khanacademy.org/khanmigo" },
          { name: "NotebookLM", valueLine: "Q&A over your own notes and PDFs — cited answers from your source materials.", url: "https://notebooklm.google.com" },
          { name: "Diffit", valueLine: "Differentiated reading materials for any Lexile level — lesson planning time-saver for teachers.", url: "https://diffit.me" },
          { name: "Claude", valueLine: "University-level tutoring, essay feedback, step-by-step explanations calibrated to your level.", url: "https://claude.ai" },
          { name: "Perplexity", valueLine: "Cited research — safer than Wikipedia, faster than library databases, sources included.", url: "https://perplexity.ai" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "The most important rule for using AI in education: use it to understand things better, not to skip understanding entirely. Khanmigo and NotebookLM are designed around this principle. Claude and Perplexity are powerful but require self-discipline to use in a way that deepens rather than replaces learning. Browse education AI tools on the [Radar](/radar/browse).",
      },
    ],
  },

  // ─── SEO: Best AI tools for data analysis ───────────────────────────────────
  {
    slug: "best-ai-tools-for-data-analysis-2026",
    title: "Best AI tools for data analysis in 2026",
    deck: "From CSV analysis to BI dashboards to Python notebooks: the AI tools that compress the time from question to insight.",
    date: "2026-06-05",
    readingMin: 7,
    tag: "Guide",
    hero: {
      src: U("1460925895917-afdab827c52f"),
      alt: "Data visualization charts and graphs on a screen with glowing colors",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The best AI tools for data analysis in 2026: **ChatGPT Code Interpreter** for one-off CSV and Excel analysis without writing code, **Claude** for explaining what your data means and drafting analysis plans, **Julius AI** for fast conversational data analysis and chart generation, **Hex** for collaborative data notebooks with AI assistance, and the **Anthropic API** for building automated analysis pipelines. The right tool depends on whether you're a technical or non-technical analyst.",
      },
      {
        type: "paragraph",
        text: "The clearest AI improvement in data work is the elimination of the code barrier. In 2022, running a correlation analysis or generating a chart required either writing Python/R or knowing how to use a BI tool. In 2026, you can upload a CSV and ask in plain English. The quality is good enough for exploratory analysis — the caveat is that AI-generated code needs review before being used in production or reports.",
      },
      { type: "heading", level: 2, text: "For non-technical users" },
      {
        type: "paragraph",
        text: "**ChatGPT Code Interpreter** (part of ChatGPT Plus) is the most widely used tool for non-technical data analysis. Upload a CSV or Excel file, ask questions in plain English, and it writes and runs Python code to answer. The output includes both the code and the result — a chart, a table, a correlation matrix. It handles surprisingly complex analyses. The limitation: it runs in an isolated session, so you can't build on results across sessions without re-uploading data.",
      },
      {
        type: "paragraph",
        text: "**Julius AI** is built specifically for data analysis with a faster, more focused interface than ChatGPT. It generates charts, runs statistical tests, and handles common analysis patterns quickly. For a non-technical analyst who just needs to answer business questions from data, Julius is often faster than ChatGPT's Code Interpreter.",
      },
      { type: "heading", level: 2, text: "For technical analysts" },
      {
        type: "paragraph",
        text: "**Hex** is the right tool for data teams who already work in notebooks. It adds AI autocomplete, explanation, and query generation directly into a collaborative notebook environment — the team can share and build on each other's work. The AI features are integrated rather than bolted-on. **Claude** paired with a Python environment (or Claude Code) is the best tool for complex analysis where you need to reason about methodology, not just generate code.",
      },
      { type: "heading", level: 2, text: "Understanding your data" },
      {
        type: "paragraph",
        text: "The underused AI use case in data analysis: pasting your analysis results into **Claude** and asking \"what does this tell me?\" and \"what might I be missing?\" Claude is good at identifying confounders, suggesting additional cuts of data to look at, and explaining statistical results to non-technical stakeholders. The model can also write the narrative around your findings in plain language.",
      },
      {
        type: "tools",
        title: "AI data analysis tools",
        items: [
          { name: "ChatGPT Code Interpreter", valueLine: "Natural language to Python analysis — upload CSV, ask questions, get charts and tables.", url: "https://chatgpt.com" },
          { name: "Julius AI", valueLine: "Fast conversational data analysis — focused interface, good chart generation.", url: "https://julius.ai" },
          { name: "Hex", valueLine: "AI-assisted collaborative notebooks for data teams — integrated, not bolted-on.", url: "https://hex.tech" },
          { name: "Claude", valueLine: "Best for reasoning about data, planning methodology, and explaining findings.", url: "https://claude.ai" },
          { name: "Tableau Pulse", valueLine: "AI-powered insight summaries inside Tableau — explains what changed and why.", url: "https://tableau.com/products/tableau-pulse" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "Non-technical analyst: start with ChatGPT Code Interpreter for any CSV analysis — it covers 80% of business questions. Technical analyst: Hex for collaborative notebooks, Claude for methodology and interpretation. The real leverage isn't the tool — it's learning to ask better questions of your data. Find all data tools on the [Radar](/radar/browse).",
      },
    ],
  },

  // ─── SEO: Best AI tools for email ───────────────────────────────────────────
  {
    slug: "best-ai-tools-for-email-2026",
    title: "Best AI tools for email writing in 2026",
    deck: "Superhuman AI, Gmail's Help Me Write, Claude, and more: how to actually use AI to spend less time in your inbox.",
    date: "2026-06-04",
    readingMin: 6,
    tag: "Guide",
    hero: {
      src: U("1498050108023-c5249f4df085"),
      alt: "Open laptop showing an email inbox with morning light",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The best AI tools for email in 2026: **Superhuman AI** for power users who process hundreds of emails daily, **Gmail's Help Me Write** for anyone already in Google Workspace, **Claude** for drafting nuanced or high-stakes emails outside the inbox, and **Shortwave** as a Gmail client alternative with strong AI triage features. The practical unlock isn't AI writing your emails — it's AI triaging your inbox so you only write the ones that require your judgment.",
      },
      {
        type: "paragraph",
        text: "Email is where the gap between AI hype and AI utility is clearest. Most AI email tools spend marketing budget on \"write a whole email from a two-word prompt\" — which produces generic, easily ignored emails. The genuinely useful AI email features are triage (what actually needs my attention?), summarization (what is this long thread saying?), and drafting (a first draft I can edit, not a finished email I send as-is).",
      },
      { type: "heading", level: 2, text: "AI email clients" },
      {
        type: "paragraph",
        text: "**Superhuman** is the best email client for people who treat email as a core workflow. The AI features — auto-summarization of long threads, split inbox with AI triage, AI reply drafting — are well-integrated and fast. The price ($30/month) is hard to justify unless you spend 2+ hours daily in email and you're willing to move your entire inbox. For the right user, the time savings are real.",
      },
      {
        type: "paragraph",
        text: "**Shortwave** is a Gmail-compatible client with strong AI features at a lower price point. The AI summaries, follow-up reminders, and scheduling assistance are good. It's a better starting point than Superhuman for people who want to try an AI email client without the full switching cost.",
      },
      { type: "heading", level: 2, text: "Built-in AI features" },
      {
        type: "paragraph",
        text: "**Gmail's Help Me Write** (Gemini) is built directly into Google Workspace and is free with a Workspace subscription. For standard professional emails, it's often good enough — the drafts need editing but are a reasonable starting point. The integration is seamless: you don't switch context to use it. **Outlook Copilot** is the equivalent for Microsoft 365 users.",
      },
      { type: "heading", level: 2, text: "For high-stakes emails" },
      {
        type: "paragraph",
        text: "For important emails — a pitch to an investor, a difficult conversation with a customer, a negotiation — built-in AI email assistants are too shallow. The right tool is **Claude**: paste the context (\"I need to decline this partnership offer without damaging the relationship, here's the background\"), and it will draft something that actually accounts for the nuance. Then edit it until it sounds like you. For these emails, AI is a drafting partner, not an autocomplete.",
      },
      {
        type: "tools",
        title: "AI email tools",
        items: [
          { name: "Superhuman", valueLine: "Power user email client — AI triage, thread summaries, fast keyboard-driven inbox.", url: "https://superhuman.com" },
          { name: "Shortwave", valueLine: "Gmail client with AI summaries and scheduling — Superhuman alternative at lower price.", url: "https://shortwave.com" },
          { name: "Gmail Help Me Write", valueLine: "Free for Workspace users — drafts standard professional emails, no context switching.", url: "https://workspace.google.com" },
          { name: "Claude", valueLine: "Best for nuanced high-stakes emails — paste context, get a thoughtful first draft.", url: "https://claude.ai" },
        ],
      },
      { type: "divider" },
        {
          type: "paragraph",
          text: "The practical advice: use whatever email client you already have with its built-in AI for routine emails. Switch to Superhuman only if you're spending 2+ hours daily in email. For emails that matter — the pitch, the apology, the negotiation — use Claude and take the 5 minutes to get the draft right. Find email and productivity tools on the [Radar](/radar/browse).",
        },
    ],
  },

  // ─── SEO: Best AI tools for research ────────────────────────────────────────
  {
    slug: "best-ai-tools-for-research-2026",
    title: "Best AI tools for research in 2026",
    deck: "Perplexity, NotebookLM, Elicit, Consensus, and more. The AI research stack for analysts, academics, and curious generalists.",
    date: "2026-06-03",
    readingMin: 7,
    tag: "Guide",
    hero: {
      src: U("1558655146-9f40138edfeb"),
      alt: "Stack of research papers and books on a desk with warm afternoon light",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The best AI research tools in 2026: **Perplexity** for fast, cited web research; **NotebookLM** for synthesizing your own document corpus; **Elicit** for searching and analyzing academic papers; **Consensus** for answering questions with peer-reviewed evidence; and **Claude** for reasoning about complex topics, synthesizing multiple sources, and writing up findings. Together these tools replace most of what used to require hours in a library or database.",
      },
      {
        type: "paragraph",
        text: "Research has two distinct phases: finding information and making sense of it. Different AI tools are optimized for each. Perplexity and Elicit are retrieval tools — they help you find things faster. NotebookLM and Claude are synthesis tools — they help you understand what you found. A complete AI research stack uses both types.",
      },
      { type: "heading", level: 2, text: "Finding information" },
      {
        type: "paragraph",
        text: "**Perplexity** is the most useful everyday research tool because it answers questions with real-time web sources and cites them. The citations make it far more trustworthy than asking a chatbot that might confabulate facts — you can verify every claim immediately. Perplexity Pro adds deeper search modes, Claude and GPT-4o as optional models, and file upload for document-based queries.",
      },
      {
        type: "paragraph",
        text: "For academic research specifically, **Elicit** and **Consensus** search peer-reviewed literature rather than the web. Elicit returns relevant papers with AI-extracted summaries of methodology and findings — the equivalent of reading 50 abstracts in 5 minutes. Consensus answers research questions with a consensus assessment from the literature. Both are better than Google Scholar for most literature search tasks.",
      },
      { type: "heading", level: 2, text: "Synthesizing your documents" },
      {
        type: "paragraph",
        text: "**NotebookLM** (Google) lets you upload up to 50 documents — research papers, interview transcripts, reports, meeting notes — and then ask questions that synthesize across all of them. The answers are grounded in your sources (it won't hallucinate information from outside your uploads) and cited to specific documents. For any project where you're processing a corpus of material, NotebookLM compresses days of reading into hours.",
      },
      { type: "heading", level: 2, text: "Reasoning and writing up" },
      {
        type: "paragraph",
        text: "**Claude** is the best tool for the final phase of research: making sense of what you've found, identifying gaps, and writing it up. Paste in your notes, your Perplexity summaries, and your Elicit results, and ask Claude to synthesize them into a coherent narrative or identify the key open questions. For academic and analytical writing, Claude's ability to maintain precision and avoid overstating claims is particularly valuable.",
      },
      {
        type: "tools",
        title: "AI research tool stack",
        items: [
          { name: "Perplexity", valueLine: "Cited web research in real time — the fastest way to get answers with sources.", url: "https://perplexity.ai" },
          { name: "NotebookLM", valueLine: "Q&A over your own document corpus — grounded, cited synthesis across 50 uploads.", url: "https://notebooklm.google.com" },
          { name: "Elicit", valueLine: "Academic literature search — extracts methods and findings from peer-reviewed papers.", url: "https://elicit.com" },
          { name: "Consensus", valueLine: "Evidence-based answers from the scientific literature — what does research say about X?", url: "https://consensus.app" },
          { name: "Claude", valueLine: "Best for synthesis and writing up — reason across sources, identify gaps, draft reports.", url: "https://claude.ai" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "The AI research workflow: Perplexity for initial orientation → Elicit for academic literature → NotebookLM to synthesize your source corpus → Claude to reason and write. Each tool handles the phase it's designed for. Combining them is more powerful than using any single one. Find all research tools on the [Radar](/radar/browse).",
      },
    ],
  },

  // ─── SEO: Best AI tools for project management ──────────────────────────────
  {
    slug: "best-ai-tools-for-project-management-2026",
    title: "Best AI tools for project management in 2026",
    deck: "Linear, Notion AI, ClickUp AI, and more: which AI PM tools actually reduce coordination overhead and which are features looking for a use case.",
    date: "2026-06-02",
    readingMin: 6,
    tag: "Guide",
    hero: {
      src: U("1517180102446-f3ece451e9d8"),
      alt: "Project planning whiteboard with sticky notes and timelines in a modern office",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The best AI tools for project management in 2026: **Linear** for software teams (AI issue triage and prioritization), **Notion AI** for teams whose project management lives in Notion documents, **ClickUp AI** for teams that want AI embedded across task, doc, and time-tracking workflows, and **Claude** for the meta-work — summarizing standups, drafting project briefs, writing post-mortems. The most valuable AI PM feature isn't any of these tools' built-in AI: it's using Claude to compress the writing overhead of running a project.",
      },
      {
        type: "paragraph",
        text: "Project management AI has mostly followed the pattern of adding AI drafting and summarization to existing PM tools — which is genuinely useful, but represents incremental improvement rather than a category shift. The larger opportunity is using general-purpose AI (Claude, GPT-4o) for the high-cognitive-overhead parts of PM: structuring ambiguity, communicating to stakeholders, and writing up what happened and why.",
      },
      { type: "heading", level: 2, text: "For software teams: Linear" },
      {
        type: "paragraph",
        text: "**Linear** is the best project management tool for software teams and has integrated AI thoughtfully rather than superficially. The AI auto-generates issue titles and descriptions from rough notes, suggests priority and team assignment based on similar historical issues, and can identify duplicate tickets. The core Linear experience (fast, keyboard-driven, cycle-based) remains unchanged — the AI features are accelerants, not a new UX paradigm.",
      },
      { type: "heading", level: 2, text: "For doc-centric teams: Notion AI" },
      {
        type: "paragraph",
        text: "If your project management already happens in Notion pages — meeting notes, project briefs, roadmaps — **Notion AI** is the natural choice because it operates inside your existing workspace. It can summarize long document trees, generate action items from meeting notes, and draft project briefs from a few bullet points. The AI add-on ($10/month per user) is meaningful overhead for small teams, but the integration value is real.",
      },
      { type: "heading", level: 2, text: "Using Claude for PM work" },
      {
        type: "paragraph",
        text: "The highest-ROI AI investment for most project managers isn't a PM tool's AI feature — it's using **Claude** directly for the writing-intensive parts of the job. Draft the project brief by pasting in the requirements doc and asking Claude to structure it. Paste the Slack thread from the incident and ask Claude to write the post-mortem. Paste the meeting transcript and ask for action items and decisions. These tasks take 30 minutes each manually; they take 5 minutes with Claude.",
      },
      {
        type: "tools",
        title: "AI project management tools",
        items: [
          { name: "Linear", valueLine: "Best for software teams — AI issue triage, priority suggestions, clean cycle-based workflow.", url: "https://linear.app" },
          { name: "Notion AI", valueLine: "AI inside your Notion workspace — summaries, action items, project brief drafts.", url: "https://notion.so/product/ai" },
          { name: "ClickUp AI", valueLine: "AI across tasks, docs, and time tracking — good for teams that run everything in ClickUp.", url: "https://clickup.com/features/ai" },
          { name: "Claude", valueLine: "Best for PM writing — briefs, post-mortems, stakeholder updates, meeting summaries.", url: "https://claude.ai" },
          { name: "Asana Intelligence", valueLine: "AI goal tracking and status summaries inside Asana — useful for cross-functional teams.", url: "https://asana.com/product/ai" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "Use Linear or Notion AI for the tool you already live in. Layer Claude on top for the writing work: briefs, updates, post-mortems, and stakeholder communication. That combination covers the two highest-leverage PM AI use cases without adopting a new tool stack. Browse PM tools on the [Radar](/radar/browse).",
      },
    ],
  },

  // ─── SEO: Best AI tools for content creators ────────────────────────────────
  {
    slug: "best-ai-tools-for-content-creators-2026",
    title: "Best AI tools for content creators in 2026",
    deck: "For YouTubers, podcasters, newsletters, and social creators. The AI tools that make consistent content output achievable without burning out.",
    date: "2026-06-01",
    readingMin: 8,
    tag: "Guide",
    hero: {
      src: U("1499750310107-5fef28a66643"),
      alt: "Content creator recording a video in a home studio with lighting and camera",
      credit: "Unsplash",
    },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The best AI tools for content creators in 2026: **Descript** for video and podcast editing with AI transcription and filler word removal, **Opus Clip** for repurposing long videos into short-form clips, **Claude** for scriptwriting and newsletter drafts, **ElevenLabs** for voice synthesis and dubbing, and **Midjourney** for thumbnail and cover art. These five tools form the core AI stack for solo creators who need to publish across multiple platforms without a team.",
      },
      {
        type: "paragraph",
        text: "The economics of solo content creation have fundamentally changed with AI. Tasks that required a team (video editing, transcript generation, repurposing across formats, thumbnail design) can now be handled by one person with the right tools. The question is no longer \"can I do this alone?\" but \"what's the right tool for each part of the workflow?\"",
      },
      { type: "heading", level: 2, text: "Video and podcast production" },
      {
        type: "paragraph",
        text: "**Descript** is the most powerful all-in-one tool for audio and video creators. It transcribes your recording automatically, lets you edit by editing the transcript (cut a word from the transcript and it removes it from the audio/video), removes filler words in bulk, and adds captions automatically. For solo podcasters and YouTubers, Descript compresses 3-4 hours of editing into 30-45 minutes. It's the single highest-leverage tool in this list for audio/video creators.",
      },
      {
        type: "paragraph",
        text: "**Opus Clip** handles content repurposing: feed it a long YouTube video, podcast episode, or webinar, and it automatically identifies the best 30-90 second clips and formats them for TikTok, Reels, and YouTube Shorts — with captions, aspect ratio conversion, and speaker tracking. One hour of content becomes 10-15 short-form clips in 15 minutes.",
      },
      { type: "heading", level: 2, text: "Writing and scripting" },
      {
        type: "paragraph",
        text: "**Claude** is the strongest AI for scriptwriting and newsletter drafts. Give it your rough outline, talking points, or voice memo transcript, and it produces a draft that reads naturally rather than like generated content. For newsletters, the right workflow is to draft your main idea in bullet points and ask Claude to expand it into prose — then edit heavily to add your specific examples, voice, and personality. Pure AI-generated newsletters are recognizable and tend to lose subscribers.",
      },
      { type: "heading", level: 2, text: "Voice and visuals" },
      {
        type: "paragraph",
        text: "**ElevenLabs** is the state of the art for AI voice synthesis. For creators who want to clone their own voice for dubbing in other languages, generate voiceover for videos, or produce audio content at scale, the voice quality is genuinely impressive. **Midjourney** produces the best AI thumbnails and cover art — a bold, high-contrast image with text overlay (designed in Canva) from a well-crafted Midjourney prompt typically outperforms stock photos for click-through rates.",
      },
      {
        type: "tools",
        title: "AI creator tool stack",
        items: [
          { name: "Descript", valueLine: "Edit audio/video by editing transcript — filler word removal, captions, 3 hours to 30 min.", url: "https://descript.com" },
          { name: "Opus Clip", valueLine: "Long video to short-form clips — auto identifies best moments, adds captions, Reels-ready.", url: "https://opus.pro" },
          { name: "Claude", valueLine: "Scripts, newsletters, outlines — strong first draft that you edit into your voice.", url: "https://claude.ai" },
          { name: "ElevenLabs", valueLine: "Voice cloning and synthesis — dub into other languages, voiceover at scale.", url: "https://elevenlabs.io" },
          { name: "Midjourney", valueLine: "Thumbnails and cover art — high-quality concept images that outperform stock photos.", url: "https://midjourney.com" },
          { name: "Canva AI", valueLine: "Design and text overlay for thumbnails, social graphics, and channel art.", url: "https://canva.com" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "The minimum viable creator AI stack: Descript for production, Opus Clip for repurposing, Claude for scripts and newsletters. Add ElevenLabs if you produce voice content, Midjourney if thumbnails are a bottleneck. The tools are ready; the remaining variable is the ideas and perspective — that's still entirely yours. Browse all creator tools on the [Radar](/radar/browse).",
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

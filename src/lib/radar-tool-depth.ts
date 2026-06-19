// Hand-authored depth for the curated canon — the editorial layer behind the
// detail sheet. When a builder taps a known tool, they get more than one line:
// what it is, how it works, who it's for, and where it's used. Trending GitHub /
// Product Hunt tools fall back to their own maker description (no entry here).
//
// Keyed by the tool's canonical URL (the stable id on every RadarThing). Calm
// brand voice: present tense, verb-first, factual, no hype, no emoji. Edit
// freely — this is editorial, not generated.

export interface ToolDepth {
  whatItIs: string;
  howItWorks: string;
  whoItsFor: string;
  whereUsed: string;
}

// Normalize so "https://pinecone.io" and "https://pinecone.io/" match.
function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, "").toLowerCase();
}

const RAW: Record<string, ToolDepth> = {
  // ── Foundation models & chat ──
  "https://chatgpt.com": {
    whatItIs: "OpenAI's chat assistant, the most widely used way to work with frontier models day to day.",
    howItWorks: "You type a prompt and the model responds; it can also browse, run code, generate images, and call tools inside the same conversation.",
    whoItsFor: "Anyone who wants a general reasoning and writing partner — from first-time users to engineers prototyping with the API behind it.",
    whereUsed: "Drafting, research, code help, and quick prototyping before you commit a workflow to the API.",
  },
  "https://claude.ai": {
    whatItIs: "Anthropic's assistant, known for long-context reasoning and strong coding.",
    howItWorks: "It reads large documents or codebases in a single context window and works through them step by step, with optional tool use and file uploads.",
    whoItsFor: "Builders and writers who work with long inputs — full repos, contracts, research — and want careful, structured output.",
    whereUsed: "Codebase reasoning, document analysis, and writing that needs to hold a lot of context at once.",
  },
  "https://gemini.google.com": {
    whatItIs: "Google's multimodal assistant, built to reason across text, image, audio, and video.",
    howItWorks: "It accepts mixed inputs in one prompt and connects to Google's ecosystem, with very large context windows for long material.",
    whoItsFor: "People who work across media types or live inside Google's tools and want AI close to their data.",
    whereUsed: "Multimodal analysis, long-document work, and tasks that span text and visual input.",
  },
  "https://perplexity.ai": {
    whatItIs: "An answer engine that searches the live web and cites its sources.",
    howItWorks: "It runs a search for your question, reads the top results, and writes a synthesized answer with links you can verify.",
    whoItsFor: "Anyone who wants current, source-backed answers instead of a model's frozen training data.",
    whereUsed: "Research, fact-checking, and questions where freshness and citations matter.",
  },

  // ── AI coding ──
  "https://cursor.com": {
    whatItIs: "An AI-native code editor, forked from VS Code, that understands your whole repository.",
    howItWorks: "It indexes your codebase so the model can edit across many files at once, answer questions in context, and apply multi-file changes you review.",
    whoItsFor: "Engineers who want AI editing deeply integrated into a familiar editor rather than a side chat.",
    whereUsed: "Day-to-day feature work, refactors, and navigating large or unfamiliar codebases.",
  },
  "https://github.com/features/copilot": {
    whatItIs: "GitHub's AI pair-programmer, embedded in your editor and on GitHub.",
    howItWorks: "It suggests inline completions as you type and answers questions in a chat panel, using the file and project around your cursor.",
    whoItsFor: "Developers who want autocomplete-style help without leaving their existing editor.",
    whereUsed: "Writing boilerplate, finishing functions, and quick in-editor questions.",
  },
  "https://claude.com/claude-code": {
    whatItIs: "Anthropic's agentic coding tool that runs in your terminal.",
    howItWorks: "You describe a task and it plans, reads, and edits across files, runs commands, and iterates — checking in before risky steps.",
    whoItsFor: "Engineers comfortable in the terminal who want an agent that can carry a whole task, not just complete a line.",
    whereUsed: "Multi-file changes, debugging, migrations, and automating repetitive engineering work.",
  },
  "https://lovable.dev": {
    whatItIs: "A prompt-to-app builder for full web applications.",
    howItWorks: "You describe what you want in plain language; it generates the front end, wires up a backend, and lets you refine by chatting.",
    whoItsFor: "Founders and non-engineers who want a working app without setting up a stack.",
    whereUsed: "MVPs, internal tools, and landing pages built without a dev team.",
  },
  "https://windsurf.com": {
    whatItIs: "An agentic IDE that builds features end to end.",
    howItWorks: "Its agent keeps track of your project state and takes multi-step actions — editing files, running commands — while you stay in the loop.",
    whoItsFor: "Developers who want a more autonomous coding agent inside a full editor.",
    whereUsed: "Feature development and larger changes where the agent handles several steps at once.",
  },
  "https://bolt.new": {
    whatItIs: "A browser-based environment that prompts full-stack apps into existence.",
    howItWorks: "It runs a complete dev environment in the browser, generating and executing code from your prompt so you see the app run immediately.",
    whoItsFor: "Builders who want to go from idea to a running app without local setup.",
    whereUsed: "Rapid prototypes and demos you can share by URL.",
  },

  // ── UI & design ──
  "https://v0.dev": {
    whatItIs: "Vercel's tool for generating production React UIs from a prompt.",
    howItWorks: "You describe a component or screen and it returns clean React and Tailwind code you can copy, refine, or ship.",
    whoItsFor: "Developers who want a fast first draft of UI in the stack they already use.",
    whereUsed: "Building components, dashboards, and marketing pages quickly.",
  },
  "https://figma.com": {
    whatItIs: "The collaborative canvas where teams design, prototype, and hand off interfaces.",
    howItWorks: "Designers work in a shared browser document with components and auto-layout; developers inspect specs and export assets from the same file.",
    whoItsFor: "Designers and the engineers and PMs who build from their work.",
    whereUsed: "Product design, design systems, prototyping, and design-to-dev handoff.",
  },
  "https://framer.com": {
    whatItIs: "A design tool that publishes real, responsive websites.",
    howItWorks: "You design on a canvas with components and animation, then publish to a live site — increasingly with AI help for layout and copy.",
    whoItsFor: "Designers and small teams who want to design and ship a site without a separate build step.",
    whereUsed: "Marketing sites, landing pages, and portfolios.",
  },
  "https://ui.shadcn.com": {
    whatItIs: "A collection of accessible React components you copy into your project and own.",
    howItWorks: "Instead of installing a library, you add component source directly to your codebase, so you can restyle and extend it freely.",
    whoItsFor: "React developers who want a polished, unopinionated base they fully control.",
    whereUsed: "App UIs built on React, Tailwind, and Radix primitives.",
  },
  "https://21st.dev": {
    whatItIs: "A marketplace and generator for React UI components.",
    howItWorks: "You browse community components or generate new ones from a prompt, then drop the code into your project.",
    whoItsFor: "Developers who want ready-made, on-trend UI pieces without building each from scratch.",
    whereUsed: "Assembling interfaces quickly from reusable, shadcn-style components.",
  },

  // ── Model access & inference ──
  "https://openrouter.ai": {
    whatItIs: "A single API that routes to hundreds of models across providers.",
    howItWorks: "You call one endpoint and pick a model by name; it handles auth, billing, and automatic fallback if a provider fails.",
    whoItsFor: "Builders who want to compare or switch models without integrating each provider separately.",
    whereUsed: "Multi-model apps, cost and quality experiments, and provider redundancy.",
  },
  "https://groq.com": {
    whatItIs: "An inference provider that runs open models at very high speed.",
    howItWorks: "It serves models on custom hardware (its LPU) tuned for low latency, exposed through a standard API.",
    whoItsFor: "Builders who need fast, real-time responses from open models.",
    whereUsed: "Latency-sensitive apps like voice, chat, and live agents.",
  },
  "https://together.ai": {
    whatItIs: "A platform to run, fine-tune, and host open models via API.",
    howItWorks: "It serves a broad catalog of open models and lets you fine-tune and deploy your own on managed infrastructure.",
    whoItsFor: "Teams building on open models who want hosting and fine-tuning without running GPUs themselves.",
    whereUsed: "Production inference and custom fine-tunes of open-weight models.",
  },
  "https://replicate.com": {
    whatItIs: "A service to run and deploy machine-learning models with one API call.",
    howItWorks: "Models are packaged as containers you call over HTTP; you can run community models or push your own.",
    whoItsFor: "Developers who want to use models — especially image, video, and audio — without managing infrastructure.",
    whereUsed: "Image and media generation, and shipping custom models behind an API.",
  },
  "https://huggingface.co": {
    whatItIs: "The hub for open models, datasets, and demos — the GitHub of machine learning.",
    howItWorks: "It hosts hundreds of thousands of models and datasets with libraries to download, run, and share them, plus hosted demo Spaces.",
    whoItsFor: "Anyone working with open models — from researchers to app builders.",
    whereUsed: "Finding models, sharing weights, and running quick demos.",
  },

  // ── Data & RAG ──
  "https://pinecone.io": {
    whatItIs: "A managed vector database for storing and searching embeddings at scale.",
    howItWorks: "You convert text or other data into embeddings and upsert them; Pinecone indexes the vectors for fast approximate nearest-neighbour search.",
    whoItsFor: "Builders adding semantic search or retrieval to an app without running their own vector store.",
    whereUsed: "RAG pipelines, recommendations, and semantic search over documents.",
  },
  "https://supabase.com": {
    whatItIs: "An open-source backend built on Postgres, with auth, storage, and pgvector.",
    howItWorks: "It gives you a real Postgres database with instant APIs, authentication, and vector search through the pgvector extension.",
    whoItsFor: "Builders who want one backend for their app data and their AI retrieval layer.",
    whereUsed: "App backends, and RAG where embeddings live next to your relational data.",
  },

  // ── Agents & automation ──
  "https://n8n.io": {
    whatItIs: "A workflow automation tool you can self-host, with first-class AI nodes.",
    howItWorks: "You connect triggers and actions on a visual canvas — including LLM and agent nodes — and the workflow runs on your own infrastructure.",
    whoItsFor: "Technical teams who want automation and AI workflows without sending data to a closed SaaS.",
    whereUsed: "Internal automations, data pipelines, and self-hosted AI agents.",
  },
  "https://zapier.com": {
    whatItIs: "A no-code automation service connecting thousands of apps.",
    howItWorks: "You build 'Zaps' that trigger actions across apps when something happens, now with AI steps to transform or decide.",
    whoItsFor: "Operators and non-engineers who want to automate work across the tools they already use.",
    whereUsed: "Marketing, sales, and ops automations that glue SaaS tools together.",
  },
  "https://make.com": {
    whatItIs: "A visual platform for automating work across apps and AI.",
    howItWorks: "You design multi-step scenarios on a flow canvas, mapping data between apps and AI calls with fine-grained control.",
    whoItsFor: "Teams who want more visual, branching automation than simple trigger-action tools allow.",
    whereUsed: "Complex automations and AI-driven workflows across many services.",
  },

  // ── Orchestration ──
  "https://langchain.com/langgraph": {
    whatItIs: "A framework for building stateful, multi-step agent workflows.",
    howItWorks: "You model an agent as a graph of nodes and edges, controlling state, branching, and loops so long tasks stay reliable and inspectable.",
    whoItsFor: "Engineers building production agents that need structure beyond a single prompt.",
    whereUsed: "Multi-agent systems, tool-using agents, and workflows that must retry and resume.",
  },
  "https://inngest.com": {
    whatItIs: "A platform for durable, event-driven background and AI workflows.",
    howItWorks: "You write functions that react to events; Inngest handles queuing, retries, and step-level durability so long jobs survive failures.",
    whoItsFor: "Developers who need reliable background and AI jobs without managing queues themselves.",
    whereUsed: "Long-running AI tasks, scheduled jobs, and event-driven pipelines.",
  },
  "https://trigger.dev": {
    whatItIs: "An open-source platform for long-running background jobs written in code.",
    howItWorks: "You define tasks in your own codebase; Trigger runs them with automatic retries, durability, and observability, no timeouts to fight.",
    whoItsFor: "Developers who want background and AI jobs defined as normal code, not a separate visual tool.",
    whereUsed: "AI pipelines, scheduled work, and any job too long for a serverless request.",
  },
  "https://temporal.io": {
    whatItIs: "A durable execution platform for orchestrating long-running workflows as code.",
    howItWorks: "It records every step of a workflow so it can resume exactly where it left off after crashes, retries, or restarts.",
    whoItsFor: "Engineering teams running mission-critical, long-lived processes that must not lose state.",
    whereUsed: "Payments, provisioning, and multi-step AI or business workflows at scale.",
  },

  // ── Security ──
  "https://snyk.io": {
    whatItIs: "A developer security platform for finding and fixing vulnerabilities.",
    howItWorks: "It scans your code, dependencies, containers, and config, then suggests fixes and opens pull requests to patch them.",
    whoItsFor: "Teams who want security checks built into the way developers already work.",
    whereUsed: "Dependency scanning, code analysis, and securing CI pipelines.",
  },
  "https://semgrep.dev": {
    whatItIs: "A fast static analysis tool that scans code for security and quality bugs.",
    howItWorks: "It matches code against rules — pattern-based, so you can write your own — and flags issues in seconds across many languages.",
    whoItsFor: "Developers and security teams who want quick, customizable scanning in CI.",
    whereUsed: "Catching vulnerabilities and enforcing code standards before merge.",
  },
  "https://socket.dev": {
    whatItIs: "A tool that catches malicious and risky open-source dependencies.",
    howItWorks: "It inspects what packages actually do — network access, install scripts, shell use — to flag supply-chain attacks traditional scanners miss.",
    whoItsFor: "Teams worried about compromised or sketchy packages entering their codebase.",
    whereUsed: "Reviewing new dependencies and guarding the supply chain in pull requests.",
  },
  "https://doppler.com": {
    whatItIs: "A platform for managing secrets and environment config across your stack.",
    howItWorks: "It stores secrets centrally and syncs them to your apps, environments, and CI, so keys never live in scattered .env files.",
    whoItsFor: "Teams who want one secure source of truth for API keys and config.",
    whereUsed: "Managing environment variables and rotating secrets across services.",
  },

  // ── Eval & observability ──
  "https://smith.langchain.com": {
    whatItIs: "LangChain's platform for tracing, testing, and debugging LLM apps.",
    howItWorks: "It records each step of a chain or agent run so you can inspect inputs, outputs, and cost, then build evals from real traces.",
    whoItsFor: "Builders who need to see why an LLM app behaved a certain way in production.",
    whereUsed: "Debugging agents, evaluating prompt changes, and monitoring live apps.",
  },
  "https://helicone.ai": {
    whatItIs: "An observability layer that monitors LLM cost, latency, and usage.",
    howItWorks: "You route model calls through it as a proxy, and it logs every request with metrics and dashboards — often a one-line change.",
    whoItsFor: "Teams who want visibility into their LLM spend and performance fast.",
    whereUsed: "Tracking cost per feature, latency, and usage across models.",
  },
  "https://langfuse.com": {
    whatItIs: "Open-source tracing and evaluation for LLM applications.",
    howItWorks: "It captures traces of model and agent runs and lets you score outputs, run evals, and manage prompts — self-hostable or managed.",
    whoItsFor: "Engineers who want open, self-hostable observability for their AI stack.",
    whereUsed: "Tracing agents, running evals, and versioning prompts in production.",
  },

  // ── Media ──
  "https://elevenlabs.io": {
    whatItIs: "A platform for generating realistic AI voices and speech.",
    howItWorks: "You send text and it returns natural speech, with voice cloning, many languages, and an API for real-time use.",
    whoItsFor: "Builders adding voice to products, plus creators making audio content.",
    whereUsed: "Voice agents, narration, dubbing, and accessibility features.",
  },
};

// Build a normalized lookup once at module load.
const TOOL_DEPTH: Record<string, ToolDepth> = Object.fromEntries(
  Object.entries(RAW).map(([url, depth]) => [normalizeUrl(url), depth])
);

export function getToolDepth(url: string | null | undefined): ToolDepth | null {
  if (!url) return null;
  return TOOL_DEPTH[normalizeUrl(url)] ?? null;
}

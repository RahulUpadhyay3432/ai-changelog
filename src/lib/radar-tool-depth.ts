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

  // ── Models & chat (added) ──
  "https://grok.com": {
    whatItIs: "xAI's assistant, with access to real-time posts on X.",
    howItWorks: "It answers like other chat models but can pull in current conversation from X for fresher, more opinionated responses.",
    whoItsFor: "People who want an assistant tuned to live discussion and current events.",
    whereUsed: "Real-time questions, social context, and general reasoning.",
  },
  "https://mistral.ai": {
    whatItIs: "A European AI lab offering frontier and open-weight models.",
    howItWorks: "You use its models through the Le Chat assistant or an API, including open weights you can self-host.",
    whoItsFor: "Builders who want capable models with an open option and EU data residency.",
    whereUsed: "Chat, coding, and apps that need open or region-specific models.",
  },
  "https://deepseek.com": {
    whatItIs: "A lab known for strong, low-cost open reasoning models.",
    howItWorks: "Its models are available via chat and a cheap API, with open weights you can run yourself.",
    whoItsFor: "Builders who want strong reasoning without frontier-model pricing.",
    whereUsed: "Coding, math, and reasoning tasks where cost matters.",
  },

  // ── AI coding (added) ──
  "https://replit.com": {
    whatItIs: "A browser IDE that builds, runs, and deploys apps with an AI agent.",
    howItWorks: "You describe an app and its Agent writes, runs, and hosts it in a full cloud environment — no local setup.",
    whoItsFor: "Beginners and builders who want to go from idea to deployed app in one place.",
    whereUsed: "Prototypes, learning to code, and small apps shipped from the browser.",
  },
  "https://aider.chat": {
    whatItIs: "An open-source AI pair-programmer for your terminal.",
    howItWorks: "It edits files in your local git repo from your instructions and commits each change, so history stays clean.",
    whoItsFor: "Developers who live in the terminal and want AI edits tracked in git.",
    whereUsed: "Feature work and refactors on local repositories.",
  },
  "https://cline.bot": {
    whatItIs: "An autonomous coding agent that runs inside VS Code.",
    howItWorks: "It plans a task, edits files, and runs terminal commands, asking permission at each step you choose to gate.",
    whoItsFor: "VS Code users who want an open, transparent coding agent.",
    whereUsed: "Multi-step changes and debugging without leaving the editor.",
  },
  "https://zed.dev": {
    whatItIs: "A fast, collaborative code editor with AI built in.",
    howItWorks: "Built in Rust for speed, it adds AI assistance and real-time collaboration alongside a lightweight editing core.",
    whoItsFor: "Developers who want performance and native AI without a heavy IDE.",
    whereUsed: "Everyday editing, pair programming, and AI-assisted changes.",
  },
  "https://devin.ai": {
    whatItIs: "An autonomous AI software engineer from Cognition.",
    howItWorks: "You assign a task and Devin plans, codes, tests, and opens a pull request, working in its own environment.",
    whoItsFor: "Teams who want to offload well-scoped engineering tasks to an agent.",
    whereUsed: "Bug fixes, small features, and migrations handled end to end.",
  },

  // ── UI & design (added) ──
  "https://magicpatterns.com": {
    whatItIs: "A tool for generating and iterating on UI designs from prompts.",
    howItWorks: "You describe an interface and it produces editable designs and React code you can refine and export.",
    whoItsFor: "Product teams who want to explore UI directions quickly.",
    whereUsed: "Prototyping screens and components before building for real.",
  },
  "https://builder.io": {
    whatItIs: "A visual development platform that turns designs into code.",
    howItWorks: "It imports Figma designs, lets you edit visually, and outputs code for your framework, with an AI assist.",
    whoItsFor: "Teams who want designers and marketers to ship without blocking developers.",
    whereUsed: "Landing pages, marketing sites, and design-to-code workflows.",
  },
  "https://webflow.com": {
    whatItIs: "A visual platform to design, build, and host production websites.",
    howItWorks: "You design on a canvas that maps to real HTML and CSS, then publish to managed hosting.",
    whoItsFor: "Designers and teams who want pixel control without writing front-end code.",
    whereUsed: "Marketing sites, portfolios, and content-driven sites.",
  },
  "https://tailwindcss.com": {
    whatItIs: "A utility-first CSS framework for styling in your markup.",
    howItWorks: "You compose small utility classes directly in HTML or JSX; a build step strips everything you don't use.",
    whoItsFor: "Developers who want consistent, fast styling without writing custom CSS.",
    whereUsed: "Almost any modern web UI — it's the default for many AI-generated front ends.",
  },

  // ── Inference (added) ──
  "https://fireworks.ai": {
    whatItIs: "A fast inference platform for open models.",
    howItWorks: "It serves popular open models through an API tuned for low latency and high throughput, with fine-tuning support.",
    whoItsFor: "Teams running open models in production who care about speed and cost.",
    whereUsed: "Production inference and serving custom fine-tunes.",
  },
  "https://fal.ai": {
    whatItIs: "An inference platform specialized in media models.",
    howItWorks: "It runs image, video, and audio models behind a fast API, optimized for real-time generation.",
    whoItsFor: "Builders adding generative media to apps without managing GPUs.",
    whereUsed: "Image and video generation features in production apps.",
  },
  "https://modal.com": {
    whatItIs: "A serverless platform for running Python and GPU workloads.",
    howItWorks: "You write Python functions and Modal runs them in the cloud on demand, handling scaling and GPUs.",
    whoItsFor: "Engineers who want to run models or batch jobs without managing infrastructure.",
    whereUsed: "Model serving, fine-tuning, and data and AI pipelines.",
  },
  "https://cerebras.ai": {
    whatItIs: "An AI compute company offering record-fast model inference.",
    howItWorks: "Its wafer-scale chips serve open models at very high token speeds through an API.",
    whoItsFor: "Builders who need the fastest possible responses from large open models.",
    whereUsed: "Latency-critical apps and high-volume inference.",
  },

  // ── Data & RAG (added) ──
  "https://weaviate.io": {
    whatItIs: "An open-source vector database with hybrid search.",
    howItWorks: "It stores embeddings alongside keyword indexes so you can combine semantic and keyword search in one query.",
    whoItsFor: "Builders who want open-source retrieval with both search styles.",
    whereUsed: "RAG and search where keyword precision and semantics both matter.",
  },
  "https://qdrant.tech": {
    whatItIs: "A high-performance open-source vector search engine.",
    howItWorks: "Written in Rust, it indexes vectors with rich filtering and serves fast nearest-neighbour queries at scale.",
    whoItsFor: "Teams who want fast, self-hostable vector search.",
    whereUsed: "RAG, recommendations, and large-scale semantic search.",
  },
  "https://trychroma.com": {
    whatItIs: "An open-source embedding database for AI applications.",
    howItWorks: "It gives you a simple API to store and query embeddings, easy to run locally and scale up later.",
    whoItsFor: "Builders who want the quickest path to retrieval in a prototype.",
    whereUsed: "Local RAG experiments and small-to-mid production apps.",
  },
  "https://llamaindex.ai": {
    whatItIs: "A framework for connecting your data to LLMs.",
    howItWorks: "It handles loading, chunking, indexing, and querying your documents so models can answer over them.",
    whoItsFor: "Developers building RAG and document-aware apps.",
    whereUsed: "Chat-over-your-docs, knowledge assistants, and data agents.",
  },
  "https://neon.tech": {
    whatItIs: "Serverless Postgres with database branching and pgvector.",
    howItWorks: "It separates storage from compute so databases scale to zero and branch like code, with vector search built in.",
    whoItsFor: "Builders who want a modern Postgres that doubles as their vector store.",
    whereUsed: "App backends and RAG where embeddings live beside relational data.",
  },

  // ── Agents & automation (added) ──
  "https://crewai.com": {
    whatItIs: "A framework for teams of role-playing AI agents.",
    howItWorks: "You define agents with roles and tools and a process for how they collaborate on a task.",
    whoItsFor: "Developers building multi-agent systems where roles divide the work.",
    whereUsed: "Research, content, and automation tasks split across agents.",
  },
  "https://dify.ai": {
    whatItIs: "An open-source platform for building and running LLM apps and agents.",
    howItWorks: "It gives you a visual builder for prompts, workflows, and RAG, with APIs to ship the result.",
    whoItsFor: "Teams who want to build AI apps without wiring every piece from scratch.",
    whereUsed: "Internal assistants, chatbots, and agent workflows.",
  },
  "https://lindy.ai": {
    whatItIs: "A platform for building AI assistants that automate busywork.",
    howItWorks: "You describe a task and Lindy builds an assistant that connects to your apps and acts on triggers.",
    whoItsFor: "Operators who want AI to handle email, scheduling, and routine work.",
    whereUsed: "Sales, support, and operations automation.",
  },

  // ── Orchestration (added) ──
  "https://mastra.ai": {
    whatItIs: "A TypeScript framework for agents, workflows, and RAG.",
    howItWorks: "It gives you typed building blocks — agents, tools, workflows, memory — to assemble AI features in one codebase.",
    whoItsFor: "TypeScript developers who want structure for production AI apps.",
    whereUsed: "Agents, RAG, and multi-step AI workflows in JavaScript stacks.",
  },

  // ── Security (added) ──
  "https://gitguardian.com": {
    whatItIs: "A platform that detects leaked secrets across your code and CI.",
    howItWorks: "It scans repositories and pipelines for exposed credentials and alerts you to rotate them fast.",
    whoItsFor: "Teams who want to catch committed secrets before they're exploited.",
    whereUsed: "Securing repos, CI pipelines, and developer workflows.",
  },
  "https://infisical.com": {
    whatItIs: "An open-source platform for managing secrets.",
    howItWorks: "It stores secrets centrally and syncs them to apps, environments, and CI, with access controls.",
    whoItsFor: "Teams who want self-hostable secrets management.",
    whereUsed: "Managing API keys and config across services and environments.",
  },
  "https://lakera.ai": {
    whatItIs: "A security layer that guards LLM apps against misuse.",
    howItWorks: "It screens prompts and outputs for prompt injection, data leaks, and unsafe content before they reach the model or user.",
    whoItsFor: "Teams putting LLM features in front of real users.",
    whereUsed: "Protecting chatbots and agents from prompt-injection attacks.",
  },

  // ── Eval & observability (added) ──
  "https://braintrust.dev": {
    whatItIs: "A platform for evaluating and improving AI products.",
    howItWorks: "You build datasets and scorers, run evals on prompt or model changes, and compare results before shipping.",
    whoItsFor: "Teams who want to measure whether an AI change actually helped.",
    whereUsed: "Regression testing prompts, models, and agents.",
  },
  "https://phoenix.arize.com": {
    whatItIs: "Open-source tracing and evaluation for LLM apps.",
    howItWorks: "It captures traces of model and agent runs and provides evals and visualizations to debug them.",
    whoItsFor: "Engineers who want open observability for their AI stack.",
    whereUsed: "Debugging RAG and agents, and evaluating quality.",
  },
  "https://wandb.ai": {
    whatItIs: "A platform to track experiments, models, and LLM apps.",
    howItWorks: "You log runs, metrics, and traces; it organizes them into dashboards for comparison and collaboration.",
    whoItsFor: "ML and AI teams who need a record of what they trained and shipped.",
    whereUsed: "Training experiments, model versioning, and LLM tracing.",
  },

  // ── Media (added) ──
  "https://midjourney.com": {
    whatItIs: "A generative model known for striking, stylized images.",
    howItWorks: "You prompt it and it returns image options to upscale or vary, refining toward what you want.",
    whoItsFor: "Designers, marketers, and anyone needing original imagery.",
    whereUsed: "Concept art, marketing visuals, and moodboards.",
  },
  "https://runwayml.com": {
    whatItIs: "A suite for generating and editing video with AI.",
    howItWorks: "You generate clips from text or images and edit them with AI tools for motion, style, and effects.",
    whoItsFor: "Creators and teams producing video without a full production setup.",
    whereUsed: "Short-form video, ads, and visual effects.",
  },
  "https://suno.com": {
    whatItIs: "A model that generates full songs, including vocals, from a prompt.",
    howItWorks: "You describe a style and lyrics, or let it write them, and it produces a complete track.",
    whoItsFor: "Creators who want original music without producing it themselves.",
    whereUsed: "Soundtracks, jingles, and creative music projects.",
  },
  "https://lumalabs.ai": {
    whatItIs: "A lab making models for cinematic video and 3D.",
    howItWorks: "Its Dream Machine generates video from text or images; other tools capture and create 3D scenes.",
    whoItsFor: "Creators and builders adding generated video or 3D to their work.",
    whereUsed: "Video generation, visual effects, and 3D capture.",
  },
  "https://heygen.com": {
    whatItIs: "A platform for generating AI avatar and spokesperson videos.",
    howItWorks: "You pick or clone an avatar, type a script, and it produces a talking-head video in many languages.",
    whoItsFor: "Teams making training, marketing, or localized video at scale.",
    whereUsed: "Explainer videos, localization, and personalized outreach.",
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

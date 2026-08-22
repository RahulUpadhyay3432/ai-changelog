// Curated "Essentials" — the evergreen, must-know AI tools that GitHub stars
// can't surface (closed/commercial, or canon worth guaranteeing). Ordered
// accessible-first: foundation models + coding tools (the on-ramp for newer /
// less-technical users) come before inference / eval (the deep end). The
// open-source canon (LangChain, Ollama, vLLM, …) is added automatically by the
// stars-based GitHub query — no need to list it here.
//
// Value-lines follow the calm brand: verb/value-first, no hype, no emoji.
// Edit freely — this is the editorial layer.

export interface EssentialTool {
  name: string;
  valueLine: string;
  url: string;
  category: string;
  // Optional fuller body for the detail sheet's "About" block — for curated tools
  // that aren't in the hand-authored getToolDepth map (e.g. the Creator catalog).
  description?: string;
}

export const CURATED_ESSENTIALS: EssentialTool[] = [
  // ── Foundation models & chat (most accessible) ──
  { name: "ChatGPT", valueLine: "Reason, write, and prototype with OpenAI's frontier models.", url: "https://chatgpt.com", category: "Models & chat" },
  { name: "Claude", valueLine: "Long-context reasoning and coding with Anthropic's models.", url: "https://claude.ai", category: "Models & chat" },
  { name: "Gemini", valueLine: "Multimodal reasoning across text, image, and video.", url: "https://gemini.google.com", category: "Models & chat" },
  { name: "Perplexity", valueLine: "Answer questions with live, cited web search.", url: "https://perplexity.ai", category: "Models & chat" },
  { name: "Grok", valueLine: "xAI's assistant, wired into real-time posts on X.", url: "https://grok.com", category: "Models & chat" },
  { name: "Mistral", valueLine: "European frontier and open-weight models, via chat or API.", url: "https://mistral.ai", category: "Models & chat" },
  { name: "DeepSeek", valueLine: "Strong open reasoning models at low cost.", url: "https://deepseek.com", category: "Models & chat" },
  { name: "Qwen", valueLine: "Alibaba's open-weight model family, strong at code and multilingual work.", url: "https://chat.qwen.ai", category: "Models & chat" },
  { name: "Kimi", valueLine: "Moonshot AI's assistant, built for very long context.", url: "https://www.kimi.com", category: "Models & chat" },
  { name: "Llama", valueLine: "Meta's open-weight models you can run and fine-tune yourself.", url: "https://llama.com", category: "Models & chat" },

  // ── AI coding ──
  { name: "Cursor", valueLine: "AI-native editor that edits across your whole repo.", url: "https://cursor.com", category: "AI coding" },
  { name: "GitHub Copilot", valueLine: "Inline code completion and chat, inside your editor.", url: "https://github.com/features/copilot", category: "AI coding" },
  { name: "Gemini CLI", valueLine: "Google's open-source agentic coding assistant, in your terminal.", url: "https://github.com/google-gemini/gemini-cli", category: "AI coding" },
  { name: "Claude Code", valueLine: "Agentic coding in your terminal, plans and edits across files.", url: "https://claude.com/claude-code", category: "AI coding" },
  { name: "Lovable", valueLine: "Build and ship full web apps from a prompt.", url: "https://lovable.dev", category: "AI coding" },
  { name: "Windsurf", valueLine: "Agentic IDE that builds features end-to-end.", url: "https://windsurf.com", category: "AI coding" },
  { name: "Bolt.new", valueLine: "Prompt full-stack web apps that run in the browser.", url: "https://bolt.new", category: "AI coding" },
  { name: "Replit", valueLine: "Build, run, and deploy apps in the browser with an AI agent.", url: "https://replit.com", category: "AI coding" },
  { name: "Aider", valueLine: "Pair-program with AI from your terminal, committing as it goes.", url: "https://aider.chat", category: "AI coding" },
  { name: "Cline", valueLine: "An autonomous coding agent inside VS Code.", url: "https://cline.bot", category: "AI coding" },
  { name: "Zed", valueLine: "A fast, collaborative editor with AI built in.", url: "https://zed.dev", category: "AI coding" },
  { name: "Devin", valueLine: "An autonomous software engineer that takes whole tasks.", url: "https://devin.ai", category: "AI coding" },
  { name: "Codex", valueLine: "OpenAI's coding agent for the terminal and your IDE.", url: "https://openai.com/codex", category: "AI coding" },
  { name: "Antigravity", valueLine: "Google's agent-first IDE built around Gemini.", url: "https://antigravity.google", category: "AI coding" },
  { name: "Amp", valueLine: "Sourcegraph's agentic coding tool for large codebases.", url: "https://ampcode.com", category: "AI coding" },
  { name: "OpenCode", valueLine: "An open-source coding agent that runs in your terminal.", url: "https://opencode.ai", category: "AI coding" },
  { name: "Continue", valueLine: "Open-source IDE autopilot you point at your own models.", url: "https://continue.dev", category: "AI coding" },
  { name: "Roo Code", valueLine: "An open-source autonomous coding agent inside VS Code.", url: "https://roocode.com", category: "AI coding" },
  { name: "Grok Build", valueLine: "xAI's terminal coding agent, open-source harness, TUI, and tool layer.", url: "https://github.com/xai-org/grok-build", category: "AI coding" },

  // ── UI & design ──
  { name: "v0", valueLine: "Generate production React UIs from a prompt.", url: "https://v0.dev", category: "UI & design" },
  { name: "Figma", valueLine: "Design, prototype, and hand off interfaces in one canvas.", url: "https://figma.com", category: "UI & design" },
  { name: "Framer", valueLine: "Design and publish responsive sites without code.", url: "https://framer.com", category: "UI & design" },
  { name: "shadcn/ui", valueLine: "Accessible React components you copy in and own.", url: "https://ui.shadcn.com", category: "UI & design" },
  { name: "21st.dev", valueLine: "Browse and generate React UI components from a prompt.", url: "https://21st.dev", category: "UI & design" },
  { name: "Magic Patterns", valueLine: "Generate and iterate on UI designs from a prompt.", url: "https://magicpatterns.com", category: "UI & design" },
  { name: "Builder.io", valueLine: "Turn designs into code and edit it visually.", url: "https://builder.io", category: "UI & design" },
  { name: "Webflow", valueLine: "Design, build, and host production sites without code.", url: "https://webflow.com", category: "UI & design" },
  { name: "Tailwind CSS", valueLine: "Utility-first CSS for building UI fast in your markup.", url: "https://tailwindcss.com", category: "UI & design" },
  // Copy-paste component libraries, assets & generators — free builder favorites
  { name: "Magic UI", valueLine: "Animated React and Tailwind components for landing pages.", url: "https://magicui.design", category: "UI & design" },
  { name: "Cult UI", valueLine: "Copy-paste animated React and shadcn components and blocks.", url: "https://cult-ui.com", category: "UI & design" },
  { name: "Motion Primitives", valueLine: "Animation-first React components built on Framer Motion.", url: "https://motion-primitives.com", category: "UI & design" },
  { name: "Watermelon UI", valueLine: "React components built on Tailwind, Radix, and Framer Motion.", url: "https://ui.watermelon.sh", category: "UI & design" },
  { name: "Componentry", valueLine: "Animated React components built with Tailwind and Framer Motion.", url: "https://componentry.fun", category: "UI & design" },
  { name: "Uiverse", valueLine: "Thousands of free CSS and Tailwind UI elements to copy.", url: "https://uiverse.io", category: "UI & design" },
  { name: "Phosphor Icons", valueLine: "Open-source icon family in six weights, including duotone.", url: "https://phosphoricons.com", category: "UI & design" },
  { name: "Fontshare", valueLine: "Free professional-grade fonts from the Indian Type Foundry.", url: "https://fontshare.com", category: "UI & design" },
  { name: "Animista", valueLine: "Preview, tune, and copy ready-made CSS keyframe animations.", url: "https://animista.net", category: "UI & design" },
  { name: "AutoAnimate", valueLine: "Add smooth enter, leave, and move transitions in one line.", url: "https://auto-animate.formkit.com", category: "UI & design" },
  { name: "Shader Gradient", valueLine: "Configure animated WebGL gradient backgrounds and export them.", url: "https://shadergradient.co", category: "UI & design" },
  { name: "Mesh Gradient", valueLine: "Create warped shader mesh gradients to export as backgrounds.", url: "https://meshgradient.com", category: "UI & design" },
  { name: "Haikei", valueLine: "Generate SVG wave, blob, and gradient backgrounds to export.", url: "https://haikei.app", category: "UI & design" },
  { name: "Pattern Monster", valueLine: "Customize repeatable SVG patterns, then copy the CSS or SVG.", url: "https://pattern.monster", category: "UI & design" },

  // ── Model access & inference ──
  { name: "OpenRouter", valueLine: "One API for hundreds of models, with fallback routing.", url: "https://openrouter.ai", category: "Inference" },
  { name: "Groq", valueLine: "Run open models at extreme speed on custom hardware.", url: "https://groq.com", category: "Inference" },
  { name: "Together AI", valueLine: "Host and fine-tune open models via a fast API.", url: "https://together.ai", category: "Inference" },
  { name: "Replicate", valueLine: "Run and deploy any model with one API call.", url: "https://replicate.com", category: "Inference" },
  { name: "Hugging Face", valueLine: "The hub for open models, datasets, and demos.", url: "https://huggingface.co", category: "Inference" },
  { name: "Fireworks AI", valueLine: "Fast, production inference for open models.", url: "https://fireworks.ai", category: "Inference" },
  { name: "Fal", valueLine: "Fast inference for image, video, and audio models.", url: "https://fal.ai", category: "Inference" },
  { name: "Modal", valueLine: "Run Python and GPU workloads in the cloud, serverless.", url: "https://modal.com", category: "Inference" },
  { name: "Cerebras", valueLine: "Run open models at record speed on wafer-scale chips.", url: "https://cerebras.ai", category: "Inference" },
  { name: "Baseten", valueLine: "Deploy and serve open models in production.", url: "https://baseten.co", category: "Inference" },
  { name: "DeepInfra", valueLine: "Run open models through a low-cost inference API.", url: "https://deepinfra.com", category: "Inference" },

  // ── Data & RAG infra ──
  { name: "Pinecone", valueLine: "Managed vector database for fast semantic search.", url: "https://pinecone.io", category: "Data & RAG" },
  { name: "Supabase", valueLine: "Postgres + pgvector + auth as your AI app backend.", url: "https://supabase.com", category: "Data & RAG" },
  { name: "Weaviate", valueLine: "Open-source vector database with hybrid search.", url: "https://weaviate.io", category: "Data & RAG" },
  { name: "Qdrant", valueLine: "High-performance open-source vector search engine.", url: "https://qdrant.tech", category: "Data & RAG" },
  { name: "Chroma", valueLine: "An open-source embedding database for AI apps.", url: "https://trychroma.com", category: "Data & RAG" },
  { name: "LlamaIndex", valueLine: "A framework for connecting your data to LLMs.", url: "https://llamaindex.ai", category: "Data & RAG" },
  { name: "Neon", valueLine: "Serverless Postgres with branching and pgvector.", url: "https://neon.tech", category: "Data & RAG" },
  { name: "Turbopuffer", valueLine: "Serverless vector search built on object storage.", url: "https://turbopuffer.com", category: "Data & RAG" },
  { name: "LanceDB", valueLine: "An open-source vector database that runs on your own storage.", url: "https://lancedb.com", category: "Data & RAG" },

  // ── Agents & automation ──
  { name: "Claude Cowork", valueLine: "Hand Claude a folder and a plain-language task, desktop, web, and mobile.", url: "https://claude.com/cowork", category: "Agents & automation" },
  { name: "Gemini Spark", valueLine: "A standing agent that works across Gmail, Calendar, Docs, and Sheets.", url: "https://gemini.google.com/spark", category: "Agents & automation" },
  { name: "n8n", valueLine: "Wire AI into automated workflows, self-hostable.", url: "https://n8n.io", category: "Agents & automation" },
  { name: "Zapier", valueLine: "Connect AI to thousands of apps without code.", url: "https://zapier.com", category: "Agents & automation" },
  { name: "Make", valueLine: "Visually automate work across apps and AI.", url: "https://make.com", category: "Agents & automation" },
  { name: "CrewAI", valueLine: "Build teams of role-playing agents that work together.", url: "https://crewai.com", category: "Agents & automation" },
  { name: "Dify", valueLine: "Open-source platform to build and run LLM apps and agents.", url: "https://dify.ai", category: "Agents & automation" },
  { name: "Lindy", valueLine: "Build AI assistants that automate your busywork.", url: "https://lindy.ai", category: "Agents & automation" },
  { name: "OpenAI Agents SDK", valueLine: "Build multi-agent systems with OpenAI's lightweight SDK.", url: "https://openai.github.io/openai-agents-python", category: "Agents & automation" },
  { name: "Agent Development Kit", valueLine: "Google's open framework for building and shipping agents.", url: "https://google.github.io/adk-docs", category: "Agents & automation" },
  { name: "Pydantic AI", valueLine: "A type-safe Python framework for building agents.", url: "https://ai.pydantic.dev", category: "Agents & automation" },
  { name: "smolagents", valueLine: "Hugging Face's minimal library for code-writing agents.", url: "https://huggingface.co/docs/smolagents", category: "Agents & automation" },
  { name: "AutoGen", valueLine: "Microsoft's framework for multi-agent conversations.", url: "https://microsoft.github.io/autogen", category: "Agents & automation" },

  // ── Orchestration (long-running & agent workflows) ──
  { name: "LangGraph", valueLine: "Build stateful, multi-step agent workflows.", url: "https://langchain.com/langgraph", category: "Orchestration" },
  { name: "Inngest", valueLine: "Run durable, event-driven background and AI workflows.", url: "https://inngest.com", category: "Orchestration" },
  { name: "Trigger.dev", valueLine: "Write long-running background jobs and AI tasks in code.", url: "https://trigger.dev", category: "Orchestration" },
  { name: "Temporal", valueLine: "Orchestrate reliable, long-running workflows as code.", url: "https://temporal.io", category: "Orchestration" },
  { name: "Mastra", valueLine: "A TypeScript framework for agents, workflows, and RAG.", url: "https://mastra.ai", category: "Orchestration" },

  // ── Security (ship it safely) ──
  { name: "Snyk", valueLine: "Find and fix vulnerabilities in code and dependencies.", url: "https://snyk.io", category: "Security" },
  { name: "Semgrep", valueLine: "Scan code for security bugs with fast static analysis.", url: "https://semgrep.dev", category: "Security" },
  { name: "Socket", valueLine: "Catch malicious and risky open-source dependencies.", url: "https://socket.dev", category: "Security" },
  { name: "Doppler", valueLine: "Manage secrets and environment config across your stack.", url: "https://doppler.com", category: "Security" },
  { name: "GitGuardian", valueLine: "Detect leaked secrets across your repos and CI.", url: "https://gitguardian.com", category: "Security" },
  { name: "Infisical", valueLine: "Open-source secrets management for your team and apps.", url: "https://infisical.com", category: "Security" },
  { name: "Lakera", valueLine: "Guard LLM apps against prompt injection and misuse.", url: "https://lakera.ai", category: "Security" },

  // ── Eval & observability ──
  { name: "LangSmith", valueLine: "Trace, test, and debug LLM apps in production.", url: "https://smith.langchain.com", category: "Eval & observability" },
  { name: "Helicone", valueLine: "Monitor LLM cost, latency, and usage in one dashboard.", url: "https://helicone.ai", category: "Eval & observability" },
  { name: "Langfuse", valueLine: "Open-source tracing and evals for LLM apps.", url: "https://langfuse.com", category: "Eval & observability" },
  { name: "Braintrust", valueLine: "Evaluate and improve AI products with systematic evals.", url: "https://braintrust.dev", category: "Eval & observability" },
  { name: "Arize Phoenix", valueLine: "Open-source tracing and evaluation for LLM apps.", url: "https://phoenix.arize.com", category: "Eval & observability" },
  { name: "Weights & Biases", valueLine: "Track experiments, models, and LLM apps in one place.", url: "https://wandb.ai", category: "Eval & observability" },

  // ── Video (generate & edit motion) ──
  { name: "Sora", valueLine: "OpenAI's text-to-video model for generating clips.", url: "https://sora.com", category: "Video",
    description: "OpenAI's video model turns a text prompt into short, coherent clips, with control over style, motion, and camera. Available through the Sora app and API." },
  { name: "Runway", valueLine: "Generate and edit video with AI.", url: "https://runwayml.com", category: "Video",
    description: "A creative suite for generating and editing video, text-to-video, video-to-video, and a deep set of motion and editing tools used in real production work." },
  { name: "Kling", valueLine: "Generate cinematic video from text and images.", url: "https://klingai.com", category: "Video",
    description: "Kuaishou's video model turns text and reference images into cinematic, high-motion clips, popular for stylized and narrative shots." },
  { name: "Luma", valueLine: "Generate cinematic video and 3D from text or images.", url: "https://lumalabs.ai", category: "Video",
    description: "Luma's Dream Machine generates cinematic video and 3D scenes from text or images, with fast iteration and natural camera movement." },
  { name: "Veo", valueLine: "Google's flagship text-to-video model.", url: "https://deepmind.google/models/veo/", category: "Video",
    description: "Google DeepMind's video model generates high-resolution clips with strong prompt adherence and realistic motion, available through Flow and the Gemini app." },
  { name: "Pika", valueLine: "Generate and restyle short video from a prompt.", url: "https://pika.art", category: "Video",
    description: "Pika turns text and images into short, shareable videos, with playful effects for restyling and animating clips you already have." },

  // ── Voice & audio (speech, music, sound) ──
  { name: "Wispr Flow", valueLine: "Speak naturally and it writes, in your style, anywhere.", url: "https://wisprflow.ai", category: "Voice & audio",
    description: "Wispr Flow is a dictation app that turns natural speech into polished writing across every app, with auto-edits when you change your mind and a command mode to reshape selected text. Supports 100+ languages." },
  { name: "ElevenLabs", valueLine: "Generate realistic AI voices and speech via API.", url: "https://elevenlabs.io", category: "Voice & audio",
    description: "ElevenLabs produces natural text-to-speech, voice cloning, dubbing, and sound effects through a simple API, widely used for narration and product voiceovers." },
  { name: "Suno", valueLine: "Create full songs, with vocals, from a prompt.", url: "https://suno.com", category: "Voice & audio",
    description: "Suno generates complete songs, melody, instrumentation, and vocals , from a short text prompt, with control over genre and lyrics." },
  { name: "Udio", valueLine: "Generate music and vocals from a prompt.", url: "https://udio.com", category: "Voice & audio",
    description: "Udio creates high-fidelity music with vocals from a text description, with fine control over style, structure, and lyrics." },
  { name: "Descript", valueLine: "Edit audio and video by editing the transcript.", url: "https://descript.com", category: "Voice & audio",
    description: "Descript transcribes your recording and lets you edit the media by editing the text, with AI tools for removing filler words, cloning voices, and cleaning up audio." },

  // ── Image (generate & design visuals) ──
  { name: "Midjourney", valueLine: "Generate striking images from text prompts.", url: "https://midjourney.com", category: "Image",
    description: "Midjourney is known for its distinctive, high-aesthetic image generation, with deep control over style, composition, and consistency across a series." },
  { name: "Ideogram", valueLine: "Generate images with reliable, legible text.", url: "https://ideogram.ai", category: "Image",
    description: "Ideogram generates images from prompts and is especially strong at rendering accurate, legible text, useful for posters, logos, and typographic art." },
  { name: "Krea", valueLine: "Generate and enhance images in real time.", url: "https://krea.ai", category: "Image",
    description: "Krea offers real-time image generation, upscaling, and restyling on one canvas, with live previews as you adjust the prompt and reference images." },
  { name: "Recraft", valueLine: "Design-grade image and vector generation.", url: "https://recraft.ai", category: "Image",
    description: "Recraft generates images, icons, and editable vector art in brand-consistent styles, aimed at designers who need production-ready assets." },
  { name: "Flux", valueLine: "Open, high-quality image generation models.", url: "https://blackforestlabs.ai", category: "Image",
    description: "Black Forest Labs builds the FLUX family of image models, offering open weights and a hosted API known for sharp detail and strong prompt following." },

  // ── Marketing & content (avatars, clips, decks) ──
  { name: "HeyGen", valueLine: "Generate AI avatar and spokesperson videos.", url: "https://heygen.com", category: "Marketing & content",
    description: "HeyGen creates studio-quality avatar videos from a script, with realistic talking-head presenters and translation into dozens of languages, used for marketing and training." },
  { name: "Synthesia", valueLine: "Create AI avatar videos from a script.", url: "https://synthesia.io", category: "Marketing & content",
    description: "Synthesia turns plain text into professional videos fronted by AI avatars in 140+ languages, widely used for training, onboarding, and sales content." },
  { name: "Captions", valueLine: "Edit and caption talking videos with AI.", url: "https://captions.ai", category: "Marketing & content",
    description: "Captions is an AI video studio for creators, auto-captions, eye-contact correction, dubbing, and an AI presenter for short-form social video." },
  { name: "OpusClip", valueLine: "Turn long videos into short, captioned clips.", url: "https://opus.pro", category: "Marketing & content",
    description: "OpusClip finds the most engaging moments in a long video and reframes them into captioned short clips ready for TikTok, Reels, and Shorts." },
  { name: "Gamma", valueLine: "Generate decks, docs, and sites from a prompt.", url: "https://gamma.app", category: "Marketing & content",
    description: "Gamma generates polished presentations, documents, and web pages from a prompt, with on-brand styling and one-click publishing." },
  // ── Refreshed July 2026 (GitHub trending + market scan) ──
  {
    name: "Wren AI",
    valueLine: "Turn natural-language questions into governed SQL and dashboards over your warehouse.",
    url: "https://github.com/Canner/WrenAI",
    category: "Data & RAG",
    description: "An open-source GenBI engine that answers business questions in plain language, generating SQL, charts, and dashboards across 20+ warehouses like BigQuery, Snowflake, and Postgres. A semantic layer keeps definitions consistent, and it plugs into agents. Apache-2.0.",
  },
  {
    name: "BrowserOS",
    valueLine: "An open-source Chromium fork with a built-in AI agent that runs locally.",
    url: "https://github.com/browseros-ai/BrowserOS",
    category: "Agents & automation",
    description: "A privacy-first agentic browser with 50+ built-in automation tools, support for 11+ model providers, and local models via Ollama. It is the open-source counterpart to hosted agentic browsers like Comet and Atlas, keeping data on your machine. AGPL-3.0, active San Francisco team.",
  },
  {
    name: "Orca",
    valueLine: "Run several coding agents in parallel, each in its own git worktree, and merge the best.",
    url: "https://github.com/stablyai/orca",
    category: "AI coding",
    description: "A desktop environment for orchestrating a fleet of coding agents \u2014 Codex, Claude Code, OpenCode, or Pi \u2014 side by side in isolated worktrees, then comparing and merging results. It adds terminal splits, GitHub and Linear integration, and a mobile companion. Uses your own agent subscriptions.",
  },
  {
    name: "Strix",
    valueLine: "An autonomous agent that finds and validates vulnerabilities like a pentester.",
    url: "https://github.com/usestrix/strix",
    category: "Security",
    description: "Runs reconnaissance, writes and executes real exploits, and confirms findings with proofs-of-concept against a codebase, repo, or live app. Unlike the static scanners it sits alongside, it is an offensive security agent rather than a linter. Apache-2.0, with a free CLI and a hosted platform.",
  },
  {
    name: "cognee",
    valueLine: "Give agents persistent memory backed by a knowledge graph and vector store.",
    url: "https://github.com/topoteretes/cognee",
    category: "Data & RAG",
    description: "An open-source memory platform that ingests mixed data, builds a knowledge graph plus embeddings, and lets agents recall facts and relationships across sessions. Its graph-first design sets it apart in the agent-memory space. Ships as a Python package, Docker service, and MCP server.",
  },
  {
    name: "Cactus",
    valueLine: "Run text, speech, and vision models on-device on phones and wearables.",
    url: "https://github.com/cactus-compute/cactus",
    category: "Inference",
    description: "A hybrid edge-cloud inference engine with OpenAI-compatible APIs, custom ARM kernels, and 1-4-bit quantization, so models can run locally on mobile hardware. Native bindings cover Swift, Kotlin, Flutter, React Native, Python, and Rust. Fills the on-device slot in an otherwise cloud-only inference field.",
  },
  {
    name: "Cartesia",
    valueLine: "Low-latency text-to-speech built for real-time voice agents.",
    url: "https://cartesia.ai",
    category: "Voice & audio",
    description: "Voice infrastructure whose Sonic model streams first audio in around 90ms across 40+ languages, with expressive delivery and on-prem or on-device deployment. It ranked first on Artificial Analysis's speech leaderboards and powers production voice agents. A latency-first way to build voice into apps.",
  },

  // ── Refreshed August 2026 (GitHub trending, AI/agent only) ──
  {
    name: "ComfyUI",
    valueLine: "Build image and video generation pipelines as a visual node graph.",
    url: "https://github.com/Comfy-Org/ComfyUI",
    category: "Image",
    description: "A modular interface for diffusion models where each step \u2014 loading a checkpoint, conditioning, sampling, upscaling \u2014 is a node you wire together. The graph is the artefact: it saves, shares and reruns exactly, which is why it became the standard for reproducible generation work.",
  },
  {
    name: "OmniRoute",
    valueLine: "One endpoint in front of 330+ model providers, MIT-licensed.",
    url: "https://github.com/diegosouzapw/OmniRoute",
    category: "Inference",
    description: "A free AI gateway that puts a single API in front of hundreds of providers, so switching or falling back between models is configuration rather than a code change. The open alternative to a hosted router.",
  },
  {
    name: "CLI-Anything",
    valueLine: "Give any piece of software a command line an agent can drive.",
    url: "https://github.com/HKUDS/CLI-Anything",
    category: "Agents & automation",
    description: "A project aimed at making all software agent-native by generating a command-line surface for tools that lack one. Agents are far more reliable driving a CLI than a GUI, so this widens what they can actually operate.",
  },
  {
    name: "DeepSeek-Reasonix",
    valueLine: "A terminal coding agent built specifically around DeepSeek models.",
    url: "https://github.com/esengine/DeepSeek-Reasonix",
    category: "AI coding",
    description: "A coding agent engineered for DeepSeek rather than adapted to it, with prefix-cache stability so long sessions stay cheap. The option worth knowing if you want capable agentic coding on open reasoning models.",
  },
  {
    name: "herdr",
    valueLine: "A runtime for coding agents to live in, rather than run loose on your machine.",
    url: "https://github.com/herdrdev/herdr",
    category: "Orchestration",
    description: "Infrastructure that gives coding agents a defined place to execute \u2014 isolation, lifecycle and state \u2014 instead of each agent improvising against your local filesystem. Aimed at teams running several agents at once.",
  },
  {
    name: "TencentDB Agent Memory",
    valueLine: "Share memory across a team's agents instead of siloing it per session.",
    url: "https://github.com/TencentCloud/TencentDB-Agent-Memory",
    category: "Data & RAG",
    description: "A team-level memory hub that treats what agents learn as a reusable asset rather than something discarded at the end of a conversation. Addresses the gap where every agent starts from zero on shared context.",
  },
  {
    name: "anydoc",
    valueLine: "Convert Word, PowerPoint, Excel, EPUB and more into text a model can read.",
    url: "https://github.com/firecrawl/anydoc",
    category: "Data & RAG",
    description: "A converter covering the document formats that break most ingestion pipelines, from Firecrawl. The unglamorous layer that decides whether a RAG system sees your documents at all.",
  },
  {
    name: "prime-agent",
    valueLine: "A coding agent that improves its own approach over long-running tasks.",
    url: "https://github.com/PrimeIntellect-ai/prime-agent",
    category: "Agents & automation",
    description: "A self-improving agent from Prime Intellect built for coding workflows and tasks that run for hours, adjusting its strategy as it goes rather than repeating a fixed loop.",
  },
  {
    name: "pdf-inspector",
    valueLine: "Pull clean text out of PDFs quickly, including the awkward ones.",
    url: "https://github.com/firecrawl/pdf-inspector",
    category: "Data & RAG",
    description: "A Rust library for PDF inspection, classification and text extraction, built for speed at ingestion scale. PDFs are where most document pipelines quietly lose fidelity; this is the layer that decides how much survives.",
  },
  {
    name: "Cloudflare Computer",
    valueLine: "Give an agent a real computer to work on, running at the edge.",
    url: "https://github.com/cloudflare/computer",
    category: "Agents & automation",
    description: "Cloudflare's environment for handing an agent an actual machine \u2014 filesystem, browser and shell \u2014 rather than a chat window. The infrastructure answer to computer-use agents that need somewhere to act.",
  },
  {
    name: "semantica",
    valueLine: "Store agent context as a graph so decisions can be traced.",
    url: "https://github.com/semantica-agi/semantica",
    category: "Data & RAG",
    description: "Graph-native infrastructure for context and accountable AI systems, where relationships between facts are first-class instead of flattened into embeddings. Aimed at systems that must explain why they concluded something.",
  },
  {
    name: "loopx",
    valueLine: "Keep long-running agent teams from losing the thread.",
    url: "https://github.com/huangruiteng/loopx",
    category: "Orchestration",
    description: "A lightweight state kernel for loop engineering \u2014 managing what a team of agents knows and has done across a long task, which is where most multi-agent setups drift or repeat themselves.",
  },
  {
    name: "code-graph-rag",
    valueLine: "Query and edit a monorepo through a knowledge graph of the code.",
    url: "https://github.com/vitali87/code-graph-rag",
    category: "Data & RAG",
    description: "RAG built for monorepos, indexing structure and relationships rather than chunking files, so an agent can answer questions that span packages. Aimed at codebases too large to fit in any context window.",
  },
];


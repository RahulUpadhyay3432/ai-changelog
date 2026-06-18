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
}

export const CURATED_ESSENTIALS: EssentialTool[] = [
  // ── Foundation models & chat (most accessible) ──
  { name: "ChatGPT", valueLine: "Reason, write, and prototype with OpenAI's frontier models.", url: "https://chatgpt.com", category: "Models & chat" },
  { name: "Claude", valueLine: "Long-context reasoning and coding with Anthropic's models.", url: "https://claude.ai", category: "Models & chat" },
  { name: "Gemini", valueLine: "Multimodal reasoning across text, image, and video.", url: "https://gemini.google.com", category: "Models & chat" },
  { name: "Perplexity", valueLine: "Answer questions with live, cited web search.", url: "https://perplexity.ai", category: "Models & chat" },

  // ── AI coding ──
  { name: "Cursor", valueLine: "AI-native editor that edits across your whole repo.", url: "https://cursor.com", category: "AI coding" },
  { name: "GitHub Copilot", valueLine: "Inline code completion and chat, inside your editor.", url: "https://github.com/features/copilot", category: "AI coding" },
  { name: "Claude Code", valueLine: "Agentic coding in your terminal — plans and edits across files.", url: "https://claude.com/claude-code", category: "AI coding" },
  { name: "Lovable", valueLine: "Build and ship full web apps from a prompt.", url: "https://lovable.dev", category: "AI coding" },
  { name: "Windsurf", valueLine: "Agentic IDE that builds features end-to-end.", url: "https://windsurf.com", category: "AI coding" },
  { name: "Bolt.new", valueLine: "Prompt full-stack web apps that run in the browser.", url: "https://bolt.new", category: "AI coding" },

  // ── UI & design ──
  { name: "v0", valueLine: "Generate production React UIs from a prompt.", url: "https://v0.dev", category: "UI & design" },
  { name: "Figma", valueLine: "Design, prototype, and hand off interfaces in one canvas.", url: "https://figma.com", category: "UI & design" },
  { name: "Framer", valueLine: "Design and publish responsive sites without code.", url: "https://framer.com", category: "UI & design" },
  { name: "shadcn/ui", valueLine: "Accessible React components you copy in and own.", url: "https://ui.shadcn.com", category: "UI & design" },
  { name: "21st.dev", valueLine: "Browse and generate React UI components from a prompt.", url: "https://21st.dev", category: "UI & design" },

  // ── Model access & inference ──
  { name: "OpenRouter", valueLine: "One API for hundreds of models, with fallback routing.", url: "https://openrouter.ai", category: "Inference" },
  { name: "Groq", valueLine: "Run open models at extreme speed on custom hardware.", url: "https://groq.com", category: "Inference" },
  { name: "Together AI", valueLine: "Host and fine-tune open models via a fast API.", url: "https://together.ai", category: "Inference" },
  { name: "Replicate", valueLine: "Run and deploy any model with one API call.", url: "https://replicate.com", category: "Inference" },
  { name: "Hugging Face", valueLine: "The hub for open models, datasets, and demos.", url: "https://huggingface.co", category: "Inference" },

  // ── Data & RAG infra ──
  { name: "Pinecone", valueLine: "Managed vector database for fast semantic search.", url: "https://pinecone.io", category: "Data & RAG" },
  { name: "Supabase", valueLine: "Postgres + pgvector + auth as your AI app backend.", url: "https://supabase.com", category: "Data & RAG" },

  // ── Agents & automation ──
  { name: "n8n", valueLine: "Wire AI into automated workflows, self-hostable.", url: "https://n8n.io", category: "Agents & automation" },
  { name: "Zapier", valueLine: "Connect AI to thousands of apps without code.", url: "https://zapier.com", category: "Agents & automation" },
  { name: "Make", valueLine: "Visually automate work across apps and AI.", url: "https://make.com", category: "Agents & automation" },

  // ── Orchestration (long-running & agent workflows) ──
  { name: "LangGraph", valueLine: "Build stateful, multi-step agent workflows.", url: "https://langchain.com/langgraph", category: "Orchestration" },
  { name: "Inngest", valueLine: "Run durable, event-driven background and AI workflows.", url: "https://inngest.com", category: "Orchestration" },
  { name: "Trigger.dev", valueLine: "Write long-running background jobs and AI tasks in code.", url: "https://trigger.dev", category: "Orchestration" },
  { name: "Temporal", valueLine: "Orchestrate reliable, long-running workflows as code.", url: "https://temporal.io", category: "Orchestration" },

  // ── Security (ship it safely) ──
  { name: "Snyk", valueLine: "Find and fix vulnerabilities in code and dependencies.", url: "https://snyk.io", category: "Security" },
  { name: "Semgrep", valueLine: "Scan code for security bugs with fast static analysis.", url: "https://semgrep.dev", category: "Security" },
  { name: "Socket", valueLine: "Catch malicious and risky open-source dependencies.", url: "https://socket.dev", category: "Security" },
  { name: "Doppler", valueLine: "Manage secrets and environment config across your stack.", url: "https://doppler.com", category: "Security" },

  // ── Eval & observability ──
  { name: "LangSmith", valueLine: "Trace, test, and debug LLM apps in production.", url: "https://smith.langchain.com", category: "Eval & observability" },
  { name: "Helicone", valueLine: "Monitor LLM cost, latency, and usage in one dashboard.", url: "https://helicone.ai", category: "Eval & observability" },
  { name: "Langfuse", valueLine: "Open-source tracing and evals for LLM apps.", url: "https://langfuse.com", category: "Eval & observability" },

  // ── Media (builder-relevant) ──
  { name: "ElevenLabs", valueLine: "Generate realistic AI voices and speech via API.", url: "https://elevenlabs.io", category: "Media" },
];

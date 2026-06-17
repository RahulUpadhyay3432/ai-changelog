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
  { name: "v0", valueLine: "Generate production React UIs from a prompt.", url: "https://v0.dev", category: "AI coding" },
  { name: "Lovable", valueLine: "Build and ship full web apps from a prompt.", url: "https://lovable.dev", category: "AI coding" },
  { name: "Windsurf", valueLine: "Agentic IDE that builds features end-to-end.", url: "https://windsurf.com", category: "AI coding" },

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

  // ── Eval & observability ──
  { name: "LangSmith", valueLine: "Trace, test, and debug LLM apps in production.", url: "https://smith.langchain.com", category: "Eval & observability" },
  { name: "Helicone", valueLine: "Monitor LLM cost, latency, and usage in one dashboard.", url: "https://helicone.ai", category: "Eval & observability" },

  // ── Media (builder-relevant) ──
  { name: "ElevenLabs", valueLine: "Generate realistic AI voices and speech via API.", url: "https://elevenlabs.io", category: "Media" },
];

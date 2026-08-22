// Starter packs — "here's what to actually use for X." The fix for the
// accumulation trap (too many tools, built nothing): a curated stack you can
// save in one tap as a named Loadout. Each tool URL matches the curated canon in
// radar-tool-depth, so verdicts + logos resolve for free. Editorial, hand-picked.

export interface PackTool {
  name: string;
  url: string; // canonical URL — must match a radar-tool-depth key for verdict/logo
}

export interface StarterPack {
  id: string;
  name: string;
  blurb: string;
  tools: PackTool[];
}

export const STARTER_PACKS: StarterPack[] = [
  {
    id: "ship-an-agent",
    name: "Ship an AI agent",
    blurb: "Take an agent from prompt to production, build, route, run, watch.",
    tools: [
      { name: "Cursor", url: "https://cursor.com" },
      { name: "Claude Code", url: "https://claude.com/claude-code" },
      { name: "LangGraph", url: "https://langchain.com/langgraph" },
      { name: "OpenRouter", url: "https://openrouter.ai" },
      { name: "Trigger.dev", url: "https://trigger.dev" },
      { name: "Helicone", url: "https://helicone.ai" },
    ],
  },
  {
    id: "vibe-code-a-saas",
    name: "Vibe-code a SaaS",
    blurb: "Idea to a live product without a team, prototype, style, ship.",
    tools: [
      { name: "Lovable", url: "https://lovable.dev" },
      { name: "v0", url: "https://v0.dev" },
      { name: "shadcn/ui", url: "https://ui.shadcn.com" },
      { name: "Tailwind CSS", url: "https://tailwindcss.com" },
      { name: "Supabase", url: "https://supabase.com" },
    ],
  },
  {
    id: "rag-in-a-weekend",
    name: "RAG in a weekend",
    blurb: "Chat over your own docs, index, store, retrieve, trace.",
    tools: [
      { name: "LlamaIndex", url: "https://llamaindex.ai" },
      { name: "Supabase", url: "https://supabase.com" },
      { name: "Qdrant", url: "https://qdrant.tech" },
      { name: "OpenRouter", url: "https://openrouter.ai" },
      { name: "Langfuse", url: "https://langfuse.com" },
    ],
  },
  {
    id: "ai-content-studio",
    name: "AI content studio",
    blurb: "A one-person media team, voice, image, video, music.",
    tools: [
      { name: "ElevenLabs", url: "https://elevenlabs.io" },
      { name: "Midjourney", url: "https://midjourney.com" },
      { name: "Runway", url: "https://runwayml.com" },
      { name: "Suno", url: "https://suno.com" },
      { name: "HeyGen", url: "https://heygen.com" },
    ],
  },
  {
    id: "run-open-models",
    name: "Run open models",
    blurb: "Serve open-weight models yourself, find, host, run fast.",
    tools: [
      { name: "Hugging Face", url: "https://huggingface.co" },
      { name: "Groq", url: "https://groq.com" },
      { name: "Together AI", url: "https://together.ai" },
      { name: "Replicate", url: "https://replicate.com" },
      { name: "Modal", url: "https://modal.com" },
    ],
  },
];

export function getPackById(id: string): StarterPack | undefined {
  return STARTER_PACKS.find((p) => p.id === id);
}

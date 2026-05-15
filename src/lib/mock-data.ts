import type { NewsItem } from "./types";

export const MOCK_STORIES: NewsItem[] = [
  {
    id: "1",
    title: "Mistral AI Releases 70B Open-Weight Model Beating GPT-4",
    summary:
      "Mistral AI has open-sourced Mistral-Large-2, a 70B parameter model that outperforms GPT-4 on MMLU, HumanEval, and GSM8K benchmarks. Available under Apache 2.0 license on HuggingFace. The release marks the largest open-weight model from the Paris-based lab to date.",
    sourceName: "Hugging Face",
    sourceUrl: "https://huggingface.co/mistralai",
    categorySlug: "research",
    publishedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    title: "Boston Dynamics Spot Gets GPT-5 Brain — Autonomously Navigates Warehouses",
    summary:
      "Boston Dynamics has integrated GPT-5 vision reasoning into Spot, enabling fully autonomous warehouse navigation, anomaly detection, and report generation without human oversight. The system processes 30 camera feeds simultaneously and generates plain-English incident reports.",
    sourceName: "MIT Tech Review",
    sourceUrl: "https://technologyreview.com",
    categorySlug: "ai-models",
    publishedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "Anthropic Raises $4B Series E at $60B Valuation Led by Amazon",
    summary:
      "Anthropic closed its largest funding round to date with Amazon leading at $2.5B, followed by Google. The capital will fund compute infrastructure for Claude model training and expanded safety research. Anthropic is now the second most valuable private AI lab globally.",
    sourceName: "The Information",
    sourceUrl: "https://theinformation.com",
    categorySlug: "funding",
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    title: "Google DeepMind AlphaFold 3 Predicts Drug-Protein Interactions With 98% Accuracy",
    summary:
      "DeepMind's AlphaFold 3 extends protein structure prediction to drug-protein binding, achieving 98.2% accuracy on PoseBusters benchmark. The model jointly predicts protein, DNA, RNA, and small molecule structures. Access is available via free research API.",
    sourceName: "Nature",
    sourceUrl: "https://nature.com",
    categorySlug: "research",
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    title: "Cursor Raises $100M, Now Valued at $9B After Hitting $100M ARR in 18 Months",
    summary:
      "AI code editor Cursor hit $100M annual recurring revenue faster than any developer tool in history. The Anysphere-built product now serves over 500,000 developers. New funding will expand model context windows and introduce team collaboration features.",
    sourceName: "TechCrunch",
    sourceUrl: "https://techcrunch.com",
    categorySlug: "startups",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "6",
    title: "Meta Releases Llama 3.3 with 128K Context and Multilingual Support",
    summary:
      "Meta's Llama 3.3 70B model adds 128K token context, supports 8 languages natively, and matches GPT-4o on MMLU at a fraction of inference cost. Released under the Llama 3 Community License, compatible with commercial use for companies under 700M monthly users.",
    sourceName: "Meta AI Blog",
    sourceUrl: "https://ai.meta.com/blog",
    categorySlug: "open-source",
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "7",
    title: "Microsoft Copilot Studio Now Lets Enterprises Build Custom AI Agents in Minutes",
    summary:
      "Microsoft's low-code Copilot Studio update enables enterprise teams to deploy task-specific AI agents connected to internal data sources via Microsoft Graph. Agents can read SharePoint, trigger Power Automate flows, and escalate to humans. Generally available globally.",
    sourceName: "Microsoft Blog",
    sourceUrl: "https://blogs.microsoft.com",
    categorySlug: "big-tech",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "8",
    title: "Vercel AI SDK 4.0 Adds Streaming Agents and Multi-Model Routing",
    summary:
      "Vercel's AI SDK 4.0 introduces first-class agent primitives with tool-calling, streaming support across 25+ model providers, and a new router that automatically selects the cheapest capable model per request. TypeScript-native with full Edge Runtime compatibility.",
    sourceName: "Vercel Blog",
    sourceUrl: "https://vercel.com/blog",
    categorySlug: "tools",
    publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "9",
    title: "OpenAI o3 Achieves 88% on ARC-AGI, Surpassing Human Average of 85%",
    summary:
      "OpenAI's reasoning model o3 scored 88% on the ARC-AGI benchmark designed to be unsolvable by current AI systems. The result reignites AGI debate. Francois Chollet, ARC creator, notes the model uses significant compute to achieve this — $17 per task on high-compute setting.",
    sourceName: "OpenAI Research",
    sourceUrl: "https://openai.com/research",
    categorySlug: "ai-models",
    publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "10",
    title: "LangChain Launches LangGraph Cloud for Production Agent Deployment",
    summary:
      "LangChain's LangGraph Cloud provides managed infrastructure for stateful, multi-step AI agents with built-in persistence, human-in-the-loop checkpoints, and observability. Pricing starts at $0.001 per agent step. Available now with a 14-day free trial.",
    sourceName: "LangChain Blog",
    sourceUrl: "https://blog.langchain.dev",
    categorySlug: "tools",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "11",
    title: "Sakana AI's 'AI Scientist' Writes, Reviews, and Submits Its Own Research Papers",
    summary:
      "Sakana AI demonstrated an autonomous research system that generates novel ML hypotheses, runs experiments on a compute cluster, writes full IEEE-format papers, and simulates peer review. Three generated papers passed initial review at top venues, raising questions about academic integrity.",
    sourceName: "Sakana AI",
    sourceUrl: "https://sakana.ai",
    categorySlug: "research",
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "12",
    title: "Perplexity AI Valued at $9B After $500M Round, Eyes Search Market Disruption",
    summary:
      "Perplexity AI closed a $500M Series D led by SoftBank Vision Fund, reaching 100M monthly active users. The AI-native search engine is gaining 10% of traffic from Google queries according to internal metrics. A Pro subscription now includes real-time data and custom AI personas.",
    sourceName: "Bloomberg",
    sourceUrl: "https://bloomberg.com",
    categorySlug: "startups",
    publishedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

export function getStoriesByCategory(categorySlug: string): NewsItem[] {
  if (categorySlug === "all") return MOCK_STORIES;
  return MOCK_STORIES.filter((s) => s.categorySlug === categorySlug);
}

export function formatTimeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

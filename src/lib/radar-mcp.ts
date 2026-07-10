// MCP market — a curated directory of the most useful Model Context Protocol
// servers, the connectors that let an AI assistant act on real systems (your
// database, GitHub, the browser, Slack…). Static editorial like the essentials:
// reliable, no ingestion. `by` marks first-party/official vs community.
// Live GitHub stars are a follow-up; curated order = popularity for now.
//
// Calm brand voice: verb-first, factual, no hype, no emoji in copy.

import type { CategorySlug } from "./types";

export interface McpServer {
  name: string;
  tagline: string; // one-line value
  description: string; // 2–3 sentence body for the detail sheet
  category: McpCategory;
  url: string; // repo or docs (stable id + open-site target)
  by: "official" | "community";
}

export type McpCategory =
  | "Dev tools"
  | "Databases"
  | "Search & web"
  | "Browser & automation"
  | "Productivity"
  | "Cloud & infra"
  | "Memory & reasoning"
  | "Payments";

// Display order + emoji for the market's category sections / chips.
export const MCP_CATEGORY_ORDER: McpCategory[] = [
  "Dev tools", "Databases", "Search & web", "Browser & automation",
  "Productivity", "Cloud & infra", "Memory & reasoning", "Payments",
];

export const MCP_CATEGORY_EMOJI: Record<McpCategory, string> = {
  "Dev tools": "🛠️",
  "Databases": "🗄️",
  "Search & web": "🔎",
  "Browser & automation": "🌐",
  "Productivity": "📥",
  "Cloud & infra": "☁️",
  "Memory & reasoning": "🧠",
  "Payments": "💳",
};

// Extract "owner/repo" from a github.com URL (for stars/date enrichment).
export function githubFullName(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname !== "github.com") return null;
    const parts = u.pathname.split("/").filter(Boolean);
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : null;
  } catch {
    return null;
  }
}

// Category → accent slug, for the mark/cover tint (reuses the category palette).
export const MCP_CATEGORY_SLUG: Record<McpCategory, CategorySlug> = {
  "Dev tools": "dev-tools",
  "Databases": "infrastructure",
  "Search & web": "research",
  "Browser & automation": "ai-models",
  "Productivity": "startups",
  "Cloud & infra": "infrastructure",
  "Memory & reasoning": "research",
  "Payments": "funding-ma",
};

export const MCP_SERVERS: McpServer[] = [
  // ── Dev tools ──
  {
    name: "GitHub", by: "official", category: "Dev tools",
    tagline: "Let AI manage repos, issues, and pull requests.",
    description: "The official GitHub MCP server gives an assistant access to your repositories, issues, and pull requests. It can read code, open and review PRs, and triage issues on your behalf.",
    url: "https://github.com/github/github-mcp-server",
  },
  {
    name: "Filesystem", by: "official", category: "Dev tools",
    tagline: "Read and write local files, safely scoped.",
    description: "A reference server that lets an assistant read and edit files in directories you allow. It's the simplest way to give a model controlled access to a project on disk.",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
  },
  {
    name: "Git", by: "official", category: "Dev tools",
    tagline: "Run git operations on a local repository.",
    description: "A reference server exposing git commands — status, diff, log, commit — so an assistant can inspect and manage version history directly.",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/git",
  },
  {
    name: "Sentry", by: "official", category: "Dev tools",
    tagline: "Pull error and performance context into the chat.",
    description: "The Sentry MCP server lets an assistant fetch issues, stack traces, and performance data from your projects, so it can debug with real production context.",
    url: "https://github.com/getsentry/sentry-mcp",
  },
  {
    name: "JetBrains", by: "official", category: "Dev tools",
    tagline: "Give the assistant context from your JetBrains IDE.",
    description: "The JetBrains MCP server connects an assistant to IntelliJ, PyCharm, and WebStorm, so it can read the open project, navigate code, and suggest refactors with real IDE context.",
    url: "https://github.com/JetBrains/mcp-jetbrains",
  },
  {
    name: "Cypress", by: "official", category: "Dev tools",
    tagline: "Run and inspect end-to-end tests from the assistant.",
    description: "Cypress's MCP server lets an assistant run your end-to-end suite, read failures, and inspect the DOM at each step — one of the production testing platforms wiring directly into agents in 2026.",
    url: "https://github.com/cypress-io/cypress-mcp",
  },

  // ── Databases ──
  {
    name: "PostgreSQL", by: "official", category: "Databases",
    tagline: "Query a Postgres database in natural language.",
    description: "A reference server that connects an assistant to Postgres, letting it inspect schemas and run read queries. Useful for letting a model answer questions about your data.",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres",
  },
  {
    name: "Supabase", by: "official", category: "Databases",
    tagline: "Manage your Supabase project from the assistant.",
    description: "The Supabase MCP server lets an assistant query your database, manage tables, and run tasks against your project, turning natural language into Supabase operations.",
    url: "https://github.com/supabase-community/supabase-mcp",
  },
  {
    name: "Redis", by: "community", category: "Databases",
    tagline: "Read and write a Redis store from the assistant.",
    description: "Connects an assistant to Redis for key-value and cache operations, so it can inspect or update state during a task.",
    url: "https://github.com/redis/mcp-redis",
  },
  {
    name: "Chroma", by: "official", category: "Databases",
    tagline: "Store and semantically search embeddings.",
    description: "The Chroma MCP server gives an assistant a vector store for retrieval — adding documents, running semantic search, and grounding answers in your own data.",
    url: "https://github.com/chroma-core/chroma-mcp",
  },
  {
    name: "MindsDB", by: "official", category: "Databases",
    tagline: "Query many databases as one, in natural language.",
    description: "MindsDB exposes a single MCP endpoint that federates queries across your databases, warehouses, and vector stores, so an assistant can ask questions across all of them at once.",
    url: "https://github.com/mindsdb/mindsdb",
  },

  // ── Search & web ──
  {
    name: "Fetch", by: "official", category: "Search & web",
    tagline: "Fetch a URL and convert it for the model.",
    description: "A reference server that retrieves a web page and converts it to clean markdown the model can read. The simplest way to give an assistant the open web.",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
  },
  {
    name: "Exa", by: "official", category: "Search & web",
    tagline: "Give the assistant AI-native web search.",
    description: "The Exa MCP server lets an assistant run semantic web searches and pull full page content, built for retrieving high-quality sources for agents.",
    url: "https://github.com/exa-labs/exa-mcp-server",
  },
  {
    name: "Brave Search", by: "official", category: "Search & web",
    tagline: "Search the web via the Brave API.",
    description: "A reference server that adds web and local search through Brave's independent index, with no tracking.",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search",
  },
  {
    name: "Tavily", by: "official", category: "Search & web",
    tagline: "Search and extract built for agents.",
    description: "The Tavily MCP server provides search and content extraction tuned for LLM agents, returning concise, relevant results to ground answers.",
    url: "https://github.com/tavily-ai/tavily-mcp",
  },

  // ── Browser & automation ──
  {
    name: "Playwright", by: "official", category: "Browser & automation",
    tagline: "Drive a real browser to navigate and act.",
    description: "Microsoft's Playwright MCP server lets an assistant control a browser — click, type, navigate, and read pages — using accessibility structure rather than screenshots.",
    url: "https://github.com/microsoft/playwright-mcp",
  },
  {
    name: "Puppeteer", by: "official", category: "Browser & automation",
    tagline: "Automate a headless Chrome browser.",
    description: "A reference server for browser automation via Puppeteer, letting an assistant navigate pages, fill forms, and capture content.",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer",
  },
  {
    name: "Browserbase", by: "official", category: "Browser & automation",
    tagline: "Run cloud browsers for agents at scale.",
    description: "The Browserbase MCP server gives an assistant managed cloud browsers to navigate and automate the web reliably, without running browsers yourself.",
    url: "https://github.com/browserbase/mcp-server-browserbase",
  },
  {
    name: "Vibium", by: "community", category: "Browser & automation",
    tagline: "\"Selenium for AI\" — plain-English, self-healing browser tests.",
    description: "From Selenium's creator Jason Huggins, Vibium ships an MCP server with a full set of browser tools built on WebDriver BiDi — plain-English, self-healing tests an assistant can drive in Cursor or Claude.",
    url: "https://github.com/vibiumhq/vibium",
  },

  // ── Productivity ──
  {
    name: "Notion", by: "official", category: "Productivity",
    tagline: "Read and update your Notion workspace.",
    description: "The official Notion MCP server lets an assistant search pages, read databases, and create or update content in your workspace.",
    url: "https://github.com/makenotion/notion-mcp-server",
  },
  {
    name: "Linear", by: "official", category: "Productivity",
    tagline: "Manage issues and projects in Linear.",
    description: "Linear's MCP server lets an assistant create, search, and update issues and projects, so planning and triage can happen from the chat.",
    url: "https://linear.app/docs/mcp",
  },
  {
    name: "Slack", by: "community", category: "Productivity",
    tagline: "Read and post messages in Slack.",
    description: "Connects an assistant to Slack to read channels and send messages, so it can summarize discussions or post updates.",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/slack",
  },
  {
    name: "Pipedream", by: "official", category: "Productivity",
    tagline: "Reach 2,500+ apps through one connector.",
    description: "Pipedream's MCP server exposes thousands of prebuilt actions across 2,500+ APIs, so an assistant can act across your whole SaaS stack — with auth handled — from a single connection.",
    url: "https://github.com/PipedreamHQ/pipedream",
  },
  {
    name: "Google Drive", by: "community", category: "Productivity",
    tagline: "Search and read files in Google Drive.",
    description: "Gives an assistant access to search and read documents in Drive, so it can answer questions grounded in your files.",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive",
  },

  // ── Cloud & infra ──
  {
    name: "AWS", by: "official", category: "Cloud & infra",
    tagline: "Work with AWS services and docs.",
    description: "AWS's official MCP servers let an assistant query documentation, infrastructure, and services across your AWS account for ops and development tasks.",
    url: "https://github.com/awslabs/mcp",
  },
  {
    name: "Cloudflare", by: "official", category: "Cloud & infra",
    tagline: "Manage Cloudflare from the assistant.",
    description: "Cloudflare's official MCP servers let an assistant work with Workers, DNS, and other services, turning requests into Cloudflare operations.",
    url: "https://github.com/cloudflare/mcp-server-cloudflare",
  },
  {
    name: "Docker", by: "community", category: "Cloud & infra",
    tagline: "Inspect and run containers from the assistant.",
    description: "Connects an assistant to Docker to list, run, and manage containers, useful for local development and ops tasks.",
    url: "https://github.com/docker/mcp-servers",
  },

  // ── Memory & reasoning ──
  {
    name: "Memory", by: "official", category: "Memory & reasoning",
    tagline: "Give the assistant a persistent knowledge graph.",
    description: "A reference server that stores facts as a knowledge graph the assistant can read and update across sessions, so it remembers what matters between conversations.",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/memory",
  },
  {
    name: "Sequential Thinking", by: "official", category: "Memory & reasoning",
    tagline: "Help the model plan in explicit steps.",
    description: "A reference server that lets an assistant break a problem into a structured, revisable chain of thoughts, improving how it works through complex tasks.",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking",
  },

  // ── Payments ──
  {
    name: "Stripe", by: "official", category: "Payments",
    tagline: "Work with payments and billing in Stripe.",
    description: "Stripe's MCP server lets an assistant create customers, payments, and invoices, and query billing data, so commerce tasks can run from the chat.",
    url: "https://github.com/stripe/agent-toolkit",
  },
  {
    name: "PayPal", by: "official", category: "Payments",
    tagline: "Create invoices and manage payments via PayPal.",
    description: "PayPal's agent toolkit exposes payments, invoicing, and order management to an assistant, so commerce flows can run from natural language.",
    url: "https://github.com/paypal/agent-toolkit",
  },

  // ── More: Dev tools ──
  {
    name: "Context7", by: "community", category: "Dev tools",
    tagline: "Pull up-to-date library docs into the model.",
    description: "Context7 fetches current, version-specific documentation and code examples for libraries and feeds them to the assistant, cutting down on outdated or hallucinated APIs.",
    url: "https://github.com/upstash/context7",
  },
  {
    name: "Figma", by: "community", category: "Dev tools",
    tagline: "Give the assistant your Figma design context.",
    description: "The Framelink Figma MCP server lets an AI coding tool read your Figma layouts and styles, so it can generate UI that matches the design.",
    url: "https://github.com/GLips/Figma-Context-MCP",
  },
  {
    name: "Desktop Commander", by: "community", category: "Dev tools",
    tagline: "Run terminal commands and edit files locally.",
    description: "Gives an assistant control of your terminal and filesystem to run commands, manage processes, and edit code across a project.",
    url: "https://github.com/wonderwhy-er/DesktopCommanderMCP",
  },
  {
    name: "Figma Dev Mode", by: "official", category: "Dev tools",
    tagline: "Pull Figma's official design context into your IDE.",
    description: "Figma's official Dev Mode MCP server gives an AI coding tool structured access to your selected frames — layout, variables, and components — so generated code matches the design.",
    url: "https://developers.figma.com/docs/figma-mcp-server",
  },
  {
    name: "Hugging Face", by: "official", category: "Dev tools",
    tagline: "Search models, datasets, and Spaces from the assistant.",
    description: "Hugging Face's official MCP server lets an assistant search the Hub for models, datasets, and papers, and call Spaces as tools, grounding work in the open-source ecosystem.",
    url: "https://huggingface.co/mcp",
  },

  // ── More: Databases ──
  {
    name: "MongoDB", by: "official", category: "Databases",
    tagline: "Query and manage MongoDB from the assistant.",
    description: "MongoDB's official MCP server lets an assistant explore collections, run queries, and manage data and indexes against your clusters.",
    url: "https://github.com/mongodb-js/mongodb-mcp-server",
  },
  {
    name: "Neon", by: "official", category: "Databases",
    tagline: "Manage serverless Postgres with natural language.",
    description: "Neon's MCP server lets an assistant create databases and branches and run SQL against serverless Postgres, turning requests into database operations.",
    url: "https://github.com/neondatabase/mcp-server-neon",
  },
  {
    name: "ClickHouse", by: "official", category: "Databases",
    tagline: "Run analytics queries on ClickHouse.",
    description: "ClickHouse's MCP server lets an assistant run read queries against your analytics database, so it can answer questions over large datasets.",
    url: "https://github.com/ClickHouse/mcp-clickhouse",
  },

  // ── More: Search & web ──
  {
    name: "Firecrawl", by: "community", category: "Search & web",
    tagline: "Scrape and crawl websites into clean data.",
    description: "Firecrawl's MCP server lets an assistant scrape pages and crawl sites, returning clean markdown or structured data for research and extraction.",
    url: "https://github.com/mendableai/firecrawl-mcp-server",
  },
  {
    name: "Perplexity", by: "official", category: "Search & web",
    tagline: "Add Perplexity's Sonar web search.",
    description: "Perplexity's MCP server gives an assistant live, cited web answers through the Sonar API, grounding responses in current sources.",
    url: "https://github.com/ppl-ai/modelcontextprotocol",
  },

  // ── More: Browser & automation ──
  {
    name: "Apify", by: "official", category: "Browser & automation",
    tagline: "Run web scrapers and automation actors.",
    description: "Apify's MCP server lets an assistant run thousands of pre-built scrapers and automation 'actors' to extract data from across the web.",
    url: "https://github.com/apify/actors-mcp-server",
  },
  {
    name: "Chrome DevTools", by: "official", category: "Browser & automation",
    tagline: "Let the assistant debug a live Chrome page.",
    description: "Chrome's official DevTools MCP server lets an assistant inspect the DOM, read console and network activity, and run performance traces against a real browser, so it can debug and verify web pages.",
    url: "https://github.com/ChromeDevTools/chrome-devtools-mcp",
  },

  // ── More: Productivity ──
  {
    name: "Atlassian", by: "community", category: "Productivity",
    tagline: "Work with Jira and Confluence.",
    description: "The Atlassian MCP server lets an assistant search and update Jira issues and Confluence pages, so planning and docs can happen from the chat.",
    url: "https://github.com/sooperset/mcp-atlassian",
  },
  {
    name: "Obsidian", by: "community", category: "Productivity",
    tagline: "Read and search your Obsidian vault.",
    description: "Connects an assistant to your Obsidian notes so it can search, read, and reference your knowledge base while it works.",
    url: "https://github.com/MarkusPfundstein/mcp-obsidian",
  },

  // ── More: Cloud & infra ──
  {
    name: "Kubernetes", by: "community", category: "Cloud & infra",
    tagline: "Inspect and manage Kubernetes clusters.",
    description: "Lets an assistant list, inspect, and manage Kubernetes resources, useful for ops and debugging from natural language.",
    url: "https://github.com/Flux159/mcp-server-kubernetes",
  },
  {
    name: "Grafana", by: "official", category: "Cloud & infra",
    tagline: "Query dashboards, metrics, and incidents.",
    description: "Grafana's MCP server lets an assistant search dashboards, query datasources, and read incidents, so observability data is available in the chat.",
    url: "https://github.com/grafana/mcp-grafana",
  },
  {
    name: "Terraform", by: "official", category: "Cloud & infra",
    tagline: "Work with Terraform providers and modules.",
    description: "HashiCorp's Terraform MCP server lets an assistant look up providers, modules, and registry data to help author and reason about infrastructure as code.",
    url: "https://github.com/hashicorp/terraform-mcp-server",
  },

  // ── More: Memory & reasoning ──
  {
    name: "Time", by: "official", category: "Memory & reasoning",
    tagline: "Give the model timezone-aware time tools.",
    description: "A reference server providing current time and timezone conversion, so an assistant can reason about schedules and deadlines correctly.",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/time",
  },
  {
    name: "Zep", by: "official", category: "Memory & reasoning",
    tagline: "Long-term user memory with semantic search across sessions.",
    description: "Zep gives an assistant persistent memory with user profiling and semantic recall — facts, preferences and prior context survive across sessions, built for production agent systems.",
    url: "https://github.com/getzep/mcp-zep",
  },

  // ── More: Dev tools ──
  {
    name: "Vercel", by: "official", category: "Dev tools",
    tagline: "Deploy projects and query logs from the assistant.",
    description: "Vercel's official MCP server lets an assistant trigger deployments, read build logs, manage environment variables, and inspect project state — all from natural language.",
    url: "https://vercel.com/changelog/vercel-mcp-server",
  },
  {
    name: "E2B", by: "official", category: "Dev tools",
    tagline: "Run code in isolated cloud sandboxes.",
    description: "E2B's MCP server gives an assistant access to secure, long-running cloud sandboxes to execute arbitrary code, install packages, and run processes safely — no local environment needed.",
    url: "https://github.com/e2b-dev/mcp-server",
  },
  {
    name: "Stagehand", by: "official", category: "Browser & automation",
    tagline: "Automate browsers using natural language instructions.",
    description: "Stagehand by Browserbase lets an assistant act on websites in natural language — click, fill forms, and extract data — backed by a managed cloud browser with reliable visual grounding.",
    url: "https://github.com/browserbase/stagehand",
  },
  {
    name: "n8n", by: "official", category: "Productivity",
    tagline: "Trigger and manage workflow automations from the chat.",
    description: "n8n's MCP server lets an assistant execute workflows, inspect run history, and manage automation pipelines without leaving the conversation — useful for no-code automation at scale.",
    url: "https://github.com/n8n-io/n8n-mcp",
  },

  // ── More: Databases ──
  {
    name: "SQLite", by: "official", category: "Databases",
    tagline: "Query and write a local SQLite database.",
    description: "A reference server for SQLite that lets an assistant read and write a local database file with full SQL support — the simplest way to give a model structured local data.",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite",
  },
  {
    name: "Qdrant", by: "official", category: "Databases",
    tagline: "Run vector search and manage a Qdrant collection.",
    description: "Qdrant's official MCP server gives an assistant semantic and hybrid vector search plus collection management — useful for RAG pipelines and similarity-based retrieval.",
    url: "https://github.com/qdrant/mcp-server-qdrant",
  },
  {
    name: "Weaviate", by: "official", category: "Databases",
    tagline: "Search and store vectors in Weaviate.",
    description: "Weaviate's MCP server lets an assistant run hybrid semantic and keyword searches and manage objects in a Weaviate vector store, with built-in filtering and multi-tenancy.",
    url: "https://github.com/weaviate/mcp-server-weaviate",
  },
  {
    name: "Snowflake", by: "official", category: "Databases",
    tagline: "Run analytics queries on a Snowflake warehouse.",
    description: "Snowflake's MCP server lets an assistant query tables, inspect schemas, and run SQL against a cloud data warehouse — turning data questions into direct warehouse calls.",
    url: "https://github.com/Snowflake-Labs/mcp",
  },
  {
    name: "Turso", by: "official", category: "Databases",
    tagline: "Query an edge SQLite database via LibSQL.",
    description: "Turso's MCP server connects an assistant to a LibSQL edge database, letting it run queries close to the user with ultra-low latency and no server to manage.",
    url: "https://github.com/tursodatabase/turso-mcp",
  },

  // ── More: Search & web ──
  {
    name: "Google Maps", by: "official", category: "Search & web",
    tagline: "Search places and get directions.",
    description: "A reference server that adds Google Maps to an assistant — place search, geocoding, directions, and distance calculations for location-aware tasks.",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/google-maps",
  },
  {
    name: "YouTube Transcripts", by: "community", category: "Search & web",
    tagline: "Fetch full transcripts from any YouTube video.",
    description: "Lets an assistant retrieve the full transcript of a YouTube video by URL, useful for summarising talks, extracting quotes, and grounding answers in video content.",
    url: "https://github.com/kimtaeyoon83/mcp-server-youtube-transcript",
  },

  // ── More: Productivity ──
  {
    name: "Resend", by: "official", category: "Productivity",
    tagline: "Send transactional and marketing emails.",
    description: "Resend's official MCP server lets an assistant compose and send emails via the Resend API — useful for building notification flows and outreach automations.",
    url: "https://github.com/resend/resend-mcp",
  },
  {
    name: "Airtable", by: "community", category: "Productivity",
    tagline: "Read, create and update Airtable records.",
    description: "Connects an assistant to Airtable bases to query records, create rows, and update fields — treating your structured data as a lightweight operational database.",
    url: "https://github.com/felores/airtable-mcp",
  },
  {
    name: "HubSpot", by: "official", category: "Productivity",
    tagline: "Manage CRM contacts, deals and companies.",
    description: "HubSpot's MCP server lets an assistant search, create, and update contacts, deals, and companies in your CRM — so sales and support tasks run from natural language.",
    url: "https://developers.hubspot.com/mcp",
  },
  {
    name: "Google Calendar", by: "community", category: "Productivity",
    tagline: "Read and create calendar events.",
    description: "Connects an assistant to Google Calendar to list upcoming events, check availability, and create or update appointments across your calendars.",
    url: "https://github.com/nspilman/google-calendar-mcp",
  },
  {
    name: "Twilio", by: "community", category: "Productivity",
    tagline: "Send SMS and voice messages from the assistant.",
    description: "Connects an assistant to Twilio to send SMS messages and trigger programmatic calls — useful for building notification workflows and conversational outreach.",
    url: "https://github.com/twilio-labs/mcp",
  },

  // ── More: Cloud & infra ──
  {
    name: "Firebase", by: "official", category: "Cloud & infra",
    tagline: "Manage Firestore, auth and storage.",
    description: "Google's official Firebase MCP server lets an assistant interact with Firestore collections, Authentication, and Storage — turning Firebase into a first-class assistant target.",
    url: "https://firebase.google.com/docs/studio/mcp-server",
  },
  {
    name: "Datadog", by: "official", category: "Cloud & infra",
    tagline: "Query metrics, logs and monitors.",
    description: "Datadog's MCP server lets an assistant search metrics, logs, traces, and alerts — so observability data is reachable in the chat for incident investigation and debugging.",
    url: "https://github.com/DataDog/datadog-mcp-server",
  },
];

// ─── MCP install configs ─────────────────────────────────────────────────────
// Hand-authored, individually verified copy-paste install for the MCP servers
// people actually reach for. Keyed by canonical URL, mirroring the lookup in
// radar-tool-depth.ts — a server with no entry simply renders a docs link.
//
// ⚠️  DO NOT GENERATE THESE.
// The obvious automation — read package.json from the repo, try candidate npm
// names, keep whatever resolves — produces confident nonsense. Measured against
// this catalog it "verified" 49 of 68, including:
//   Filesystem / Git / Fetch -> `servers`  ("a service server registry of sort")
//   Supabase                 -> `mcp`      (an undescribed package by a stranger)
//   Context7                 -> `@upstash/context7`  (never published; the real
//                                                     package is …/context7-mcp)
// And squatting is real: `mcp-server-redis` on npm self-describes as a
// "security research canary, not for production use". Shipping a generated
// command would point users at strangers' packages, which is worse than
// shipping nothing.
//
// Rule for adding an entry: the package must resolve on registry.npmjs.org (or
// PyPI for uvx), expose a `bin`, and carry a description that plainly matches
// this server. Env vars are read off the maintainer's own README — names only,
// never invented, never with example values.

export type InstallCommand = "npx" | "uvx" | "docker";

export interface McpInstall {
  /** Runner. npx = npm package, uvx = PyPI package, docker = container image. */
  command: InstallCommand;
  /** Args exactly as they should be pasted. */
  args: string[];
  /** Env var NAMES the server requires. Values are the user's to supply. */
  env?: string[];
  /** Hosted servers connect by URL rather than running a local process. */
  remoteUrl?: string;
  /** Caveat worth showing inline — e.g. the upstream repo is archived. */
  note?: string;
}

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, "").toLowerCase();
}

const ARCHIVED =
  "The upstream reference server is archived. It still installs and runs, but is no longer maintained.";

const RAW: Record<string, McpInstall> = {
  // ── Actively maintained ──
  "https://github.com/upstash/context7": {
    // Upstash now documents the hosted endpoint as the primary path; the
    // @upstash/context7-mcp package is still published but is no longer what
    // the README leads with. Verified against the repo 2026-08-14.
    command: "npx",
    args: ["-y", "@upstash/context7-mcp"],
    remoteUrl: "https://mcp.context7.com/mcp",
    note: "Context7 is now hosted, the endpoint needs an API key sent as an `Authorization: Bearer <key>` header. `npx ctx7 setup` will wire this up for you across supported clients.",
  },
  "https://github.com/chromedevtools/chrome-devtools-mcp": {
    command: "npx",
    args: ["-y", "chrome-devtools-mcp@latest"],
  },
  "https://github.com/microsoft/playwright-mcp": {
    command: "npx",
    args: ["-y", "@playwright/mcp@latest"],
  },
  "https://github.com/github/github-mcp-server": {
    command: "docker",
    args: ["run", "-i", "--rm", "ghcr.io/github/github-mcp-server"],
    remoteUrl: "https://api.githubcopilot.com/mcp/",
    note: "GitHub recommends the hosted endpoint over running the container locally.",
  },
  "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"],
  },
  "https://github.com/modelcontextprotocol/servers/tree/main/src/memory": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-memory"],
  },
  "https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sequential-thinking"],
  },
  "https://github.com/modelcontextprotocol/servers/tree/main/src/git": {
    command: "uvx",
    args: ["mcp-server-git", "--repository", "/path/to/repo"],
  },
  "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch": {
    command: "uvx",
    args: ["mcp-server-fetch"],
  },
  "https://github.com/modelcontextprotocol/servers/tree/main/src/time": {
    command: "uvx",
    args: ["mcp-server-time"],
  },
  "https://github.com/firecrawl/firecrawl-mcp-server": {
    command: "npx",
    args: ["-y", "firecrawl-mcp"],
    env: ["FIRECRAWL_API_KEY"],
  },
  "https://github.com/exa-labs/exa-mcp-server": {
    command: "npx",
    args: ["-y", "exa-mcp-server"],
    env: ["EXA_API_KEY"],
  },
  "https://github.com/tavily-ai/tavily-mcp": {
    command: "npx",
    args: ["-y", "tavily-mcp"],
    env: ["TAVILY_API_KEY"],
  },
  "https://github.com/supabase/mcp": {
    command: "npx",
    args: ["-y", "@supabase/mcp-server-supabase"],
  },
  "https://github.com/makenotion/notion-mcp-server": {
    command: "npx",
    args: ["-y", "@notionhq/notion-mcp-server"],
    env: ["NOTION_TOKEN"],
  },
  "https://github.com/getsentry/sentry-mcp": {
    command: "npx",
    args: ["-y", "@sentry/mcp-server"],
  },
  "https://github.com/browserbase/mcp-server-browserbase": {
    command: "npx",
    args: ["-y", "@browserbasehq/mcp-server-browserbase"],
    env: ["BROWSERBASE_API_KEY", "BROWSERBASE_PROJECT_ID"],
  },
  "https://github.com/neondatabase/mcp-server-neon": {
    command: "npx",
    args: ["-y", "@neondatabase/mcp-server-neon"],
    env: ["NEON_API_KEY"],
  },
  "https://github.com/stripe/agent-toolkit": {
    command: "npx",
    args: ["-y", "@stripe/mcp"],
  },
  "https://github.com/glips/figma-context-mcp": {
    command: "npx",
    args: ["-y", "figma-developer-mcp", "--stdio"],
    env: ["FIGMA_API_KEY"],
  },
  "https://github.com/cloudflare/mcp-server-cloudflare": {
    command: "npx",
    args: ["-y", "@cloudflare/mcp-server-cloudflare"],
  },
  "https://github.com/markuspfundstein/mcp-obsidian": {
    command: "npx",
    args: ["-y", "mcp-obsidian"],
  },

  // ── Archived upstream: still published and runnable, no longer maintained ──
  "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/brave-search": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-brave-search"],
    env: ["BRAVE_API_KEY"],
    note: ARCHIVED,
  },
  "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/puppeteer": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-puppeteer"],
    note: `${ARCHIVED} Playwright MCP is the maintained alternative.`,
  },
  "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/slack": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-slack"],
    note: ARCHIVED,
  },
  "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/postgres": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-postgres"],
    note: ARCHIVED,
  },
  "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/gdrive": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-gdrive"],
    note: ARCHIVED,
  },
  "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/google-maps": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-google-maps"],
    note: ARCHIVED,
  },
  "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/sqlite": {
    command: "uvx",
    args: ["mcp-server-sqlite", "--db-path", "/path/to/db.sqlite"],
    note: ARCHIVED,
  },
  "https://github.com/redis/mcp-redis": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-redis"],
    note: `${ARCHIVED} Note the npm package \`mcp-server-redis\` is an unrelated squatted name, use the scoped package above.`,
  },
};

const LOOKUP: Record<string, McpInstall> = Object.fromEntries(
  Object.entries(RAW).map(([url, v]) => [normalizeUrl(url), v]),
);

export function getMcpInstall(url: string | undefined): McpInstall | undefined {
  return url ? LOOKUP[normalizeUrl(url)] : undefined;
}

/** `claude mcp add <name> -- <command> <args…>` — the fastest path for Claude Code. */
export function claudeCodeCommand(serverName: string, i: McpInstall): string {
  const key = serverName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (i.remoteUrl) return `claude mcp add --transport http ${key} ${i.remoteUrl}`;
  return `claude mcp add ${key} -- ${i.command} ${i.args.join(" ")}`;
}

/** The `mcpServers` block used by Claude Desktop, Cursor, VS Code and Windsurf. */
export function mcpServersJson(serverName: string, i: McpInstall): string {
  const key = serverName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const entry: Record<string, unknown> = i.remoteUrl
    ? { type: "http", url: i.remoteUrl }
    : { command: i.command, args: i.args };
  if (i.env?.length) {
    entry.env = Object.fromEntries(i.env.map((e) => [e, `<your ${e}>`]));
  }
  return JSON.stringify({ mcpServers: { [key]: entry } }, null, 2);
}

// ─── MCP client configuration reference ──────────────────────────────────────
// The highest-intent search in this category isn't "list of MCP servers" — the
// big directories have that covered at 71,000 entries. It's "where is the config
// file" and "why isn't my server showing up". People search this while something
// is broken, which is both better traffic and a better reason to come back than
// any listicle.
//
// Every path below was verified against a primary source in August 2026:
// Claude Code scopes from code.claude.com/docs/en/mcp (the scope table), the
// rest from vendor documentation. If you change one, re-verify it — a wrong path
// here is worse than no page at all.

export interface McpClient {
  id: string;
  name: string;
  /** The JSON key servers live under. VS Code differs and it breaks installs. */
  rootKey: string;
  paths: { os: string; path: string }[];
  /** Anything non-obvious that costs people an hour. */
  notes: string[];
}

export const MCP_CLIENTS: McpClient[] = [
  {
    id: "claude-code",
    name: "Claude Code",
    rootKey: "mcpServers",
    paths: [
      { os: "Project (shared, commit it)", path: ".mcp.json" },
      { os: "Local + User scope", path: "~/.claude.json" },
    ],
    notes: [
      "Local scope is the **default**, `claude mcp add` writes to `~/.claude.json` scoped to the current project, not to `.mcp.json`. Add `--scope project` to share with your team, or `--scope user` for all your projects.",
      "MCP local scope (`~/.claude.json`) is **not** the same file as general local settings (`.claude/settings.local.json`). The docs call this out because people conflate them constantly.",
      "Project servers from `.mcp.json` need approval. They show as `⏸ Pending approval (run claude to approve)` until you run `claude` interactively and accept.",
      "A cloned repo **cannot approve its own servers**. Until you trust the workspace, a committed `enableAllProjectMcpServers` is ignored and the server stays pending.",
      "Check status with `claude mcp get <name>` rather than guessing.",
      "In `claude mcp add`, `--` separates Claude's own flags from the server command. Everything after it is passed through untouched.",
    ],
  },
  {
    id: "claude-desktop",
    name: "Claude Desktop",
    rootKey: "mcpServers",
    paths: [
      { os: "macOS", path: "~/Library/Application Support/Claude/claude_desktop_config.json" },
      { os: "Windows", path: "%APPDATA%/Claude/claude_desktop_config.json" },
      { os: "Linux", path: "~/.config/claude/claude_desktop_config.json" },
    ],
    notes: [
      "The in-app **Edit Config** button has been reported to open the wrong file, so people edit something that is never read. If your change has no effect, open the path above directly and confirm you are looking at the same file.",
      "Restart the app fully after editing. Closing the window is not enough on macOS, quit it.",
    ],
  },
  {
    id: "cursor",
    name: "Cursor",
    rootKey: "mcpServers",
    paths: [
      { os: "Project", path: ".cursor/mcp.json" },
      { os: "Global", path: "~/.cursor/mcp.json" },
    ],
    notes: [
      "Same JSON shape as Claude Desktop, so an `mcpServers` block copies across unchanged.",
      "Project config wins where both exist, useful for pinning a server to one repo.",
    ],
  },
  {
    id: "vscode",
    name: "VS Code",
    rootKey: "servers",
    paths: [{ os: "Workspace", path: ".vscode/mcp.json" }],
    notes: [
      "**VS Code uses `servers`, not `mcpServers`.** This is the single most common reason a config pasted from a README silently does nothing. Everything else about the entry is the same.",
    ],
  },
  {
    id: "windsurf",
    name: "Devin Desktop (Windsurf)",
    rootKey: "mcpServers",
    paths: [
      { os: "macOS / Linux", path: "~/.codeium/windsurf/mcp_config.json" },
      { os: "Windows", path: "%USERPROFILE%\\.codeium\\windsurf\\mcp_config.json" },
    ],
    notes: [
      "The file is **not created on first launch**. You have to make it yourself, directories included.",
      "Cmd+Shift+P → \"Windsurf: Configure MCP Servers\" opens it without hunting for the path.",
      "Windsurf became **Devin Desktop** in June 2026. The rename did not move the config: the directory is still `.codeium/windsurf`.",
    ],
  },
];

/** Failure buckets, in the order they are actually worth checking. */
export const MCP_FAILURES: { symptom: string; cause: string; fix: string }[] = [
  {
    symptom: "The server does not appear at all",
    cause: "Wrong file, or the wrong root key",
    fix: "Confirm the exact path for your client above. In VS Code, check you used `servers` and not `mcpServers`. In Claude Code, run `claude mcp get <name>`, if it says pending approval, run `claude` and approve it.",
  },
  {
    symptom: "It appears but will not connect",
    cause: "The command cannot run",
    fix: "Run the `command` and `args` yourself in a terminal. `npx -y <package>` should start and wait. If it errors there, it will error in the client. This isolates the problem in seconds.",
  },
  {
    symptom: "Works locally, fails for teammates",
    cause: "Scope",
    fix: "You almost certainly used local scope, which is the default. Re-add with `--scope project` so it lands in `.mcp.json`, and commit that file.",
  },
  {
    symptom: "Auth failures against a hosted server",
    cause: "Missing or unexpanded environment variable",
    fix: "Confirm the variable is exported in the environment the client launches from, a GUI app does not inherit your shell profile. Restart the client fully after changing it.",
  },
  {
    symptom: "Everything works but the model picks the wrong tool",
    cause: "Too many servers",
    fix: "Every server adds tool definitions to the context window, and a bloated tool list measurably degrades tool selection. Three to five is the working recommendation. Remove what you are not using.",
  },
  {
    symptom: "Breaks only on native Windows",
    cause: "POSIX path assumptions",
    fix: "Many servers assume POSIX paths, shell hooks and file watchers. WSL is the supported path in 2026, if a server misbehaves only on native Windows, try it under WSL before debugging further.",
  },
];

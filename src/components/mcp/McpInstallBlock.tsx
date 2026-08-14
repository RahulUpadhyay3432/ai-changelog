import { ArrowUpRight } from "lucide-react";
import { claudeCodeCommand, mcpServersJson, type McpInstall } from "@/lib/mcp-install";
import { HAIRLINE, SG } from "@/lib/design-tokens";

// Rendered on both MCP detail surfaces (/mcp/[slug] and /tools/[slug]). Server
// component on purpose — a copy button would cost a client bundle on every page
// for something `user-select: all` already handles with one click-drag.

const pre = {
  fontFamily: "var(--font-geist-mono), monospace",
  fontSize: "12.5px",
  color: "#cbc7bf",
  background: "var(--kt-code-bg, #141310)",
  border: `1px solid ${HAIRLINE}`,
  borderRadius: "12px",
  padding: "14px 16px",
  overflowX: "auto" as const,
  lineHeight: 1.6,
  margin: 0,
  userSelect: "all" as const,
};

const label = {
  display: "block",
  fontFamily: SG,
  fontSize: "12px",
  fontWeight: 600,
  color: "#737373",
  margin: "0 0 7px",
};

const h2 = {
  fontFamily: SG,
  fontSize: "20px",
  fontWeight: 700,
  color: "#f5f5f5",
  letterSpacing: "-0.02em",
  margin: "0 0 6px",
} as const;

export function McpInstallBlock({
  name,
  install,
  docsUrl,
}: {
  name: string;
  install: McpInstall | undefined;
  docsUrl: string;
}) {
  // No verified config: say so and hand off. Never print a guessed command —
  // a wrong install line sends people to a stranger's package.
  if (!install) {
    return (
      <section style={{ margin: "34px 0 0" }}>
        <h2 style={h2}>Installing {name}</h2>
        <p style={{ fontSize: "15px", color: "#a3a3a3", lineHeight: 1.7, margin: "10px 0 0" }}>
          We haven&apos;t verified a copy-paste config for this one yet. Rather than print a command we
          aren&apos;t sure about, here are the maintainer&apos;s own instructions.
        </p>
        <a
          href={docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: SG,
            fontSize: "14px",
            fontWeight: 600,
            color: "#cbc7bf",
            border: `1px solid ${HAIRLINE}`,
            borderRadius: "12px",
            padding: "10px 16px",
            textDecoration: "none",
            marginTop: "14px",
          }}
        >
          <ArrowUpRight size={15} strokeWidth={2.2} /> Install instructions
        </a>
      </section>
    );
  }

  const cli = claudeCodeCommand(name, install);
  const json = mcpServersJson(name, install);

  return (
    <section style={{ margin: "34px 0 0" }}>
      <h2 style={h2}>Installing {name}</h2>
      <p style={{ fontSize: "15px", color: "#a3a3a3", lineHeight: 1.7, margin: "8px 0 18px" }}>
        {install.remoteUrl
          ? "A hosted server — connect to the endpoint, nothing to run locally."
          : install.command === "docker"
            ? "Runs as a container. Docker must be installed."
            : install.command === "uvx"
              ? "A Python server. Needs uv installed (uvx ships with it)."
              : "Runs on demand via npx. Nothing to install globally."}
      </p>

      {install.note && (
        <p
          style={{
            fontSize: "13.5px",
            color: "#d5c9a8",
            lineHeight: 1.6,
            background: "rgba(217,178,124,0.07)",
            border: "1px solid rgba(217,178,124,0.22)",
            borderRadius: "10px",
            padding: "11px 14px",
            margin: "0 0 18px",
          }}
        >
          {install.note}
        </p>
      )}

      <div style={{ margin: "0 0 18px" }}>
        <span style={label}>Claude Code</span>
        <pre style={pre}>{cli}</pre>
      </div>

      <div>
        <span style={label}>Claude Desktop · Cursor · VS Code · Windsurf</span>
        <pre style={pre}>{json}</pre>
      </div>

      {install.env?.length ? (
        <p style={{ fontSize: "13.5px", color: "#a3a3a3", lineHeight: 1.7, margin: "14px 0 0" }}>
          Requires {install.env.map((e) => <code key={e} style={{ color: "#cbc7bf" }}>{e}</code>).reduce<React.ReactNode[]>(
            (acc, el, i) => (i === 0 ? [el] : [...acc, ", ", el]),
            [],
          )}
          {" — get "}
          {install.env.length > 1 ? "these" : "this"} from{" "}
          <a href={docsUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#cbc7bf" }}>
            the maintainer
          </a>
          . Never commit them.
        </p>
      ) : null}
    </section>
  );
}

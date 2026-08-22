#!/usr/bin/env node
// Guard for src/lib/mcp-install.ts.
//
// Every published install command must point at a package that actually exists
// and is executable. This exists because the generated version of this data was
// confidently wrong: candidate-name derivation mapped Filesystem, Git and Fetch
// all to `servers` (an unrelated "service server registry"), and Supabase to
// `mcp`. npm also carries squatted names — `mcp-server-redis` self-describes as
// a "security research canary — not for production use".
//
// Run before committing any change to mcp-install.ts:
//   node scripts/verify-mcp-install.mjs

import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../src/lib/mcp-install.ts", import.meta.url), "utf8");
const entries = [...src.matchAll(/"(https:\/\/[^"]+)": \{\s*command: "(\w+)",\s*args: \[([^\]]+)\]/g)];

if (entries.length === 0) {
  console.error("no install entries parsed — did the file shape change?");
  process.exit(1);
}

const firstPkg = (cmd, argStr) => {
  const args = argStr.split(",").map((a) => a.trim().replace(/^"|"$/g, ""));
  if (cmd === "npx") return args.find((a) => a !== "-y");
  if (cmd === "uvx") return args[0];
  return null; // docker — nothing to resolve
};

let failures = 0;
let checked = 0;

await Promise.all(
  entries.map(async ([, url, cmd, argStr]) => {
    const raw = firstPkg(cmd, argStr);
    if (!raw) return;
    const pkg = raw.replace(/@latest$/, "");
    checked++;
    try {
      if (cmd === "npx") {
        const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg).replace(/%40/g, "@")}`);
        if (!res.ok) throw new Error(`npm ${res.status}`);
        const doc = await res.json();
        const latest = doc["dist-tags"]?.latest;
        const version = doc.versions?.[latest];
        if (!version) throw new Error("no latest version");
        if (!version.bin) throw new Error("package has no bin — not npx-executable");
      } else {
        const res = await fetch(`https://pypi.org/pypi/${pkg}/json`);
        if (!res.ok) throw new Error(`pypi ${res.status}`);
      }
    } catch (err) {
      failures++;
      console.error(`  FAIL  ${cmd.padEnd(5)} ${pkg}  (${url})\n        ${err.message}`);
    }
  }),
);

console.log(`\nchecked ${checked} packages across ${entries.length} entries — ${failures} failure(s)`);
process.exit(failures ? 1 : 0);

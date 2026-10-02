#!/usr/bin/env node
/**
 * Verifies every LLM provider in the ingestion chain against the REAL classify
 * prompt, and reports which ones can actually produce a usable Kapyn summary.
 *
 * Exists because "N key(s) exhausted" hides four different failures (dead key,
 * zero-quota model, no balance, retired slug) and the only way to tell them apart
 * is to read the real status code. Run this BEFORE adding keys or changing the
 * chain order.
 *
 * Reads keys from the environment only — it never writes them anywhere:
 *   CEREBRAS_API_KEY=... ZAI_API_KEY=... node scripts/verify-llm-providers.mjs
 * Comma-separated lists are supported and every key is tested individually, so a
 * single bad key in a list is identified rather than hidden.
 */
import { readFileSync } from "node:fs";

const TITLE = "Anthropic ships Claude Opus 5.5 with a 2M token context window";
const CONTENT =
  "Anthropic today released Claude Opus 5.5, raising the context window to 2 million tokens " +
  "and cutting output latency by 40 percent versus Opus 5. The model is available on the API " +
  "at $12 per million input tokens and leads SWE-bench Verified at 81.4 percent. Enterprise " +
  "customers on Bedrock and Vertex get access next week.";

// Pull the live prompt out of the source so this cannot drift from production.
function buildPrompt() {
  const src = readFileSync("src/lib/news-ingest.ts", "utf8");
  const m = src.match(/return `You are a tech editor[\s\S]*?Content: \$\{content\.slice\(0, 2000\)\}`;/);
  if (!m) throw new Error("could not extract prompt from src/lib/news-ingest.ts");
  return m[0]
    .replace(/^return `/, "")
    .replace(/`;$/, "")
    .replaceAll("${defaultCategory}", "ai-models")
    .replaceAll("${title}", TITLE)
    .replaceAll("${content.slice(0, 2000)}", CONTENT);
}

const keys = (name) => (process.env[name] ?? "").split(",").map((k) => k.trim()).filter(Boolean);

const openai = (url, model, extraHeaders = {}) => async (key, prompt) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, ...extraHeaders },
    body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 2500, temperature: 0.3 }),
    signal: AbortSignal.timeout(90_000),
  });
  const body = await res.text();
  if (!res.ok) return { status: res.status, text: "", detail: body.slice(0, 140) };
  const d = JSON.parse(body);
  return { status: res.status, text: (d.choices?.[0]?.message?.content ?? "").trim(), finish: d.choices?.[0]?.finish_reason };
};

const PROVIDERS = [
  { name: "cerebras",   env: "CEREBRAS_API_KEY",   call: openai("https://api.cerebras.ai/v1/chat/completions", process.env.CEREBRAS_MODEL ?? "llama-3.3-70b") },
  { name: "zai-glm",    env: "ZAI_API_KEY",        call: openai("https://api.z.ai/api/paas/v4/chat/completions", process.env.ZAI_MODEL ?? "glm-4-flash") },
  { name: "groq",       env: "GROQ_API_KEY",       call: openai("https://api.groq.com/openai/v1/chat/completions", process.env.GROQ_MODEL ?? "openai/gpt-oss-20b") },
  { name: "mistral",    env: "MISTRAL_API_KEY",    call: openai("https://api.mistral.ai/v1/chat/completions", process.env.MISTRAL_MODEL ?? "open-mistral-nemo") },
  { name: "deepinfra",  env: "DEEPINFRA_API_KEY",  call: openai("https://api.deepinfra.com/v1/openai/chat/completions", process.env.DEEPINFRA_MODEL ?? "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo") },
  { name: "openrouter", env: "OPENROUTER_API_KEY", call: openai("https://openrouter.ai/api/v1/chat/completions", process.env.OPENROUTER_MODEL ?? "inclusionai/ling-3.0-flash-sante:free") },
  { name: "deepseek",   env: "DEEPSEEK_API_KEY",   call: openai("https://api.deepseek.com/chat/completions", process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash") },
];

// Cloudflare Workers AI: account-scoped URL, so keys pair with CLOUDFLARE_ACCOUNT_IDS.
function cloudflareJobs() {
  const ids = keys("CLOUDFLARE_ACCOUNT_IDS");
  const toks = keys("CLOUDFLARE_API_TOKENS");
  const model = process.env.CLOUDFLARE_MODEL ?? "@cf/meta/llama-3.1-8b-instruct";
  return ids.map((id, i) => ({
    name: `cloudflare[${i + 1}]`,
    key: toks[i],
    call: async (key, prompt) => {
      if (!key) return { status: 0, text: "", detail: "no matching token at this index" };
      const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/${model}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], max_tokens: 2500 }),
        signal: AbortSignal.timeout(90_000),
      });
      const body = await res.text();
      if (!res.ok) return { status: res.status, text: "", detail: body.slice(0, 140) };
      const d = JSON.parse(body);
      return { status: res.status, text: (d.result?.response ?? "").trim() };
    },
  }));
}

function grade(text) {
  const s = (text.match(/SUMMARY:\s*([\s\S]*?)(?:\s*ENTITIES:|\s*$)/) ?? [])[1]?.trim() ?? "";
  const words = s.split(/\s+/).filter(Boolean).length;
  return {
    words,
    pass: text.includes("CATEGORY:") && text.includes("ENTITIES:") && words >= 30 && words <= 90,
    bold: text.includes("**"),
    emdash: /[—–]/.test(text),
    summary: s.slice(0, 120),
  };
}

const prompt = buildPrompt();
const jobs = [
  ...PROVIDERS.flatMap((p) => {
    const ks = keys(p.env);
    if (!ks.length) return [{ name: p.name, skip: "no key set" }];
    return ks.map((k, i) => ({ name: ks.length > 1 ? `${p.name}[${i + 1}]` : p.name, key: k, call: p.call }));
  }),
  ...cloudflareJobs(),
];

console.log(`\nVerifying ${jobs.length} provider/key combinations against the live classify prompt...\n`);
let pass = 0;
for (const j of jobs) {
  if (j.skip) { console.log(`  ${j.name.padEnd(16)} SKIP   ${j.skip}`); continue; }
  const t0 = Date.now();
  try {
    const r = await j.call(j.key, prompt);
    const ms = Date.now() - t0;
    if (r.status !== 200) {
      console.log(`  ${j.name.padEnd(16)} HTTP ${String(r.status).padEnd(4)} ${((Date.now() - t0) / 1000).toFixed(1)}s  ${r.detail ?? ""}`);
      continue;
    }
    const g = grade(r.text);
    if (g.pass) pass++;
    console.log(
      `  ${j.name.padEnd(16)} ${g.pass ? "PASS" : "FAIL"}   ${(ms / 1000).toFixed(1)}s  words=${String(g.words).padEnd(3)}` +
      ` bold=${g.bold} emdash=${g.emdash}${r.finish ? ` finish=${r.finish}` : ""}`
    );
    if (g.pass) console.log(`  ${"".padEnd(16)}        "${g.summary}..."`);
  } catch (e) {
    console.log(`  ${j.name.padEnd(16)} ERROR  ${String(e.message ?? e).slice(0, 110)}`);
  }
}
console.log(`\n${pass}/${jobs.filter((j) => !j.skip).length} combinations produced a usable summary.\n`);
console.log("A non-200 is the answer, not a detail: 404 = retired/wrong model slug (fix the");
console.log("MODEL env, not the key), 402 = no balance, 401/403 = bad key, 429 with a");
console.log("x-ratelimit-limit-req-minute of 0 = that model is not on your plan at all.\n");

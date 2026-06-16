# Market Research — "Companion for people building with AI" (vibe coders)

*Source: Gemini Deep Research (web, ~June 2026) + Claude synthesis. This is the distilled, decision-relevant version; the full raw report was run in chat.*

## Verdict: WHITE SPACE IS "PARTIALLY TAKEN"
No single player owns the *holistic, trusted, proactive companion* for non-technical AI builders. But the **security wedge specifically is filling fast**, and a paid-prevention SaaS faces a brutal business reality.

## Competitive landscape (by category)
- **Security scanners (closest, reactive):** **UNPWNED** (unpwned.io, $9/mo, 700+ checks, plain-English AI fixes), **Vibe App Scanner** (vibeappscanner.com, $9–99, targets Supabase RLS / exposed keys for Lovable/Bolt/v0/Cursor). Own the "vibe-ready security" positioning but are **post-deploy/reactive**.
- **Proactive IDE hooks (technical, enterprise):** **GitGuardian ggshield AI hooks**, **Codacy Guardrails** (MCP in Cursor/Windsurf), **StepSecurity**. Real-time but require CLI/config — alienate non-technical builders.
- **Newsletters/media:** Latent Space, Towards Data Science, VibeKode, Cloudbites — static content, no utility.
- **Courses/communities:** Vibe Coding Academy, Vibecademy, Alex Finn's Skool (1,300+ members) — pedagogy, not software.
- **Directories:** Awesome Vibe Coding (GitHub). **Community:** r/vibecoding.
- **Build platforms baking security in (up-market threat):** Vercel v0 (blocked 100k+ insecure deploys natively), YouWare (native secure backends).

## Demand evidence (massive, quantified)
- r/vibecoding: **~559k weekly visitors, 17k weekly contributions.**
- **45%** of AI-generated code has vulnerabilities (Veracode); AI code **2.74×** more security vulns than human (CodeRabbit).
- Escape.tech scan of 1,400 vibe-coded prod apps: **65% had active security defects, 58% critical**, 400+ exposed secrets, 175 PII exposures.
- 100% of sampled AI-generated apps lacked CSRF/security headers.
- Real incidents: $12k OpenAI bill from unthrottled frontend loops; **CVE-2025-48757** (170+ Lovable apps shipped with no-auth API endpoints); hardcoded creds scraped within **12 minutes** of commit.

## The 4 risks (why a SaaS here is hard)
1. **Down-market landgrab** by GitGuardian/Codacy/Snyk (free dev-friendly IDE/MCP tools).
2. **Up-market absorption** — build platforms (v0, YouWare) baking security in natively → need for a separate companion shrinks.
3. **The Ignorance-Risk Paradox (the killer):** vibe coders are hyper-focused on shipping; they don't *perceive* the accumulating risk; so they **won't pay a subscription to prevent a breach they don't understand** → high CAC, low LTV, churn. *You can't sell fear-insurance to people who don't feel the fear.*
4. **Creators own distribution** — educators/communities can package security checklists/MCP servers as add-ons, cutting off a pure-software startup.

## Claude synthesis → implication for Kapyn
- **Problem: validated, huge.** ✅
- **"Security scanner SaaS": a trap.** Taken + absorbed + unsellable (paradox). ❌ Don't build this.
- **Viable path for Kapyn = the content / trust / no-paywall companion** that proactively surfaces "what you didn't know to check" (security woven in, *plus* the genuinely-unserved gaps: **multi-tool orchestration**, operational guardrails in plain English, what-changed-for-your-build). The "why it won't work" risks target a *SaaS-subscription-prevention startup* — they bind much less on a content/brand/audience play, which is Kapyn's DNA. Monetize via audience, not prevention. Lead with what builders *want* (ship fast, look capable, stay current); weave safety in.
- **Distribution answer:** become the trusted brand via content/SEO (counters "creators own distribution").

## ⚠️ Gate before committing
"White space exists" ≠ "people will use a destination over asking AI / running a $9 scanner." **Validate with ~5 real vibe coders:** *"When you build with AI, do you just ask ChatGPT / run a scanner — or would you return to a trusted place that flags what you didn't know to check?"* If they wouldn't return, rethink.

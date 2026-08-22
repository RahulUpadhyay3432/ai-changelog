// ─── India vertical ──────────────────────────────────────────────────────────
// Kapyn has ingested Indian AI news since PR #9 (Google News India query, ET CIO,
// Inc42 — see api/news/fetch/route.ts) and never written a word about it. All 45
// posts in blog-content.ts are Western-market "best X" pieces. Nobody in the
// AI-tools space covers Indian AI properly, so this is the one genuinely
// differentiated content angle available.
//
// EVERY figure here is verified against a primary or government source and
// carries its date inline. These pages will be judged on trust more than the
// listicles are, and this project has already shipped three plausible-looking
// facts that turned out wrong. Cite or cut.
//
// Sources: PIB / MeitY (IndiaAI Mission outlay, GPU count, budget split),
// Sarvam AI release notes (Feb 2026 models), Inc42 / Tracxn (funding),
// CBRE + Naukri (city AI job shares, 2026).

import type { BlogPost } from "./blog-content";

const U = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=75&auto=format&fit=crop`;

// City rows are the spine of the city posts. Each carries a genuinely distinct
// job share and specialism — these are NOT one template with the name swapped,
// which is the pattern Google's helpful-content system demotes.
export interface IndiaCity {
  slug: string;
  name: string;
  jobShare: string;
  role: string;
}

export const INDIA_CITIES: IndiaCity[] = [
  { slug: "bengaluru", name: "Bengaluru", jobShare: "25.4%", role: "Deepest talent pool and the largest concentration of global capability centres" },
  { slug: "delhi-ncr", name: "Delhi NCR", jobShare: "24.8%", role: "Governance technology, policy, and business software" },
  { slug: "mumbai", name: "Mumbai", jobShare: "19.2%", role: "Financial services, and enterprise adoption rather than model building" },
  { slug: "hyderabad", name: "Hyderabad", jobShare: "12.5%", role: "The fastest-growing GCC destination, strong in BFSI and life sciences" },
  { slug: "pune", name: "Pune", jobShare: "9.6%", role: "Industrial R&D and manufacturing-linked AI" },
  { slug: "chennai", name: "Chennai", jobShare: "6.4%", role: "SaaS heritage — the Zoho and Freshworks lineage" },
];

export const INDIA_POSTS: BlogPost[] = [
  // ─── Pillar: the ecosystem ────────────────────────────────────────────────
  {
    slug: "india-ai-startup-ecosystem-2026",
    title: "India's AI startup ecosystem in 2026: where the money is actually going",
    deck: "$1.34 billion across 66 rounds, up 143% year on year. A look at what is genuinely being built, and what is still a press release.",
    date: "2026-08-22",
    updated: "2026-08-22",
    readingMin: 9,
    tag: "India",
    hero: { src: U("1524492412937-b28074a5d7da"), alt: "Bengaluru skyline at dusk", credit: "Unsplash" },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "Indian AI companies raised **$1.34 billion across 66 rounds** in 2026 to the end of August — roughly **143% more than 2025**. That is real money by any standard, but the interesting part is not the total. It is that almost all of it clusters into three places: sovereign compute, foundational models, and vertical AI built for Indian languages and industries. Very little goes into the thin application wrappers that dominated 2024.",
      },
      {
        type: "callout",
        variant: "note",
        title: "Why this is worth watching from anywhere",
        text: "India is running the largest state-subsidised AI compute programme outside China, and open-sourcing the results under Apache 2.0. If you build with open models, what happens here affects what you can download — regardless of where you sit.",
      },
      { type: "heading", level: 2, text: "The three things capital is chasing" },
      {
        type: "paragraph",
        text: "**Sovereign compute.** The IndiaAI Mission subsidises GPU hours through empanelled private operators — Jio, Tata, Yotta, CtrlS, NxtGen — rather than building state data centres. A founder can train on subsidised hardware instead of burning venture money on cloud bills, which changes what is fundable. [We broke the mission down separately](/blog/indiaai-mission-explained-2026).",
      },
      {
        type: "paragraph",
        text: "**Foundational models.** The government empanelled 11 companies to build indigenous foundation models, then added eight more including Tech Mahindra, Fractal Analytics and BharatGen, an IIT Bombay consortium. Sarvam AI is the furthest along — [covered in detail here](/blog/sovereign-ai-india-2026).",
      },
      {
        type: "paragraph",
        text: "**Vertical AI in Indian languages.** This is the least glamorous and probably the most durable. A model that handles Hindi, Tamil, Bengali and Marathi properly is not something a US lab will prioritise, and the domestic market for it is enormous.",
      },
      { type: "heading", level: 2, text: "The gap nobody puts in the press release" },
      {
        type: "paragraph",
        text: "The IndiaAI Mission is a ₹10,372 crore programme. As of the 2026 budget analysis, **roughly ₹400 crore had actually been released**, and less than half the FY26 allocation was used. The announced number and the deployed number are very different, and any honest read of this ecosystem has to hold both.",
      },
      {
        type: "quote",
        text: "Announced outlay is a statement of intent. Released outlay is a statement of capacity. In Indian tech policy the two have historically diverged by years.",
      },
      { type: "heading", level: 2, text: "What this means if you are building" },
      {
        type: "list",
        items: [
          "**Subsidised compute is real and claimable** — it is the single biggest structural advantage of building here right now",
          "**Indian-language capability is an actual moat**, not a nice-to-have; global labs are not optimising for it",
          "**Do not plan around announced budgets.** Plan around what has been disbursed",
          "**Open weights matter more here** — Sarvam's models are Apache 2.0, so the output of public money is genuinely usable",
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "City-level detail differs sharply — Bengaluru builds, Mumbai adopts, Hyderabad is growing fastest. We covered [where India's AI work actually happens](/blog/ai-startups-in-bengaluru-2026) city by city. All figures here are as of August 2026 and sourced from PIB, Inc42 and Tracxn.",
      },
    ],
  },

  // ─── Pillar: the mission ──────────────────────────────────────────────────
  {
    slug: "indiaai-mission-explained-2026",
    title: "The IndiaAI Mission, explained: ₹10,372 crore, 38,000 GPUs, and what you can actually claim",
    deck: "India is subsidising AI compute at a scale nobody else outside China is attempting. Here is how the programme is structured and where the money has really gone.",
    date: "2026-08-22",
    updated: "2026-08-22",
    readingMin: 8,
    tag: "India",
    hero: { src: U("1558494949-ef010cbdcc31"), alt: "Server racks in a data centre", credit: "Unsplash" },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The Union Cabinet approved the IndiaAI Mission in **March 2024** with a **₹10,372 crore** outlay over five years — about $1.25 billion. Its central idea is unusual: rather than building state data centres, the government empanels private GPU operators and **subsidises the per-hour rate** paid by users. More than **38,000 GPUs** are now deployed under it.",
      },
      { type: "heading", level: 2, text: "Where the money is allocated" },
      {
        type: "list",
        items: [
          "**Compute capacity — ₹4,563.36 crore**, the largest single pillar",
          "**Foundation models — ₹1,971.37 crore**",
          "**Startup financing — ₹1,942.5 crore**",
          "The remainder covers datasets, applications, skilling and safety",
        ],
      },
      {
        type: "paragraph",
        text: "The GPUs themselves are owned by empanelled private partners — **Jio, Tata, Yotta and CtrlS** among them, with capacity from Yotta Data Services and NxtGen Cloud. The state does not own the hardware; it lowers the price you pay for it.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "The practical version for a founder",
        text: "If you are training or fine-tuning models in India, subsidised GPU hours through an empanelled provider are the concrete benefit. Not the headline crore figure — the hourly rate. That is what changes your runway.",
      },
      { type: "heading", level: 2, text: "What has actually been built" },
      {
        type: "paragraph",
        text: "**190 AI projects** have been approved across sectors. On models specifically, the ministry empanelled 11 companies to build indigenous foundation models and later added eight more, including **Tech Mahindra**, **Fractal Analytics** and **BharatGen** — an IIT Bombay consortium. The furthest along is Sarvam AI, which trained its models entirely on mission compute.",
      },
      { type: "heading", level: 2, text: "The honest caveat" },
      {
        type: "paragraph",
        text: "Against the ₹10,372 crore headline, reporting in April 2026 put actual releases at around **₹400 crore**, and budget analysis found **less than half** of the FY26 allocation was spent. The programme is real and the GPUs exist. The disbursement rate is much slower than the announcement implies, and treating the full figure as deployed capital would be a mistake.",
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "Figures verified against PIB and MeitY releases, August 2026. See also [India's AI startup ecosystem](/blog/india-ai-startup-ecosystem-2026) and [what sovereign AI means in practice](/blog/sovereign-ai-india-2026).",
      },
    ],
  },

  // ─── Pillar: sovereign AI ─────────────────────────────────────────────────
  {
    slug: "sovereign-ai-india-2026",
    title: "Sovereign AI in India: what Sarvam actually shipped",
    deck: "A government tender produced two open-weight models trained entirely on state-subsidised compute. Worth understanding whatever you think of industrial policy.",
    date: "2026-08-22",
    updated: "2026-08-22",
    readingMin: 8,
    tag: "India",
    hero: { src: U("1526379095098-d400fd0bf935"), alt: "Modular components on a workbench", credit: "Unsplash" },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "\"Sovereign AI\" usually means very little. In India's case it produced something concrete: in **February 2026**, Bengaluru-based **Sarvam AI** open-sourced two foundation models trained entirely on IndiaAI Mission compute, released under **Apache 2.0**.",
      },
      { type: "heading", level: 2, text: "What shipped" },
      {
        type: "list",
        items: [
          "**Sarvam 30B** — a 32-billion-parameter Mixture-of-Experts model, roughly 2.4B active parameters per token, 65K context",
          "**Sarvam 105B** — 106 billion parameters MoE, roughly 10B active per token, 128K context, aimed at multi-step work",
          "Both **Apache 2.0** — genuinely usable, not a research licence",
        ],
      },
      {
        type: "paragraph",
        text: "On Indian-language benchmarks the larger model performs strongly — the kind of capability global labs have little commercial reason to prioritise. That, rather than raw parameter count, is the actual point of the exercise.",
      },
      {
        type: "callout",
        variant: "note",
        title: "Read benchmark claims carefully",
        text: "Vendor-reported wins on self-selected benchmarks are marketing until independently reproduced — true of every lab, not just this one. The verifiable facts are the architecture, the context windows, the licence, and that the compute came from the mission.",
      },
      { type: "heading", level: 2, text: "Why the licence is the story" },
      {
        type: "paragraph",
        text: "Public money funded the compute, and the weights came out under Apache 2.0. Anyone can download and run them. Compare that to most state-adjacent AI spending worldwide, which produces procurement contracts rather than downloadable artefacts.",
      },
      {
        type: "paragraph",
        text: "Sarvam entered talks for a **$250 million round led by NVIDIA, Accel and HCLTech in March 2026**, at a reported **$1.5 billion** valuation. Whether state-seeded model labs can become durable businesses is genuinely unsettled — this is the clearest test case going.",
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "More on the programme behind it in [the IndiaAI Mission explained](/blog/indiaai-mission-explained-2026), and on funding patterns in [India's AI startup ecosystem](/blog/india-ai-startup-ecosystem-2026).",
      },
    ],
  },

  // ─── Pillar: tools for Indian startups ────────────────────────────────────
  {
    slug: "best-ai-tools-for-indian-startups-2026",
    title: "Best AI tools for Indian startups in 2026",
    deck: "The same tools everyone else uses, priced in dollars against a rupee runway. What actually survives that constraint.",
    date: "2026-08-22",
    updated: "2026-08-22",
    readingMin: 8,
    tag: "India",
    hero: { src: U("1518770660439-4636190af475"), alt: "Hand tools arranged on a pegboard", credit: "Unsplash" },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "Most AI tool lists are written for teams billing in dollars. A seed-stage team in Bengaluru or Pune has the same tool choices and a materially different cost calculus — a $20/month seat is a rounding error in San Francisco and a real line item at fifteen people in India.",
      },
      { type: "heading", level: 2, text: "The model layer" },
      {
        type: "paragraph",
        text: "The cheap tiers got dramatically better in 2026 and this matters more here than anywhere. **GPT-5.6 Luna** dropped 80% in price in July while keeping the full context window. **Gemini 3.7 Flash** is priced to run constantly and has a genuinely usable free tier. Both handle classification, extraction and routing perfectly well. Reserve frontier models for work that actually needs them — the [model comparison](/compare) lays out the tiers.",
      },
      {
        type: "paragraph",
        text: "**Open weights deserve a serious look here**, and not for ideological reasons. If you are training or fine-tuning, subsidised GPU hours under the IndiaAI Mission change the arithmetic — see [the mission explained](/blog/indiaai-mission-explained-2026). And Sarvam's Apache-2.0 models handle Indian languages better than anything you will rent by the token.",
      },
      { type: "heading", level: 2, text: "Building and shipping" },
      {
        type: "paragraph",
        text: "**Cursor** or **Windsurf** for editor work, **Claude Code** for tasks you hand over whole. **Supabase** for backend — the free tier carries a real product further than most people expect. **Vercel** for deployment, though watch the function-duration limits before you commit to long-running jobs.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "The cost lever nobody pulls",
        text: "Most AI spend overruns come from a model constant nobody revisits after the prototype. Audit what your code actually calls before adding tools — the cheap tiers improved so much in 2026 that many production paths are paying frontier prices for classification work.",
      },
      { type: "heading", level: 2, text: "The layer that changes output most" },
      {
        type: "paragraph",
        text: "**MCP servers** and **agent skills** move quality further than switching models does, and both are free. Start with Context7 to stop hallucinated APIs, your database's server, and one browser server — the full argument is in [best MCP servers](/blog/best-mcp-servers-2026) and [best AI skills](/blog/best-ai-skills-2026).",
      },
      {
        type: "tools",
        items: [
          { name: "Kapyn Radar", valueLine: "Curated, hand-checked catalog of the AI tools, MCP servers and skills worth using.", url: "https://kapyn.app/radar" },
          { name: "Supabase", valueLine: "Postgres, auth and storage with a free tier that carries a real product.", url: "https://supabase.com" },
          { name: "OpenRouter", valueLine: "One API across providers — switch models by config when pricing shifts.", url: "https://openrouter.ai" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "Where in India this work happens differs a lot by city — [we mapped it](/blog/ai-startups-in-bengaluru-2026). Also see [controlling AI credit burn](/blog/control-ai-credit-burn-2026).",
      },
    ],
  }
,

  // ─── City hubs ────────────────────────────────────────────────────────────
  // Six real hubs, each with a distinct job share and a distinct role. Written
  // separately on purpose: a templated loop with the city name swapped is the
  // doorway-page pattern, and would put the whole domain at risk rather than
  // just these pages. If a city has no verifiable distinct story, it gets no page.
  {
    slug: "ai-startups-in-bengaluru-2026",
    title: "AI in Bengaluru 2026: the city that builds the models",
    deck: "25.4% of India's AI jobs, 19% of its AI learners, and the only Indian city currently shipping frontier-scale open models.",
    date: "2026-08-22",
    updated: "2026-08-22",
    readingMin: 6,
    tag: "India",
    hero: { src: U("1596176530529-78163a4f7af2"), alt: "Bengaluru city view", credit: "Unsplash" },
    body: [
      { type: "paragraph", lead: true, text: "Bengaluru holds **25.4% of India's AI job openings** and about **19% of the country's AI learners** — the largest share on both counts. But the number that matters more is qualitative: it is the only Indian city currently producing frontier-scale foundation models." },
      { type: "heading", level: 2, text: "What separates it" },
      { type: "paragraph", text: "**Sarvam AI is here**, and in February 2026 it open-sourced two Apache-2.0 foundation models trained on IndiaAI Mission compute — [the full story](/blog/sovereign-ai-india-2026). No other Indian city has shipped anything comparable. Bengaluru also holds the largest concentration of global capability centres and the deepest engineering talent pool, which is why AI-led mandates land here by default." },
      { type: "heading", level: 2, text: "The honest downside" },
      { type: "paragraph", text: "Cost and churn. Bengaluru is the most expensive place in India to hire AI engineers, and Hyderabad has been **overtaking it on new GCC setups through 2025-26** on exactly that basis. If your work is delivery rather than research, you are paying a premium for an ecosystem you may not need — [Hyderabad's case](/blog/ai-startups-in-hyderabad-2026) is worth reading against this one." },
      { type: "divider" },
      { type: "paragraph", text: "Job-share figures from CBRE/Naukri analysis, 2026. See [India's AI startup ecosystem](/blog/india-ai-startup-ecosystem-2026) for the national picture." },
    ],
  },
  {
    slug: "ai-startups-in-delhi-ncr-2026",
    title: "AI in Delhi NCR 2026: where the policy is written",
    deck: "24.8% of India's AI jobs, and the only hub where proximity to government is the actual product advantage.",
    date: "2026-08-22",
    updated: "2026-08-22",
    readingMin: 6,
    tag: "India",
    hero: { src: U("1587474260584-136574528ed5"), alt: "Delhi architecture", credit: "Unsplash" },
    body: [
      { type: "paragraph", lead: true, text: "Delhi NCR carries **24.8% of India's AI job openings** — statistically neck and neck with Bengaluru. What it does with them is completely different. This is the governance-technology and business-software hub, and the only place where being near the ministry is a genuine commercial advantage." },
      { type: "heading", level: 2, text: "Why policy proximity matters here" },
      { type: "paragraph", text: "The IndiaAI Mission is administered from here. A ₹10,372 crore programme that empanels private GPU operators and approves foundation-model builders is, in practice, a procurement process — and procurement rewards proximity. If your company sells into public infrastructure, digital identity, or regulated sectors, NCR is where those conversations happen. [The mission, explained](/blog/indiaai-mission-explained-2026)." },
      { type: "heading", level: 2, text: "The honest downside" },
      { type: "paragraph", text: "Government sales cycles are long, and the disbursement record is instructive — around ₹400 crore of that ₹10,372 crore had actually been released as of April 2026. Building a company whose revenue depends on state timelines is a different risk profile from building for developers, and founders here routinely underestimate it." },
      { type: "divider" },
      { type: "paragraph", text: "Job-share figures from CBRE/Naukri analysis, 2026." },
    ],
  },
  {
    slug: "ai-startups-in-mumbai-2026",
    title: "AI in Mumbai 2026: the city that buys AI rather than builds it",
    deck: "19.2% of India's AI jobs, concentrated in financial services. The distinction that matters is adoption, not invention.",
    date: "2026-08-22",
    updated: "2026-08-22",
    readingMin: 6,
    tag: "India",
    hero: { src: U("1529253355930-ddbe423a2ac7"), alt: "Mumbai skyline", credit: "Unsplash" },
    body: [
      { type: "paragraph", lead: true, text: "Mumbai holds **19.2% of India's AI job openings**, and it is the clearest case of a city whose role is *deployment* rather than research. It is unmatched in India for financial-services capability centres, and the AI work here is overwhelmingly about putting models into regulated production." },
      { type: "heading", level: 2, text: "Why that is a real specialism" },
      { type: "paragraph", text: "Shipping a model inside a bank is a different discipline from training one. Model risk management, auditability, explaining a decision to a regulator, keeping data resident — none of it appears in a benchmark table, and all of it decides whether a system reaches production. Mumbai has more people who have actually done that than anywhere else in the country." },
      { type: "heading", level: 2, text: "The honest downside" },
      { type: "paragraph", text: "If you want to build models rather than deploy them, the talent density is in [Bengaluru](/blog/ai-startups-in-bengaluru-2026). Mumbai also carries India's highest commercial rents, which is a hard sell for a pre-revenue team that could operate anywhere." },
      { type: "divider" },
      { type: "paragraph", text: "Job-share figures from CBRE/Naukri analysis, 2026." },
    ],
  },
  {
    slug: "ai-startups-in-hyderabad-2026",
    title: "AI in Hyderabad 2026: the hub actually taking share from Bengaluru",
    deck: "12.5% of India's AI jobs but the fastest growth in new capability centres — the one genuine shift in India's AI map.",
    date: "2026-08-22",
    updated: "2026-08-22",
    readingMin: 6,
    tag: "India",
    hero: { src: U("1451187580459-43490279c0fa"), alt: "Hyderabad architecture", credit: "Unsplash" },
    body: [
      { type: "paragraph", lead: true, text: "Hyderabad holds **12.5% of India's AI job openings** — half Bengaluru's share. That undersells it. Through **2025-26 it overtook Bengaluru in new GCC setups**, which is the single clearest directional change in India's AI geography." },
      { type: "heading", level: 2, text: "Why companies are choosing it" },
      { type: "paragraph", text: "Meaningfully lower operating and salary costs than Bengaluru, without a proportionate drop in talent quality. Particular strength in **BFSI and life sciences** — pharma and healthcare data work concentrates here in a way it does not elsewhere. For a company setting up a delivery centre rather than a research lab, the arithmetic increasingly favours Hyderabad." },
      { type: "heading", level: 2, text: "The honest downside" },
      { type: "paragraph", text: "The startup ecosystem is thinner. Fewer angel investors, fewer founders who have exited, less of the informal network that makes early hiring work. You are trading ecosystem depth for cost, which suits a subsidiary far better than a seed-stage company." },
      { type: "divider" },
      { type: "paragraph", text: "GCC growth comparison and job-share figures, 2026. Read against [Bengaluru](/blog/ai-startups-in-bengaluru-2026)." },
    ],
  },
  {
    slug: "ai-startups-in-pune-2026",
    title: "AI in Pune 2026: industrial R&D, not consumer apps",
    deck: "9.6% of India's AI jobs, weighted towards manufacturing and engineering. The least glamorous hub and possibly the most defensible.",
    date: "2026-08-22",
    updated: "2026-08-22",
    readingMin: 6,
    tag: "India",
    hero: { src: U("1498050108023-c5249f4df085"), alt: "Industrial engineering workspace", credit: "Unsplash" },
    body: [
      { type: "paragraph", lead: true, text: "Pune holds **9.6% of India's AI job openings** and sits second nationally for AI talent depth. Its work skews hard towards **industrial R&D** — manufacturing, automotive, engineering services. Not the AI that gets written about, and quite possibly the AI that lasts." },
      { type: "heading", level: 2, text: "Why industrial AI is different" },
      { type: "paragraph", text: "Computer vision on a production line, predictive maintenance, quality inspection — these have measurable ROI, long contracts, and buyers who are not chasing a trend. They also demand domain knowledge that does not transfer, which is a genuine moat. A model that understands a specific manufacturing process is not something a frontier lab will replicate." },
      { type: "heading", level: 2, text: "The honest downside" },
      { type: "paragraph", text: "Slow sales cycles and hardware-coupled deployments. Industrial buyers move at the pace of capital-expenditure planning, and a pilot can take a year to become a contract. That kills startups optimising for fast growth curves." },
      { type: "divider" },
      { type: "paragraph", text: "Job-share and talent-depth figures, 2026." },
    ],
  },
  {
    slug: "ai-startups-in-chennai-2026",
    title: "AI in Chennai 2026: the SaaS lineage",
    deck: "6.4% of India's AI jobs, but home to the companies that proved Indian software could sell globally without leaving.",
    date: "2026-08-22",
    updated: "2026-08-22",
    readingMin: 6,
    tag: "India",
    hero: { src: U("1582510003544-4d00b7f74220"), alt: "Chennai cityscape", credit: "Unsplash" },
    body: [
      { type: "paragraph", lead: true, text: "Chennai holds **6.4% of India's AI job openings** — smallest of the six major hubs. Its significance is not headcount. **Zoho** and **Freshworks** both came out of here, and between them they proved an Indian company could build global software products without relocating to San Francisco." },
      { type: "heading", level: 2, text: "Why that lineage still matters" },
      { type: "paragraph", text: "Both companies were built on product discipline and capital efficiency rather than blitzscaling — Zoho famously stayed private and profitable, and built in small towns rather than metros. That culture produces a specific kind of AI company: one shipping features into existing products with real customers, rather than raising against a demo." },
      { type: "heading", level: 2, text: "The honest downside" },
      { type: "paragraph", text: "Thin venture ecosystem and a smaller AI talent pool than any other hub on this list. Chennai's strength is product companies with revenue; if you need to raise a large round quickly, you will spend a lot of time on flights to Bengaluru." },
      { type: "divider" },
      { type: "paragraph", text: "Job-share figures from CBRE/Naukri analysis, 2026. National picture in [India's AI startup ecosystem](/blog/india-ai-startup-ecosystem-2026)." },
    ],
  },
];

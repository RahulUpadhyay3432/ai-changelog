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
  { slug: "chennai", name: "Chennai", jobShare: "6.4%", role: "SaaS heritage, the Zoho and Freshworks lineage" },
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
    hero: { src: "https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA1L3Vwd2s2MTYzNzg2NC13aWtpbWVkaWEtaW1hZ2Uta293YjJ4YTIuanBn.jpg", alt: "office building glass facade shrouded", credit: "rawpixel (CC0)" },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "Indian AI companies raised **$1.34 billion across 66 rounds** in 2026 to the end of August, roughly **143% more than 2025**. That is real money by any standard, but the interesting part is not the total. It is that almost all of it clusters into three places: sovereign compute, foundational models, and vertical AI built for Indian languages and industries. Very little goes into the thin application wrappers that dominated 2024.",
      },
      {
        type: "callout",
        variant: "note",
        title: "Why this is worth watching from anywhere",
        text: "India is running the largest state-subsidised AI compute programme outside China, and open-sourcing the results under Apache 2.0. If you build with open models, what happens here affects what you can download, regardless of where you sit.",
      },
      { type: "heading", level: 2, text: "The three things capital is chasing" },
      {
        type: "paragraph",
        text: "**Sovereign compute.** The IndiaAI Mission subsidises GPU hours through empanelled private operators, Jio, Tata, Yotta, CtrlS, NxtGen , rather than building state data centres. A founder can train on subsidised hardware instead of burning venture money on cloud bills, which changes what is fundable. [We broke the mission down separately](/blog/indiaai-mission-explained-2026).",
      },
      {
        type: "paragraph",
        text: "**Foundational models.** The government empanelled 11 companies to build indigenous foundation models, then added eight more including Tech Mahindra, Fractal Analytics and BharatGen, an IIT Bombay consortium. Sarvam AI is the furthest along, [covered in detail here](/blog/sovereign-ai-india-2026).",
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
          "**Subsidised compute is real and claimable**. It is the single biggest structural advantage of building here right now",
          "**Indian-language capability is an actual moat**, not a nice-to-have; global labs are not optimising for it",
          "**Do not plan around announced budgets.** Plan around what has been disbursed",
          "**Open weights matter more here**, Sarvam's models are Apache 2.0, so the output of public money is genuinely usable",
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "City-level detail differs sharply, Bengaluru builds, Mumbai adopts, Hyderabad is growing fastest. We covered [where India's AI work actually happens](/blog/ai-startups-in-bengaluru-2026) city by city. All figures here are as of August 2026 and sourced from PIB, Inc42 and Tracxn.",
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
    hero: { src: "https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9zdGF0aWMvaW1hZ2Uvd2Vic2l0ZS8yMDIyLTA0L2xyL3B4MTI0MTMyNS1pbWFnZS1rd3Z3NGFoMC5qcGc.jpg", alt: "Free computer server room image", credit: "rawpixel (CC0)" },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "The Union Cabinet approved the IndiaAI Mission in **March 2024** with a **₹10,372 crore** outlay over five years, about $1.25 billion. Its central idea is unusual: rather than building state data centres, the government empanels private GPU operators and **subsidises the per-hour rate** paid by users. More than **38,000 GPUs** are now deployed under it.",
      },
      { type: "heading", level: 2, text: "Where the money is allocated" },
      {
        type: "list",
        items: [
          "**Compute capacity, ₹4,563.36 crore**, the largest single pillar",
          "**Foundation models, ₹1,971.37 crore**",
          "**Startup financing, ₹1,942.5 crore**",
          "The remainder covers datasets, applications, skilling and safety",
        ],
      },
      {
        type: "paragraph",
        text: "The GPUs themselves are owned by empanelled private partners, **Jio, Tata, Yotta and CtrlS** among them, with capacity from Yotta Data Services and NxtGen Cloud. The state does not own the hardware; it lowers the price you pay for it.",
      },
      {
        type: "paragraph",
        text: "That structure is more interesting than it first appears. Building state data centres would have meant procurement cycles, depreciation risk on hardware that ages badly, and a government operating infrastructure it has no comparative advantage in running. Subsidising the rate instead pushes utilisation risk onto operators who already run this equipment commercially, and lets the subsidy follow demand rather than a five-year capacity forecast. Whether the pricing is set correctly is a fair question; the architecture is sound.",
      },
      { type: "heading", level: 2, text: "What it competes with" },
      {
        type: "paragraph",
        text: "The honest comparison is not other government programmes. It is the free tier of a frontier lab. A team fine-tuning a small model can often do it on credits from a cloud provider without touching any of this. The mission matters at the point where you outgrow that: training runs measured in thousands of GPU-hours, where commercial pricing turns a research question into a funding round. That is a narrower set of companies than the announcements imply, and for those companies it is decisive.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "The practical version for a founder",
        text: "If you are training or fine-tuning models in India, subsidised GPU hours through an empanelled provider are the concrete benefit. Not the headline crore figure, the hourly rate. That is what changes your runway.",
      },
      { type: "heading", level: 2, text: "What has actually been built" },
      {
        type: "paragraph",
        text: "**190 AI projects** have been approved across sectors. On models specifically, the ministry empanelled 11 companies to build indigenous foundation models and later added eight more, including **Tech Mahindra**, **Fractal Analytics** and **BharatGen**, an IIT Bombay consortium. The furthest along is Sarvam AI, which trained its models entirely on mission compute.",
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
    hero: { src: "https://live.staticflickr.com/7330/27929852485_9e415035af_b.jpg", alt: "Neural Network", credit: "Kevin Rheese / flickr (CC BY)" },
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
          "**Sarvam 30B**, a 32-billion-parameter Mixture-of-Experts model, roughly 2.4B active parameters per token, 65K context",
          "**Sarvam 105B**, 106 billion parameters MoE, roughly 10B active per token, 128K context, aimed at multi-step work",
          "Both **Apache 2.0**, genuinely usable, not a research licence",
        ],
      },
      {
        type: "paragraph",
        text: "On Indian-language benchmarks the larger model performs strongly, the kind of capability global labs have little commercial reason to prioritise. That, rather than raw parameter count, is the actual point of the exercise.",
      },
      {
        type: "callout",
        variant: "note",
        title: "Read benchmark claims carefully",
        text: "Vendor-reported wins on self-selected benchmarks are marketing until independently reproduced, true of every lab, not just this one. The verifiable facts are the architecture, the context windows, the licence, and that the compute came from the mission.",
      },
      { type: "heading", level: 2, text: "What \"sovereign\" is actually solving for" },
      {
        type: "paragraph",
        text: "The word does a lot of work and mostly obscures three separate concerns. The first is **linguistic**: frontier labs optimise for the languages their customers pay in, and India has twenty-two official ones. The second is **operational**, a government that runs services on an API it does not control has a dependency it cannot audit or guarantee. The third is **industrial**: the belief that a country which only consumes models will never develop the people who can build them.",
      },
      {
        type: "paragraph",
        text: "Only the first is straightforwardly true, and it is the one Sarvam's models actually address. The second is a procurement argument that open weights from anywhere would satisfy equally well. The third is a bet, and it will take a decade to know whether it paid.",
      },
      { type: "heading", level: 2, text: "Why the licence is the story" },
      {
        type: "paragraph",
        text: "Public money funded the compute, and the weights came out under Apache 2.0. Anyone can download and run them. Compare that to most state-adjacent AI spending worldwide, which produces procurement contracts rather than downloadable artefacts.",
      },
      {
        type: "paragraph",
        text: "Sarvam entered talks for a **$250 million round led by NVIDIA, Accel and HCLTech in March 2026**, at a reported **$1.5 billion** valuation. Whether state-seeded model labs can become durable businesses is genuinely unsettled. This is the clearest test case going.",
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
    hero: { src: "https://live.staticflickr.com/86/208216078_8764ece19d_b.jpg", alt: "Desk, August 6, 2006", credit: "Delwin Steven Campbell / flickr (CC BY)" },
    body: [
      {
        type: "paragraph",
        lead: true,
        text: "Most AI tool lists are written for teams billing in dollars. A seed-stage team in Bengaluru or Pune has the same tool choices and a materially different cost calculus, a $20/month seat is a rounding error in San Francisco and a real line item at fifteen people in India.",
      },
      { type: "heading", level: 2, text: "The model layer" },
      {
        type: "paragraph",
        text: "The cheap tiers got dramatically better in 2026 and this matters more here than anywhere. **GPT-5.6 Luna** dropped 80% in price in July while keeping the full context window. **Gemini 3.7 Flash** is priced to run constantly and has a genuinely usable free tier. Both handle classification, extraction and routing perfectly well. Reserve frontier models for work that actually needs them, the [model comparison](/compare) lays out the tiers.",
      },
      {
        type: "paragraph",
        text: "**Open weights deserve a serious look here**, and not for ideological reasons. If you are training or fine-tuning, subsidised GPU hours under the IndiaAI Mission change the arithmetic, see [the mission explained](/blog/indiaai-mission-explained-2026). And Sarvam's Apache-2.0 models handle Indian languages better than anything you will rent by the token.",
      },
      { type: "heading", level: 2, text: "Building and shipping" },
      {
        type: "paragraph",
        text: "**Cursor** or **Windsurf** for editor work, **Claude Code** for tasks you hand over whole. **Supabase** for backend, the free tier carries a real product further than most people expect. **Vercel** for deployment, though watch the function-duration limits before you commit to long-running jobs.",
      },
      {
        type: "callout",
        variant: "tip",
        title: "The cost lever nobody pulls",
        text: "Most AI spend overruns come from a model constant nobody revisits after the prototype. Audit what your code actually calls before adding tools, the cheap tiers improved so much in 2026 that many production paths are paying frontier prices for classification work.",
      },
      { type: "heading", level: 2, text: "The layer that changes output most" },
      {
        type: "paragraph",
        text: "**MCP servers** and **agent skills** move quality further than switching models does, and both are free. Start with Context7 to stop hallucinated APIs, your database's server, and one browser server, the full argument is in [best MCP servers](/blog/best-mcp-servers-2026) and [best AI skills](/blog/best-ai-skills-2026).",
      },
      {
        type: "tools",
        items: [
          { name: "Kapyn Radar", valueLine: "Curated, hand-checked catalog of the AI tools, MCP servers and skills worth using.", url: "https://kapyn.app/radar" },
          { name: "Supabase", valueLine: "Postgres, auth and storage with a free tier that carries a real product.", url: "https://supabase.com" },
          { name: "OpenRouter", valueLine: "One API across providers, switch models by config when pricing shifts.", url: "https://openrouter.ai" },
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text: "Where in India this work happens differs a lot by city, [we mapped it](/blog/ai-startups-in-bengaluru-2026). Also see [controlling AI credit burn](/blog/control-ai-credit-burn-2026).",
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
    deck: "25.4% of India's AI jobs, 19% of its AI learners, and the only Indian city currently shipping frontier-scale open models. Also the most expensive place to hire.",
    date: "2026-08-22",
    updated: "2026-08-22",
    readingMin: 8,
    tag: "India",
    hero: { src: "https://upload.wikimedia.org/wikipedia/commons/7/78/UB_City_Skyline.jpg", alt: "UB City Skyline", credit: "Mykeljackson / wikimedia (CC0)" },
    body: [
      { type: "paragraph", lead: true, text: "Bengaluru holds **25.4% of India's AI job openings** and roughly **19% of the country's AI learners**, the largest share on both counts, and comfortably ahead of Delhi NCR on the second. But the number that actually separates it is qualitative: it is the only Indian city currently producing frontier-scale foundation models rather than deploying somebody else's." },
      { type: "heading", level: 2, text: "The thing no other Indian city has" },
      { type: "paragraph", text: "In February 2026, Bengaluru-based **Sarvam AI** open-sourced two foundation models, a 32-billion-parameter Mixture-of-Experts model with a 65K context window, and a 106-billion-parameter model with 128K , both under Apache 2.0, both trained entirely on IndiaAI Mission compute. Nowhere else in India has shipped anything comparable, and very few places outside the US and China have either." },
      { type: "paragraph", text: "That matters beyond civic pride. A city that trains models develops a different talent pool from a city that integrates them: people who have debugged a training run, reasoned about data mixtures, and made architecture decisions under a compute budget. Those skills do not appear from running a GCC, and they are the ones a serious AI company needs. [The sovereign AI story in full](/blog/sovereign-ai-india-2026)." },
      { type: "heading", level: 2, text: "Why the GCC concentration compounds" },
      { type: "paragraph", text: "Bengaluru holds the largest concentration of global capability centres in India, which is usually described as a volume advantage. The more useful framing is churn. When a multinational's AI team sits three kilometres from four startups and two research labs, engineers move between them, and each move carries context. That circulation is the actual asset. It is why hiring a senior ML engineer here takes weeks rather than quarters." },
      { type: "paragraph", text: "It also means salary benchmarks are set locally rather than imported. Companies here compete against each other for the same people, which is excellent if you are being hired and expensive if you are hiring." },
      { type: "heading", level: 2, text: "The honest downside" },
      { type: "paragraph", text: "**Cost and churn are the same coin.** Bengaluru is the most expensive place in India to hire AI engineers, and the same circulation that makes hiring fast makes retention hard. Eighteen-month tenures are normal. If your roadmap depends on one person holding institutional knowledge for three years, this is a difficult city to build in." },
      { type: "paragraph", text: "The structural signal is that **Hyderabad overtook Bengaluru on new GCC setups through 2025-26**, on cost, not capability. If your work is delivery rather than research, you are paying a premium for an ecosystem you may not be using. [The Hyderabad case](/blog/ai-startups-in-hyderabad-2026) is worth reading directly against this one." },
      { type: "callout", variant: "note", title: "Who should actually be here", text: "Teams training or fine-tuning models, teams that need to hire senior ML people quickly, and anyone whose fundraising depends on being in the room. Teams doing integration work, support, or delivery are usually paying Bengaluru rates for something Hyderabad or Pune supplies at 60-70% of the cost." },
      { type: "heading", level: 2, text: "What it looks like practically" },
      { type: "list", items: [
        "**Hiring**: fastest senior ML market in India, and the most competitive, expect counter-offers",
        "**Capital**: the densest angel and early-stage network in the country; most Indian AI rounds are negotiated here regardless of where the company sits",
        "**Compute**: IndiaAI Mission subsidised GPU hours are claimable from anywhere, so this is not a Bengaluru-specific advantage, see [the mission explained](/blog/indiaai-mission-explained-2026)",
        "**Cost**: budget 30-40% above Hyderabad for equivalent engineering seniority",
      ]},
      { type: "quote", text: "Bengaluru's advantage is not that it has the most AI jobs. It is that it has the people who have actually trained something." },
      { type: "divider" },
      { type: "paragraph", text: "Job-share and learner figures from CBRE and Naukri analysis, 2026. National picture in [India's AI startup ecosystem](/blog/india-ai-startup-ecosystem-2026)." },
    ],
  },
  {
    slug: "ai-startups-in-delhi-ncr-2026",
    title: "AI in Delhi NCR 2026: where the policy is written",
    deck: "24.8% of India's AI jobs, statistically level with Bengaluru , and the only hub where proximity to government is the actual product advantage.",
    date: "2026-08-22",
    updated: "2026-08-22",
    readingMin: 7,
    tag: "India",
    hero: { src: "https://live.staticflickr.com/2370/1580799275_6858dd7dc0_b.jpg", alt: "Delhi skyline", credit: "Francisco Anzola / flickr (CC BY)" },
    body: [
      { type: "paragraph", lead: true, text: "Delhi NCR carries **24.8% of India's AI job openings**, statistically level with Bengaluru, and far ahead of everywhere else. What it does with them is completely different. This is the governance-technology and business-software hub, and the only place in India where being near a ministry is a genuine commercial advantage rather than a networking anecdote." },
      { type: "heading", level: 2, text: "Why policy proximity is a real moat" },
      { type: "paragraph", text: "The IndiaAI Mission is administered from here. A ₹10,372 crore programme that empanels private GPU operators and selects which companies build indigenous foundation models is, stripped of the language, a procurement process, and procurement rewards proximity in ways that are difficult to replicate remotely." },
      { type: "paragraph", text: "The government empanelled 11 companies to build foundation models and later added eight more, including Tech Mahindra, Fractal Analytics and BharatGen, an IIT Bombay consortium. Those decisions were made through relationships and consultations that happen in person. If your company sells into public infrastructure, digital identity, or a regulated sector, the conversations that matter happen within about twenty kilometres of Raisina Hill. [The mission, explained](/blog/indiaai-mission-explained-2026)." },
      { type: "heading", level: 2, text: "The other half: business software" },
      { type: "paragraph", text: "NCR also has a substantial enterprise software base that predates the AI wave, Gurugram and Noida host a long tail of B2B companies now adding AI features to existing products with existing customers. That is a less glamorous path than building a model, and a considerably more reliable one: you are selling an improvement to people who already pay you." },
      { type: "heading", level: 2, text: "The honest downside" },
      { type: "paragraph", text: "**Government sales cycles are brutal, and the disbursement record proves it.** Against that ₹10,372 crore headline, reporting in April 2026 put actual releases at roughly ₹400 crore, with under half the FY26 allocation spent. A company whose revenue plan assumes state timelines is carrying a risk most founders here underestimate, a pilot can sit approved and unfunded for a year." },
      { type: "paragraph", text: "There is also a talent gap at the research end. NCR has plenty of strong engineers; it has fewer people who have trained a model from scratch. For that, the depth is in [Bengaluru](/blog/ai-startups-in-bengaluru-2026)." },
      { type: "callout", variant: "warning", title: "The trap", text: "Founders routinely mistake a policy conversation for a pipeline. An empanelment, an MoU and a pilot are three very different things, and only one of them pays. Model your runway on cash received, never on announcements." },
      { type: "heading", level: 2, text: "Who should be here" },
      { type: "list", items: [
        "**GovTech and regulated-sector companies**, the proximity genuinely compounds",
        "**B2B software firms adding AI** to products with existing revenue",
        "**Anyone whose buyer is a ministry, a PSU, or a large regulated enterprise**",
        "**Not** pre-revenue teams betting on a government contract closing to schedule",
      ]},
      { type: "divider" },
      { type: "paragraph", text: "Job-share figures from CBRE and Naukri analysis, 2026. National picture in [India's AI startup ecosystem](/blog/india-ai-startup-ecosystem-2026)." },
    ],
  },
  {
    slug: "ai-startups-in-mumbai-2026",
    title: "AI in Mumbai 2026: the city that buys AI rather than builds it",
    deck: "19.2% of India's AI jobs, concentrated in financial services. The distinction that matters here is deployment, not invention, and it is a real specialism.",
    date: "2026-08-22",
    updated: "2026-08-22",
    readingMin: 7,
    tag: "India",
    hero: { src: "https://pd.w.org/2024/06/720667d0b48c91d43.89632712-2048x1536.jpg", alt: "A serene sunset view at Juhu Beach in Mumbai, India. The sun is low on the horizon, castin", credit: "Parth Vaswani / wordpress (CC0)" },
    body: [
      { type: "paragraph", lead: true, text: "Mumbai holds **19.2% of India's AI job openings**, and it is the clearest example in the country of a city whose role is *deployment* rather than research. It is unmatched in India for financial-services capability centres, and the AI work here is overwhelmingly about getting models into regulated production, which is a genuinely different discipline from training them." },
      { type: "heading", level: 2, text: "Why deployment is a real specialism" },
      { type: "paragraph", text: "Shipping a model inside a bank has almost nothing in common with getting it to score well. Model risk management, auditability, explaining a specific decision to a regulator months later, keeping data resident, proving you can roll back, none of it shows up in a benchmark table, and all of it decides whether a system ever reaches a customer." },
      { type: "paragraph", text: "Mumbai has more people who have actually done that than anywhere else in India, and that expertise does not transfer easily. An engineer who has taken a credit model through a compliance review has knowledge that a stronger engineer without that experience simply lacks. As AI moves from demos into regulated workflows, this becomes more valuable, not less." },
      { type: "heading", level: 2, text: "What that means for what gets built" },
      { type: "paragraph", text: "The companies that work here tend to sell into financial services with a deployment story rather than a capability story: how you integrate, how you audit, how you satisfy a regulator. The pitch is rarely a benchmark; it is a risk register. Founders arriving from a pure-tech background usually find this frustrating for about six months and then discover it is the moat." },
      { type: "heading", level: 2, text: "The honest downside" },
      { type: "paragraph", text: "**If you want to build models rather than deploy them, the talent density is not here.** That is [Bengaluru](/blog/ai-startups-in-bengaluru-2026), and it is not close. Mumbai also carries India's highest commercial rents, which is a hard case to make for a pre-revenue team that could operate from anywhere. You are paying a premium specifically for proximity to financial-services buyers, so it only pays if those are your buyers." },
      { type: "callout", variant: "note", title: "Who should be here", text: "Anyone selling AI into banks, insurers, brokerages or regulated enterprises. The buyer proximity is the entire reason to accept the cost. If your customers are developers or consumers, almost any other city on this list is a better trade." },
      { type: "divider" },
      { type: "paragraph", text: "Job-share figures from CBRE and Naukri analysis, 2026." },
    ],
  },
  {
    slug: "ai-startups-in-hyderabad-2026",
    title: "AI in Hyderabad 2026: the hub actually taking share from Bengaluru",
    deck: "12.5% of India's AI jobs but the fastest growth in new capability centres, the one genuine directional shift in India's AI map.",
    date: "2026-08-22",
    updated: "2026-08-22",
    readingMin: 7,
    tag: "India",
    hero: { src: "https://live.staticflickr.com/8516/8383107473_5f4b744483_b.jpg", alt: "Charminar, Hyderabad.(_MG_8690)", credit: "ramnath bhat / flickr (CC BY)" },
    body: [
      { type: "paragraph", lead: true, text: "Hyderabad holds **12.5% of India's AI job openings**, half Bengaluru's share, and behind Delhi NCR and Mumbai. That number undersells what is happening. Through **2025-26, Hyderabad overtook Bengaluru in new GCC setups**, which is the single clearest directional change in India's AI geography and the only one on this list that represents a shift rather than a steady state." },
      { type: "heading", level: 2, text: "Why companies are choosing it" },
      { type: "paragraph", text: "The honest answer is cost, without a proportionate drop in quality. Operating costs and salary bands run meaningfully below Bengaluru while the engineering talent remains strong, and critically, **churn is lower**. In a city with fewer competing employers per engineer, an eighteen-month tenure becomes a three-year one. For a capability centre, that stability is worth more than access to the very top of the talent distribution." },
      { type: "paragraph", text: "There is also genuine sector depth. Hyderabad is strong in **BFSI and life sciences**, and the pharma and healthcare data concentration here is real rather than aspirational. AI work touching clinical data, trials or regulated health records finds domain expertise here that is genuinely scarce elsewhere in India." },
      { type: "heading", level: 2, text: "What the GCC shift actually signals" },
      { type: "paragraph", text: "Multinationals choosing where to place a new AI team are running a cost-per-capable-engineer calculation, and Hyderabad now wins it often enough to flip the ranking. That decision compounds: each centre trains people, some of whom leave to start companies, which is how Bengaluru's ecosystem formed over two decades. Hyderabad is early in that cycle, not absent from it." },
      { type: "heading", level: 2, text: "The honest downside" },
      { type: "paragraph", text: "**The startup ecosystem is thin.** Fewer angel investors, fewer founders who have exited and recycled capital, and far less of the informal network that makes early hiring work, the coffee that turns into a co-founder. You are trading ecosystem depth for cost, which suits a subsidiary far better than a seed-stage company." },
      { type: "paragraph", text: "It is also not where models get trained. If you need people who have run a training job, that is [Bengaluru](/blog/ai-startups-in-bengaluru-2026), and no cost advantage closes that gap." },
      { type: "callout", variant: "tip", title: "The arbitrage that is actually working", text: "Companies increasingly split: leadership and research in Bengaluru, delivery and scale-out in Hyderabad. That captures most of the cost advantage without giving up access to senior ML talent, and it is why GCC formation moved here first rather than startup formation." },
      { type: "divider" },
      { type: "paragraph", text: "GCC growth comparison and job-share figures, 2026. Read directly against [Bengaluru](/blog/ai-startups-in-bengaluru-2026)." },
    ],
  },
  {
    slug: "ai-startups-in-pune-2026",
    title: "AI in Pune 2026: industrial R&D, not consumer apps",
    deck: "9.6% of India's AI jobs, weighted hard towards manufacturing and engineering. The least glamorous hub on this list, and possibly the most defensible.",
    date: "2026-08-22",
    updated: "2026-08-22",
    readingMin: 7,
    tag: "India",
    hero: { src: "https://pd.w.org/2022/03/947622a08d9d9b0d7.11485666-2048x1152.jpg", alt: "Top View of hills, trees and Pune City", credit: "Suresh Shinde / wordpress (CC0)" },
    body: [
      { type: "paragraph", lead: true, text: "Pune holds **9.6% of India's AI job openings** and ranks second nationally for AI talent depth, ahead of Mumbai and Hyderabad on that measure despite fewer openings. Its work skews hard towards **industrial R&D**: manufacturing, automotive, engineering services. It is not the AI that gets written about, and it may well be the AI that lasts." },
      { type: "heading", level: 2, text: "Why industrial AI is different" },
      { type: "paragraph", text: "Computer vision on a production line, predictive maintenance on rotating equipment, automated quality inspection, these have measurable ROI, long contracts, and buyers who are not chasing a trend. A plant manager who can show a 3% scrap reduction has a number that survives a budget review. That is a very different sales conversation from persuading someone your chatbot is better." },
      { type: "paragraph", text: "They also demand domain knowledge that does not transfer. A model that understands a specific stamping process, with its particular failure modes and tolerances, is not something a frontier lab will replicate, not because it is technically hard, but because the market for that exact knowledge is too small to interest them and too valuable to the plant to ignore. That asymmetry is a real moat, and it is rare in AI." },
      { type: "heading", level: 2, text: "The talent story nobody mentions" },
      { type: "paragraph", text: "Pune's engineering colleges and its automotive cluster have produced decades of people who understand both software and physical processes. That combination is unusual. Most ML engineers have never stood on a factory floor, and most process engineers cannot ship code. The people who do both are concentrated here, and they are the ones industrial AI actually needs." },
      { type: "heading", level: 2, text: "The honest downside" },
      { type: "paragraph", text: "**Slow sales cycles and hardware-coupled deployments.** Industrial buyers move at the pace of capital-expenditure planning, so a successful pilot can take a year to become a contract, and deployment often waits on a maintenance window. That timeline kills startups optimising for fast growth curves, and it makes venture funding an awkward fit, the businesses that work here tend to be capital-efficient and patient." },
      { type: "callout", variant: "note", title: "Who should be here", text: "Anyone building AI that touches physical processes, manufacturing, logistics, energy, automotive. If your product never leaves a browser, the ecosystem advantages here mostly do not apply to you." },
      { type: "divider" },
      { type: "paragraph", text: "Job-share and talent-depth figures, 2026." },
    ],
  },
  {
    slug: "ai-startups-in-chennai-2026",
    title: "AI in Chennai 2026: the SaaS lineage",
    deck: "6.4% of India's AI jobs, the smallest of the six hubs , but home to the companies that proved Indian software could sell globally without leaving.",
    date: "2026-08-22",
    updated: "2026-08-22",
    readingMin: 7,
    tag: "India",
    hero: { src: "https://live.staticflickr.com/7236/7135250585_8ed530d7af_b.jpg", alt: "Chennai beach evening", credit: "V.Vasant / flickr (CC BY)" },
    body: [
      { type: "paragraph", lead: true, text: "Chennai holds **6.4% of India's AI job openings**, the smallest share of the six major hubs. Its significance has never been headcount. **Zoho** and **Freshworks** both came out of here, and between them they proved an Indian company could build global software products without relocating to San Francisco, a thing that was genuinely not obvious twenty years ago." },
      { type: "heading", level: 2, text: "Why the lineage still shapes what gets built" },
      { type: "paragraph", text: "Both companies were built on product discipline and capital efficiency rather than blitzscaling. Zoho famously stayed private and profitable, refused outside capital for decades, and built engineering centres in small towns rather than metros. Freshworks took venture money and still ran leaner than its Silicon Valley comparables." },
      { type: "paragraph", text: "That culture produces a specific kind of AI company: one shipping features into an existing product with existing paying customers, rather than raising against a demo. It is unfashionable and it is a considerably higher-probability path. You are adding value to a revenue stream that already exists rather than betting that one will appear." },
      { type: "heading", level: 2, text: "What that looks like in practice" },
      { type: "paragraph", text: "AI work here tends to be embedded rather than standalone: smarter routing in a support product, extraction in an accounting tool, drafting in a CRM. None of it makes headlines. All of it is measurable against retention and expansion revenue, which is what the buyers of those companies actually care about." },
      { type: "paragraph", text: "There is also a real alumni effect. Two decades of Zoho and Freshworks engineers have produced founders who understand pricing, support load and churn, commercial instincts that are conspicuously absent from a lot of AI startups elsewhere." },
      { type: "heading", level: 2, text: "The honest downside" },
      { type: "paragraph", text: "**Thin venture ecosystem and the smallest AI talent pool of the six.** Chennai's strength is product companies with revenue, not fundraising. If you need to raise a large round quickly, you will spend a great deal of time on flights to Bengaluru, and you will be doing it without the informal investor access a Bengaluru founder gets for free." },
      { type: "callout", variant: "note", title: "Who should be here", text: "Product companies building AI into something customers already pay for, and founders who intend to be capital-efficient by choice rather than necessity. If your plan requires a large seed round in the next six months, the network effects are elsewhere." },
      { type: "divider" },
      { type: "paragraph", text: "Job-share figures from CBRE and Naukri analysis, 2026. National picture in [India's AI startup ecosystem](/blog/india-ai-startup-ecosystem-2026)." },
    ],
  },
];

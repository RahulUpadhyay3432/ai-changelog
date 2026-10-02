"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronRight,
  CircleDot,
  Compass,
  ExternalLink,
  Layers3,
  Menu,
  Newspaper,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react";
import styles from "./prototype.module.css";

export type PrototypeScreen = "landing" | "today" | "radar" | "toolkit";

const SCREEN_LINKS: { screen: PrototypeScreen; label: string }[] = [
  { screen: "landing", label: "Landing" },
  { screen: "today", label: "Today" },
  { screen: "radar", label: "Radar" },
  { screen: "toolkit", label: "Toolkit" },
];

const TOPICS = ["Models", "Coding", "Open source", "MCP", "Agents"];

function ConceptRail({ current }: { current: PrototypeScreen }) {
  return (
    <nav className={styles.conceptRail} aria-label="Kapyn V2 concept screens">
      <Link href="/concepts/kapyn-v2" className={styles.conceptHome}>V2 concept</Link>
      <div className={styles.conceptLinks}>
        {SCREEN_LINKS.map(({ screen, label }) => (
          <Link
            key={screen}
            href={`/concepts/kapyn-v2/${screen}`}
            className={current === screen ? styles.conceptLinkActive : styles.conceptLink}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function BrandMark() {
  return (
    <Link href="/concepts/kapyn-v2/landing" className={styles.brandMark}>
      <span className={styles.brandSignal} aria-hidden="true" />
      kapyn
    </Link>
  );
}

function LandingHeader() {
  return (
    <header className={styles.landingHeader}>
      <BrandMark />
      <nav className={styles.landingLinks} aria-label="Prototype primary navigation">
        <Link href="/concepts/kapyn-v2/today">Today</Link>
        <Link href="/concepts/kapyn-v2/radar">Radar</Link>
        <a href="#understand">Learn</a>
      </nav>
      <div className={styles.headerActions}>
        <button className={styles.iconButton} type="button" aria-label="Search Kapyn">
          <Search size={18} strokeWidth={1.8} />
        </button>
        <Link href="/concepts/kapyn-v2/today" className={styles.primaryButton}>
          Open today <ArrowRight size={16} strokeWidth={1.8} />
        </Link>
        <button className={styles.mobileMenu} type="button" aria-label="Open navigation menu">
          <Menu size={21} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}

function SignalMap() {
  return (
    <div className={styles.signalMap} aria-label="Preview of today's Kapyn map">
      <div className={styles.mapTopline}>
        <span>Today’s map</span>
        <span className={styles.liveLabel}><span /> live</span>
      </div>
      <div className={styles.mapCanvas}>
        <svg className={styles.mapLines} viewBox="0 0 520 310" role="img" aria-label="Connections between today’s AI signals">
          <path d="M80 68 C168 68 170 146 260 146 S360 224 446 224" />
          <path d="M80 244 C168 244 166 146 260 146 S360 70 446 70" />
          <circle cx="80" cy="68" r="4" />
          <circle cx="80" cy="244" r="4" />
          <circle cx="260" cy="146" r="5" />
          <circle cx="446" cy="70" r="4" />
          <circle cx="446" cy="224" r="4" />
        </svg>
        <div className={`${styles.mapNode} ${styles.nodeA}`}><small>MODEL</small><strong>GPT-6 Astra</strong><span>computer use</span></div>
        <div className={`${styles.mapNode} ${styles.nodeB}`}><small>TOOL</small><strong>Context7</strong><span>worth using</span></div>
        <div className={`${styles.mapNode} ${styles.nodeCore}`}><small>MOVING NOW</small><strong>Agent workflows</strong><span>12 connected signals</span></div>
        <div className={`${styles.mapNode} ${styles.nodeC}`}><small>CONCEPT</small><strong>MCP</strong><span>understand it</span></div>
        <div className={`${styles.mapNode} ${styles.nodeD}`}><small>OPEN SOURCE</small><strong>LangGraph</strong><span>gaining momentum</span></div>
      </div>
      <div className={styles.mapFooter}>
        <span>5 changes worth knowing</span>
        <span>Updated 18 min ago</span>
      </div>
    </div>
  );
}

function LandingScreen() {
  return (
    <div className={styles.landingPage}>
      <LandingHeader />
      <main>
        <section className={styles.heroSection}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>For people building with AI</p>
            <h1>Know what matters.<br /><span>Keep what fits.</span></h1>
            <p className={styles.heroDeck}>
              A calm, current map of the models, tools, MCP servers and ideas worth your time,
              plus one brief on what changed and why.
            </p>
            <div className={styles.heroActions}>
              <Link href="/concepts/kapyn-v2/radar" className={styles.primaryButtonLarge}>
                Open today’s Radar <ArrowRight size={18} strokeWidth={1.8} />
              </Link>
              <Link href="/concepts/kapyn-v2/today" className={styles.textButton}>
                Read the daily brief
              </Link>
            </div>
            <div className={styles.trustLine}>
              <span><Check size={14} /> Sources visible</span>
              <span><Check size={14} /> No paid rankings</span>
              <span><Check size={14} /> No paywall</span>
            </div>
          </div>
          <SignalMap />
        </section>

        <section className={styles.proofSection}>
          <div>
            <span className={styles.proofNumber}>07</span>
            <p>signals worth knowing today</p>
          </div>
          <div>
            <span className={styles.proofNumber}>03</span>
            <p>tools moved onto the Radar</p>
          </div>
          <div>
            <span className={styles.proofNumber}>01</span>
            <p>clear brief, then you are caught up</p>
          </div>
        </section>

        <section className={styles.jobsSection} id="understand">
          <div className={styles.sectionLead}>
            <p className={styles.eyebrow}>One connected product</p>
            <h2>Signal when you’re busy.<br />Depth when you need it.</h2>
          </div>
          <div className={styles.jobsList}>
            <Link href="/concepts/kapyn-v2/today" className={styles.jobRow}>
              <span className={styles.jobIndex}>01</span>
              <span><strong>Catch up</strong><small>A five-minute brief, ranked by relevance rather than recency.</small></span>
              <ArrowRight size={19} />
            </Link>
            <Link href="/concepts/kapyn-v2/radar" className={styles.jobRow}>
              <span className={styles.jobIndex}>02</span>
              <span><strong>Decide</strong><small>See what each model or tool is actually good for before you try it.</small></span>
              <ArrowRight size={19} />
            </Link>
            <Link href="/concepts/kapyn-v2/toolkit" className={styles.jobRow}>
              <span className={styles.jobIndex}>03</span>
              <span><strong>Remember</strong><small>Save tools and ideas into a toolkit that becomes more useful over time.</small></span>
              <ArrowRight size={19} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

const APP_NAV = [
  { screen: "today" as const, label: "Today", Icon: Newspaper },
  { screen: "radar" as const, label: "Radar", Icon: Compass },
  { screen: "toolkit" as const, label: "Toolkit", Icon: Layers3 },
];

function AppShell({ screen, children }: { screen: PrototypeScreen; children: React.ReactNode }) {
  return (
    <div className={styles.appPage}>
      <aside className={styles.appSidebar}>
        <BrandMark />
        <nav aria-label="Prototype app navigation">
          {APP_NAV.map(({ screen: target, label, Icon }) => (
            <Link
              key={target}
              href={`/concepts/kapyn-v2/${target}`}
              className={screen === target ? styles.sideLinkActive : styles.sideLink}
            >
              <Icon size={18} strokeWidth={1.8} /> {label}
            </Link>
          ))}
          <a href="#learn" className={styles.sideLink}><BookOpen size={18} strokeWidth={1.8} /> Learn</a>
        </nav>
        <div className={styles.sideProfile}>
          <span>R</span>
          <div><strong>Rahul</strong><small>Builder view</small></div>
          <ChevronRight size={16} />
        </div>
      </aside>
      <div className={styles.appContent}>{children}</div>
      <nav className={styles.mobileBottomNav} aria-label="Prototype mobile navigation">
        {APP_NAV.map(({ screen: target, label, Icon }) => (
          <Link
            key={target}
            href={`/concepts/kapyn-v2/${target}`}
            className={screen === target ? styles.mobileNavActive : styles.mobileNavLink}
          >
            <Icon size={21} strokeWidth={1.8} /><span>{label}</span>
          </Link>
        ))}
        <a href="#learn" className={styles.mobileNavLink}><BookOpen size={21} strokeWidth={1.8} /><span>Learn</span></a>
        <button type="button" className={styles.mobileNavLink}><UserRound size={21} strokeWidth={1.8} /><span>Profile</span></button>
      </nav>
    </div>
  );
}

function AppHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <header className={styles.appHeader}>
      <div>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <div className={styles.appHeaderActions}>
        <button type="button" className={styles.iconButton} aria-label="Search"><Search size={18} strokeWidth={1.8} /></button>
        {action}
      </div>
    </header>
  );
}

function TopicSetup() {
  const [selected, setSelected] = useState<string[]>(["Models", "Coding", "MCP"]);
  const [complete, setComplete] = useState(false);

  const toggle = (topic: string) => {
    setSelected((current) => current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic]);
  };

  if (complete) {
    return (
      <div className={styles.setupComplete} role="status">
        <span><Check size={17} strokeWidth={2} /></span>
        <div><strong>Your brief is tuned</strong><small>{selected.join(" · ")}</small></div>
        <button type="button" onClick={() => setComplete(false)}>Edit</button>
      </div>
    );
  }

  return (
    <section className={styles.topicSetup}>
      <div className={styles.setupNumber}>01</div>
      <div className={styles.setupCopy}>
        <p className={styles.eyebrow}>Make today useful</p>
        <h2>Pick the signals you care about.</h2>
        <p>Choose at least 3. Your brief and Radar will adapt immediately.</p>
        <div className={styles.topicButtons}>
          {TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              aria-pressed={selected.includes(topic)}
              className={selected.includes(topic) ? styles.topicSelected : styles.topicButton}
              onClick={() => toggle(topic)}
            >
              {selected.includes(topic) && <Check size={14} strokeWidth={2.2} />}{topic}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        className={styles.setupAction}
        disabled={selected.length < 3}
        onClick={() => setComplete(true)}
      >
        Tune my brief <ArrowRight size={16} strokeWidth={1.8} />
      </button>
    </section>
  );
}

function TodayScreen() {
  const [saved, setSaved] = useState(false);
  return (
    <AppShell screen="today">
      <div className={styles.appInner}>
        <AppHeader eyebrow="Friday · 2 October" title="Your brief" action={<span className={styles.caughtUp}>5 signals · 4 min</span>} />
        <TopicSetup />
        <section className={styles.briefLayout}>
          <article className={styles.leadStory}>
            <div className={styles.storyVisual}>
              <div className={styles.signalRings} aria-hidden="true"><span /><span /><span /></div>
              <span className={styles.storySource}>OPENAI · 18 MIN AGO</span>
            </div>
            <div className={styles.storyBody}>
              <div className={styles.storyMeta}><span>MODEL UPDATE</span><span>1 of 5</span></div>
              <h2>GPT-6 Astra changes the useful part of computer use.</h2>
              <p>
                The important shift is not another benchmark lead. Astra can keep control of a task
                across several applications, making longer agent workflows materially more reliable.
              </p>
              <div className={styles.whyBlock}>
                <span>WHY IT MATTERS</span>
                <p>Builders can move from isolated tool calls to workflows that survive context switches.</p>
              </div>
              <div className={styles.storyActions}>
                <button type="button" onClick={() => setSaved(!saved)} aria-pressed={saved}>
                  <Bookmark size={17} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}
                </button>
                <a href="#source">Read source <ExternalLink size={15} /></a>
              </div>
            </div>
          </article>
          <aside className={styles.briefQueue}>
            <div className={styles.queueHeading}><span>Still worth knowing</span><span>04</span></div>
            {[
              ["02", "Claude Opus 5.5", "Coding · 2 min"],
              ["03", "Gemini 4 Argon", "Models · 2 min"],
              ["04", "Context7 moved up", "MCP · 1 min"],
              ["05", "LangGraph’s new runtime", "Open source · 2 min"],
            ].map(([n, title, meta]) => (
              <a href="#next" className={styles.queueRow} key={n}>
                <span>{n}</span><div><strong>{title}</strong><small>{meta}</small></div><ChevronRight size={16} />
              </a>
            ))}
            <div className={styles.finishNote}><CircleDot size={16} /> Finish these 5 and you’re caught up.</div>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}

const RADAR_ROWS = [
  { rank: "01", name: "Context7", type: "MCP server", verdict: "Worth using", signal: "+38%", reason: "Fresh docs inside your coding assistant, with almost no setup friction." },
  { rank: "02", name: "Claude Code", type: "Coding agent", verdict: "Core tool", signal: "+27%", reason: "The strongest fit for long, repository-scale implementation work." },
  { rank: "03", name: "LangGraph", type: "Open source", verdict: "Watch", signal: "+19%", reason: "Useful when an agent needs explicit state, recovery and human review." },
  { rank: "04", name: "OpenRouter", type: "Infrastructure", verdict: "Worth using", signal: "+14%", reason: "One API for routing between models when portability matters more than lock-in." },
];

function RadarScreen() {
  const [filter, setFilter] = useState("For you");
  const [saved, setSaved] = useState<string[]>([]);
  return (
    <AppShell screen="radar">
      <div className={styles.appInner}>
        <AppHeader eyebrow="Refreshed 18 minutes ago" title="What moved today" action={<button type="button" className={styles.filterButton}><SlidersHorizontal size={17} /> Filters</button>} />
        <section className={styles.radarSummary}>
          <div><strong>12</strong><span>signals moved</span></div>
          <p>Models and coding tools led today. Marketing and image tools were mostly noise.</p>
        </section>
        <div className={styles.segmentedControl} aria-label="Radar view">
          {["For you", "Models", "Developer tools", "Open source"].map((item) => (
            <button key={item} type="button" onClick={() => setFilter(item)} aria-pressed={filter === item}>{item}</button>
          ))}
        </div>
        <section className={styles.radarList}>
          <div className={styles.radarListHead}>
            <span>Rank</span><span>What moved</span><span>Kapyn’s take</span><span>7-day signal</span><span />
          </div>
          {RADAR_ROWS.map((item) => {
            const isSaved = saved.includes(item.name);
            return (
              <article className={styles.radarRow} key={item.name}>
                <span className={styles.radarRank}>{item.rank}</span>
                <div className={styles.radarIdentity}>
                  <span className={styles.toolMonogram}>{item.name.slice(0, 1)}</span>
                  <div><strong>{item.name}</strong><small>{item.type}</small></div>
                </div>
                <div className={styles.radarTake}><span>{item.verdict}</span><p>{item.reason}</p></div>
                <span className={styles.radarSignal}>{item.signal}</span>
                <button
                  type="button"
                  className={styles.saveIcon}
                  aria-label={`${isSaved ? "Remove" : "Save"} ${item.name}`}
                  aria-pressed={isSaved}
                  onClick={() => setSaved((current) => isSaved ? current.filter((name) => name !== item.name) : [...current, item.name])}
                >
                  <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                </button>
              </article>
            );
          })}
        </section>
        <div className={styles.radarFooterAction}>
          <p><strong>That’s today’s movement.</strong><span>New signals arrive as the map changes.</span></p>
          <Link href="/concepts/kapyn-v2/toolkit">View your toolkit <ArrowRight size={16} /></Link>
        </div>
      </div>
    </AppShell>
  );
}

const STARTER_STACKS = [
  { title: "Ship an AI agent", description: "A practical production stack", tools: ["Claude Code", "LangGraph", "Context7", "Sentry"] },
  { title: "RAG that stays useful", description: "Retrieve, inspect and improve", tools: ["LlamaIndex", "Qdrant", "OpenRouter", "Langfuse"] },
  { title: "Vibe-code a SaaS", description: "From idea to a working product", tools: ["Cursor", "v0", "Supabase", "Vercel"] },
];

function ToolkitScreen() {
  const [saved, setSaved] = useState<string[]>([]);
  return (
    <AppShell screen="toolkit">
      <div className={styles.appInner}>
        <AppHeader eyebrow="Your saved AI stack" title={saved.length ? "Your toolkit" : "Build your toolkit"} action={<span className={styles.caughtUp}>{saved.length} saved</span>} />
        {saved.length === 0 ? (
          <section className={styles.toolkitIntro}>
            <div>
              <p className={styles.eyebrow}>Start with a useful decision</p>
              <h2>Don’t begin with an empty box.</h2>
            </div>
            <p>Choose a proven starter stack. You can replace, remove or annotate anything after it becomes yours.</p>
          </section>
        ) : (
          <div className={styles.savedConfirmation} role="status">
            <Check size={18} /><span><strong>{saved.at(-1)} saved.</strong> Your notes and tools now live here.</span>
          </div>
        )}
        <section className={styles.stackList}>
          {STARTER_STACKS.map((stack, index) => {
            const isSaved = saved.includes(stack.title);
            return (
              <article className={styles.stackRow} key={stack.title}>
                <div className={styles.stackNumber}>0{index + 1}</div>
                <div className={styles.stackCopy}>
                  <small>{stack.description}</small>
                  <h2>{stack.title}</h2>
                  <div className={styles.stackTools}>
                    {stack.tools.map((tool) => <span key={tool}>{tool}</span>)}
                  </div>
                </div>
                <button
                  type="button"
                  className={isSaved ? styles.savedStackButton : styles.saveStackButton}
                  onClick={() => setSaved((current) => isSaved ? current.filter((name) => name !== stack.title) : [...current, stack.title])}
                >
                  {isSaved ? <><Check size={16} /> Saved</> : <>Save this stack <ArrowRight size={16} /></>}
                </button>
              </article>
            );
          })}
        </section>
        <section className={styles.toolkitPrinciple}>
          <Sparkles size={20} strokeWidth={1.7} />
          <p><strong>Your map becomes personal when you save something.</strong><span>Kapyn will use your toolkit to tune future recommendations.</span></p>
        </section>
      </div>
    </AppShell>
  );
}

export function KapynPrototype({ screen }: { screen: PrototypeScreen }) {
  return (
    <div className={styles.prototypeRoot}>
      <ConceptRail current={screen} />
      {screen === "landing" && <LandingScreen />}
      {screen === "today" && <TodayScreen />}
      {screen === "radar" && <RadarScreen />}
      {screen === "toolkit" && <ToolkitScreen />}
    </div>
  );
}

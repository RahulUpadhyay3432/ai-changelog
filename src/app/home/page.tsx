import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "./landing.module.css";
import { QRCodeBlock } from "@/components/landing/QRCodeBlock";

const geist = Geist({ subsets: ["latin"], variable: "--geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--geist-mono" });

export default function LandingPage() {
  return (
    <div className={`${geist.variable} ${geistMono.variable} ${styles.root}`}>

      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <span className={styles.wordmark}>kapyn</span>
          <Link href="https://kapyn.app" className={styles.navCta} target="_blank">
            Open App
            <span className={styles.arrowCircle}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 6.5L6.5 1.5M6.5 1.5H3M6.5 1.5V5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>

        {/* LEFT: COPY */}
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>
            <div className={styles.liveDot} />
            AI &amp; Tech Intelligence
          </div>

          <h1 className={styles.h1}>
            AI news.<br /><span className={styles.accent}>30 seconds.</span><br />Swipe done.
          </h1>

          <p className={styles.heroSub}>
            AI moves fast. A new model dropped, a startup raised $100M, and a policy changed — all since yesterday. Kapyn gives you every story that matters, distilled to 30 seconds, with AI-written analysis so you always know the real impact.
          </p>

          <div className={styles.qrSection}>
            <div className={styles.qrBox}>
              <QRCodeBlock />
            </div>
            <div>
              <div className={styles.qrLabel}>Open on your phone</div>
              <div className={styles.qrSub}>Best experienced on mobile.</div>
            </div>
          </div>
        </div>

        {/* RIGHT: PHONE */}
        <div className={styles.heroVisual}>
          <div className={styles.phoneOuter}>
            <div className={styles.phoneInner}>
              <div className={styles.phoneScreen}>
                <div className={styles.phoneIframeWrap}>
                  <iframe
                    className={styles.phoneIframe}
                    src="https://kapyn.app"
                    frameBorder="0"
                    allow="autoplay"
                    title="Kapyn app"
                  />
                </div>
              </div>
            </div>

            {/* Overlay 1: drag hint — centered, loops every 7s */}
            <div className={styles.scrollHintOverlay}>
              <div className={styles.scrollHintPill}>
                <svg className={styles.hintArrow} width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M6 2v8M3 7l3 3 3-3"/>
                </svg>
                Drag to browse
              </div>
            </div>

            {/* Overlay 2: AI insights — above Why it matters button */}
            <div className={styles.whyHintOverlay}>
              <div className={styles.scrollHintPill}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 1l1.2 3.6H11l-3 2.2 1.1 3.6L6 8.2l-3.1 2.2 1.1-3.6-3-2.2h3.8z"/>
                </svg>
                AI insights · one tap
              </div>
              <div className={styles.whyHintCaret} />
            </div>

          </div>
        </div>

      </section>

      {/* FEATURES */}
      <section className={styles.features}>
        <div className={styles.bento}>

          {/* WIDE: 30-second briefings + Why it matters demo */}
          <div className={`${styles.bentoCard} ${styles.bentoWide}`} style={{ animationDelay: "120ms" }}>
            <div className={styles.featureIconWrap}>
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="oklch(69% 0.13 255)" strokeWidth="1.4">
                <circle cx="8.5" cy="8.5" r="7"/>
                <path d="M8.5 5v3.5l2.5 1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.featureTitle}>30-second briefings</div>
            <div className={styles.featureDesc}>Every card is an AI-distilled summary: headline, context, and why it matters. No paywalled articles, no 20-minute podcasts.</div>
            <div className={styles.whyDemo}>
              <div className={styles.whyDemoLabel}>
                <div className={styles.whyDemoDot} />
                Why it matters
              </div>
              <div className={styles.whyDemoText}>
                GPT-5 puts competitive pressure on Anthropic, Google, and Mistral to accelerate their roadmaps. Every AI team needs to read this today.
              </div>
              <div className={styles.whyDemoProgress}>
                <div className={styles.whySegActive} />
                <div className={styles.whySegRest} />
                <div className={styles.whySegRest} />
              </div>
              <div className={styles.whyDemoCount}>1 of 3 key insights</div>
            </div>
          </div>

          {/* NARROW TOP: 9 categories */}
          <div className={`${styles.bentoCard} ${styles.bentoNarrow}`} style={{ animationDelay: "200ms" }}>
            <div className={styles.featureIconWrap}>
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="oklch(69% 0.13 255)" strokeWidth="1.4">
                <rect x="2" y="2" width="5.5" height="5.5" rx="1.5"/>
                <rect x="9.5" y="2" width="5.5" height="5.5" rx="1.5"/>
                <rect x="2" y="9.5" width="5.5" height="5.5" rx="1.5"/>
                <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1.5"/>
              </svg>
            </div>
            <div className={styles.featureTitle}>9 categories</div>
            <div className={styles.featureDesc}>Filter by what you care about.</div>
            <div className={styles.catGrid}>
              <span className={`${styles.catPill} ${styles.catPillHi}`}>AI Models</span>
              <span className={styles.catPill}>Funding</span>
              <span className={styles.catPill}>Policy</span>
              <span className={styles.catPill}>Dev Tools</span>
              <span className={styles.catPill}>Research</span>
              <span className={styles.catPill}>Products</span>
              <span className={styles.catPill} style={{ color: "oklch(38% 0 0)" }}>+3 more</span>
            </div>
          </div>

          {/* NARROW BOTTOM: No paywall */}
          <div className={`${styles.bentoCard} ${styles.bentoNarrow}`} style={{ animationDelay: "280ms" }}>
            <div className={styles.featureIconWrap}>
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="oklch(69% 0.13 255)" strokeWidth="1.4">
                <rect x="3" y="7.5" width="11" height="8" rx="1.5"/>
                <path d="M6 7.5V5A2.5 2.5 0 0 1 11 5" strokeLinecap="round"/>
                <path d="M8.5 11v2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className={styles.featureTitle}>No paywall, ever</div>
            <div className={styles.featureDesc}>Open the app and read. No email, no credit card.</div>
            <div className={styles.statusRow}>
              <div className={styles.statusDot} />
              <span className={styles.statusText}>Always free, always open</span>
            </div>
          </div>

        </div>
      </section>

      {/* PWA INSTALL */}
      <section className={styles.pwaSection}>
        <div className={styles.pwaCard}>
          <div>
            <div className={styles.pwaTitle}>Install as a home screen app</div>
            <div className={styles.pwaSub}>Works like native on iOS, Android, and desktop. No App Store required.</div>
          </div>
          <div className={styles.pwaBtns}>
            <Link href="https://kapyn.app" className={styles.btnGhost} target="_blank">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M7 1v8M4 6l3 3 3-3M2.5 11h9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              iOS Safari
            </Link>
            <Link href="https://kapyn.app" className={styles.btnGhost} target="_blank">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M7 1v8M4 6l3 3 3-3M2.5 11h9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Android
            </Link>
            <Link href="https://kapyn.app" className={styles.btnGhost} target="_blank">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
                <rect x="1.5" y="2.5" width="11" height="9" rx="1.5"/>
                <path d="M1.5 6h11" strokeLinecap="round"/>
              </svg>
              Desktop
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <span className={styles.footerMark}>kapyn</span>
        <span className={styles.footerNote}>kapyn.vercel.app/home</span>
      </footer>

    </div>
  );
}

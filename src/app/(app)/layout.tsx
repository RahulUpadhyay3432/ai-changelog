import { BottomNav } from "@/components/layout/BottomNav";
import { QRCodeBlock } from "@/components/landing/QRCodeBlock";
import styles from "./layout.module.css";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.outer}>

      {/* Left panel — desktop only */}
      <aside className={styles.sideLeft}>
        <div className={styles.sideWordmark}>kapyn</div>
        <p className={styles.sideTagline}>
          AI moves fast.<br />
          Every story that matters,<br />
          distilled to 30 seconds.
        </p>
        <div className={styles.sideFeatures}>
          <div className={styles.sideFeature}>
            30-second briefings
            <span className={styles.sideFeatureDot} />
          </div>
          <div className={styles.sideFeature}>
            9 topic categories
            <span className={styles.sideFeatureDot} />
          </div>
          <div className={styles.sideFeature}>
            AI-written analysis
            <span className={styles.sideFeatureDot} />
          </div>
          <div className={styles.sideFeature}>
            No paywall, ever
            <span className={styles.sideFeatureDot} />
          </div>
        </div>
      </aside>

      {/* Phone frame */}
      <div className={styles.phoneShell}>
        <div className={styles.phoneBezel}>
          <div className={styles.column}>
            <main className={styles.main}>
              {children}
            </main>
            <BottomNav />
            {/* Portal target for overlays — keeps sheets inside phone frame on desktop */}
            <div id="phone-overlay-root" style={{ position: "absolute", inset: 0, zIndex: 100, pointerEvents: "none", overflow: "hidden", borderRadius: "inherit" }} />
          </div>
        </div>
      </div>

      {/* Right panel — desktop only */}
      <aside className={styles.sideRight}>
        <div className={styles.qrWrap}>
          <QRCodeBlock />
        </div>
        <div className={styles.qrLabel}>Open on your phone</div>
        <p className={styles.qrSub}>
          Best experienced on mobile.<br />
          Scan to open instantly.
        </p>
        <span className={styles.qrUrl}>kapyn.app</span>
      </aside>

    </div>
  );
}

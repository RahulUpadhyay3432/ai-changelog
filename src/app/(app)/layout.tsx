import { BottomNav } from "@/components/layout/BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSideNav } from "./AppSideNav";
import { RadarRailPanel } from "./RadarRailPanel";
import styles from "./layout.module.css";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.outer}>

      {/* Left rail — desktop nav (≥1080px) */}
      <aside className={styles.sideLeft}>
        <AppSideNav />
      </aside>

      {/* Phone frame — the feed stays mobile-shaped */}
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

      {/* Right rail — live "On the Radar today" + Trending (≥1080px).
          Theme toggle sits top-right of the page, per convention. */}
      <aside className={styles.sideRight}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
          <ThemeToggle />
        </div>
        <RadarRailPanel />
      </aside>

    </div>
  );
}

import { BottomNav } from "@/components/layout/BottomNav";
import { CommandPalette } from "@/components/CommandPalette";
import { RadarSideNav } from "./_RadarNav";
import styles from "./layout.module.css";

export default function RadarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.outer}>
      <RadarSideNav />
      <main className={styles.main}>
        {children}
      </main>
      <div className={styles.mobileNav}>
        <BottomNav />
      </div>
      <div id="phone-overlay-root" className={styles.overlayRoot} />
      <CommandPalette />
    </div>
  );
}

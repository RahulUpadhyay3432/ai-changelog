import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "./layout.module.css";

// Nested layout for the (web) route group — sits under the root layout (html/
// body/fonts) but outside the (app) phone frame. Plain scrolling document.
export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.wordmark}>
          kapyn
        </Link>
        <nav className={styles.nav}>
          <Link href="/blog" className={styles.navLink}>
            Blog
          </Link>
          <Link href="/explore" className={styles.navLink}>
            Explore
          </Link>
          <Link
            href="/"
            className={styles.navLink}
            style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}
          >
            Open app
            <ArrowUpRight size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
          </Link>
        </nav>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <span>Kapyn — the calm intelligence layer for AI.</span>
        <span className={styles.footerDim}>
          Every story that matters, distilled to 30 seconds. No paywall, ever.
        </span>
      </footer>
    </div>
  );
}

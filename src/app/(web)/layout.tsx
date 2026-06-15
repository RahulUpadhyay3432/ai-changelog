import Link from "next/link";
import styles from "./layout.module.css";

// Nested layout for the (web) route group — sits under the root layout (html/
// body/fonts) but outside the (app) phone frame. Plain scrolling document.
export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.wordmark}>
            kapyn
          </Link>
          <nav className={styles.nav}>
            <Link href="/explore" className={styles.navLink}>
              Explore
            </Link>
            <Link href="/" className={styles.navCta}>
              Open app ↗
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>Kapyn — the calm intelligence layer for AI.</span>
          <span className={styles.footerDim}>
            Every story that matters, distilled to 30 seconds. No paywall, ever.
          </span>
        </div>
      </footer>
    </div>
  );
}

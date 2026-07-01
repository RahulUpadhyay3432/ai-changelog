import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CommandPalette } from "@/components/CommandPalette";
import { ThemeShell, ThemeToggle } from "./theme-shell";
import styles from "./layout.module.css";

// Nested layout for the (web) route group — sits under the root layout (html/
// body/fonts) but outside the (app) phone frame. ThemeShell scopes an optional
// light theme to these reading surfaces only (data-theme lives on its div).
export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeShell>
      <header className={styles.header}>
        <Link href="/" className={styles.wordmark}>
          kapyn
        </Link>
        <nav className={styles.nav}>
          <Link href="/home" className={styles.navLink}>
            Home
          </Link>
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
          <ThemeToggle />
        </nav>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <span>Kapyn — the calm intelligence layer for AI.</span>
        <span className={styles.footerDim}>
          Every story that matters, distilled to 30 seconds. No paywall, ever.
        </span>
      </footer>

      <CommandPalette />
    </ThemeShell>
  );
}

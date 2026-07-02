"use client";

import { ThemeToggle as GlobalThemeToggle } from "@/components/ThemeToggle";
import styles from "./layout.module.css";

// The theme attribute now lives on <html> (set pre-paint by the root layout's
// inline script; flipped by the global ThemeToggle), so the whole site themes
// together. This shell just provides the (web) reading-surface chrome.

export function ThemeShell({ children }: { children: React.ReactNode }) {
  return <div className={styles.shell}>{children}</div>;
}

export function ThemeToggle() {
  return <GlobalThemeToggle />;
}

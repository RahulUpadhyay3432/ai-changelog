"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import styles from "./layout.module.css";

// Theme is scoped to the (web) reading surfaces only. data-theme lives on THIS
// shell div — not <html> — so the phone feed, Radar, and landing never flip.
// The design tokens + reading palette read CSS vars (globals.css) that these
// attributes switch. Persisted in localStorage; default dark.

type Theme = "dark" | "light";
const KEY = "kapyn_web_theme";

const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

export function ThemeShell({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {}
  }, []);

  const toggle = () =>
    setTheme((t) => {
      const next: Theme = t === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(KEY, next);
      } catch {}
      return next;
    });

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      <div className={styles.shell} data-theme={theme}>
        {children}
      </div>
    </ThemeCtx.Provider>
  );
}

export function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeCtx);
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={styles.themeToggle}
    >
      {isDark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
    </button>
  );
}

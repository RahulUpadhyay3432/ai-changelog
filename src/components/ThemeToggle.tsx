"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

// Global light/dark toggle. The theme attribute lives on <html> (set pre-paint
// by the inline script in the root layout), so every surface that reads the
// --kt-* vars flips together. Persisted in localStorage; legacy key kept in
// sync so older (web)-scoped storage keeps working.
const KEY = "kapyn_theme";
const LEGACY_KEY = "kapyn_web_theme";

export function ThemeToggle() {
  // Render dark on the server + first client paint (matches the pre-paint
  // script's default), then sync to the real attribute after mount.
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    setIsDark(document.documentElement.dataset.theme !== "light");
  }, []);

  const toggle = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = "light";
    try {
      const v = nextDark ? "dark" : "light";
      localStorage.setItem(KEY, v);
      localStorage.setItem(LEGACY_KEY, v);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={!isDark}
      title={isDark ? "Light mode" : "Dark mode"}
      className="kt-theme-toggle"
      data-dark={isDark ? "true" : "false"}
    >
      <span className="kt-theme-knob" aria-hidden />
      <span className="kt-theme-icon" aria-hidden>
        <Moon size={13} strokeWidth={2} />
      </span>
      <span className="kt-theme-icon" aria-hidden>
        <Sun size={13} strokeWidth={2} />
      </span>
    </button>
  );
}

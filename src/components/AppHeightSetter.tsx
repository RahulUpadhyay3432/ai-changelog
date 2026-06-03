"use client";

import { useEffect } from "react";

/**
 * Sets --app-h CSS variable to window.innerHeight on mount and resize.
 *
 * Why: 100dvh is unreliable on iOS Safari and standalone PWA mode —
 * it can include or exclude the status bar, home indicator, and browser
 * chrome inconsistently. window.innerHeight always returns the true
 * visible height of the viewport, making it the correct basis for
 * full-screen layouts on iOS.
 *
 * Usage: replace `height: 100dvh` with `height: var(--app-h)` in CSS.
 */
export function AppHeightSetter() {
  useEffect(() => {
    const set = () => {
      document.documentElement.style.setProperty("--app-h", `${window.innerHeight}px`);
    };
    set();
    window.addEventListener("resize", set);
    // Also update on orientation change which fires before resize on iOS
    window.addEventListener("orientationchange", set);
    return () => {
      window.removeEventListener("resize", set);
      window.removeEventListener("orientationchange", set);
    };
  }, []);

  return null;
}

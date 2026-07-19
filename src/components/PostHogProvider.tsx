"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // PWA install analytics. `appinstalled` fires the install moment on Android /
    // desktop Chrome; iOS never fires it, so anyone already running standalone is
    // marked as an installed user (segmentable via the is_pwa person property).
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).standalone === true;
    posthog.setPersonProperties({ is_pwa: standalone });
    if (standalone) posthog.capture("pwa_launched_standalone");
    const onInstalled = () => posthog.capture("pwa_installed");
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

"use client";

import { useState, useEffect } from "react";
import { X, Share } from "lucide-react";
import posthog from "posthog-js";

const DISMISSED_KEY = "kapyn_aths_dismissed";

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).standalone === true
  );
}

function isSafariBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua);
}

export function AddToHomeScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isIOS() || !isSafariBrowser() || isInStandaloneMode()) return;
    try {
      if (localStorage.getItem(DISMISSED_KEY)) return;
    } catch {
      // localStorage blocked
    }
    const t = setTimeout(() => {
      setVisible(true);
      posthog.capture("pwa_banner_shown");
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setVisible(false);
    posthog.capture("pwa_banner_dismissed");
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {}
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
        left: "16px",
        right: "16px",
        zIndex: 100,
        background: "rgba(22, 21, 20, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        animation: "aths-slide-up 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: "#0E0D0C",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: "20px",
          color: "#E8E4DE",
          fontFamily: "serif",
          fontWeight: 500,
        }}
      >
        k
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: 600,
            color: "#E8E4DE",
            lineHeight: 1.3,
          }}
        >
          Add Kapyn to Home Screen
        </p>
        <p
          style={{
            margin: "3px 0 0",
            fontSize: "11.5px",
            color: "#555",
            lineHeight: 1.4,
          }}
        >
          Tap{" "}
          <Share
            size={11}
            style={{ display: "inline", verticalAlign: "middle" }}
          />{" "}
          then &ldquo;Add to Home Screen&rdquo;
        </p>
      </div>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background: "none",
          border: "none",
          padding: "4px",
          cursor: "pointer",
          color: "#404040",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <X size={16} strokeWidth={2} />
      </button>
    </div>
  );
}

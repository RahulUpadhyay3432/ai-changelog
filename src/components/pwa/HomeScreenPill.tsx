"use client";

import { useState, useEffect, useRef } from "react";
import { Share, Download } from "lucide-react";

function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

export function HomeScreenPill() {
  const [show, setShow] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isInStandaloneMode()) return;
    if (!isIOS() && !isAndroid()) return;
    setShow(true);
  }, []);

  // Close tooltip on outside tap
  useEffect(() => {
    if (!tooltipOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setTooltipOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [tooltipOpen]);

  if (!show) return null;

  const ios = isIOS();

  return (
    <div ref={tooltipRef} style={{ position: "relative" }}>
      {/* Pill button */}
      <button
        onClick={() => setTooltipOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          padding: "5px 10px",
          borderRadius: "100px",
          border: "1px solid rgba(255,255,255,0.10)",
          background: tooltipOpen
            ? "rgba(255,255,255,0.08)"
            : "rgba(255,255,255,0.04)",
          cursor: "pointer",
          fontSize: "11px",
          fontWeight: 600,
          color: "#737373",
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
          transition: "background 0.15s ease",
        }}
        aria-label="Install Kapyn as an app"
      >
        <Download size={11} strokeWidth={2.5} />
        Install App
      </button>

      {/* Instruction tooltip */}
      {tooltipOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: "220px",
            background: "rgba(22,21,20,0.98)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: "14px",
            padding: "14px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            zIndex: 200,
          }}
        >
          {/* Arrow pointing up to pill */}
          <div style={{
            position: "absolute",
            top: "-6px",
            right: "18px",
            width: "10px",
            height: "10px",
            background: "rgba(22,21,20,0.98)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRight: "none",
            borderBottom: "none",
            transform: "rotate(45deg)",
          }} />

          <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: 700, color: "#E8E4DE" }}>
            Install Kapyn on your phone
          </p>

          {ios ? (
            <ol style={{ margin: 0, padding: "0 0 0 16px", fontSize: "12px", color: "#737373", lineHeight: 1.7 }}>
              <li>Tap the <Share size={11} style={{ display: "inline", verticalAlign: "middle" }} /> <strong style={{ color: "#a3a3a3" }}>Share</strong> button in Safari</li>
              <li>Tap <strong style={{ color: "#a3a3a3" }}>"Add to Home Screen"</strong></li>
              <li>Tap <strong style={{ color: "#a3a3a3" }}>"Add"</strong>, done!</li>
            </ol>
          ) : (
            <ol style={{ margin: 0, padding: "0 0 0 16px", fontSize: "12px", color: "#737373", lineHeight: 1.7 }}>
              <li>Tap the <strong style={{ color: "#a3a3a3" }}>⋮ menu</strong> in Chrome</li>
              <li>Tap <strong style={{ color: "#a3a3a3" }}>"Add to Home screen"</strong></li>
              <li>Tap <strong style={{ color: "#a3a3a3" }}>"Add"</strong> , done!</li>
            </ol>
          )}

          <p style={{ margin: "10px 0 0", fontSize: "11px", color: "#444", lineHeight: 1.5 }}>
            Opens like a native app , no browser bar, no friction.
          </p>
        </div>
      )}
    </div>
  );
}

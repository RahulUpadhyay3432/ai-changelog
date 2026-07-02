"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import posthog from "posthog-js";

// Weekly-digest opt-in. Privacy-by-design: one field, clear purpose, easy out.
// Posts to /api/email/subscribe (rate-limited, validated, idempotent).
export function EmailCapture({ source = "web" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading" || state === "done") return;
    setState("loading");
    try {
      const res = await fetch("/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      if (res.ok) {
        setState("done");
        posthog.capture("email_subscribed", { source });
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "16px 18px",
          borderRadius: "14px",
          background: "var(--kt-accent-soft, rgba(59,130,246,0.12))",
          border: "1px solid var(--kt-accent-border, rgba(59,130,246,0.3))",
          color: "var(--kt-text-primary, #f6f4f0)",
          fontSize: "14.5px",
          fontWeight: 500,
        }}
      >
        <Check size={18} strokeWidth={2.5} style={{ color: "var(--kt-accent, #3b82f6)", flexShrink: 0 }} />
        You&apos;re in — the first weekly digest lands Monday.
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={submit} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          disabled={state === "loading"}
          style={{
            flex: "1 1 220px",
            minWidth: 0,
            padding: "12px 14px",
            borderRadius: "12px",
            border: "1px solid var(--kt-hairline, rgba(255,255,255,0.14))",
            background: "var(--kt-surface, #1b1a17)",
            color: "var(--kt-text-primary, #f6f4f0)",
            fontSize: "14.5px",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="kt-cta"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "12px 18px",
            borderRadius: "12px",
            border: "none",
            background: "var(--kt-accent, #3b82f6)",
            color: "#fff",
            fontSize: "14.5px",
            fontWeight: 600,
            cursor: state === "loading" ? "default" : "pointer",
            opacity: state === "loading" ? 0.7 : 1,
          }}
        >
          {state === "loading" ? "…" : "Get the digest"}
          {state !== "loading" && <ArrowRight size={16} strokeWidth={2.2} />}
        </button>
      </form>
      <p style={{ margin: "10px 0 0", fontSize: "12.5px", color: "var(--kt-text-muted, #9e988c)", lineHeight: 1.5 }}>
        {state === "error"
          ? "Something went wrong — please try again."
          : "One email a week. No spam. Unsubscribe anytime."}
      </p>
    </div>
  );
}

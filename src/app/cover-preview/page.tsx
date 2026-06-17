"use client";

// TEMPORARY design-vetting page (remove before merge). Renders all 9 category
// covers at card-hero proportions so they can be screenshotted and reviewed.
import {
  Brain, Terminal, GitBranch, Rocket, Telescope, Banknote, Building2, Server, Scale, Sparkles,
  type LucideIcon,
} from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

const ICON: Record<string, LucideIcon> = {
  "ai-models": Brain,
  "dev-tools": Terminal,
  "open-source": GitBranch,
  startups: Rocket,
  research: Telescope,
  "funding-ma": Banknote,
  "big-tech": Building2,
  infrastructure: Server,
  policy: Scale,
};

export default function CoverPreview() {
  return (
    <div style={{ background: "#0a0a0a", minHeight: "100dvh", padding: "20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {CATEGORIES.map((cat) => {
          const Icon = ICON[cat.slug] ?? Sparkles;
          return (
            <div key={cat.slug}>
              <div style={{ position: "relative", height: "150px", borderRadius: "12px", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 60% 38%, ${cat.colorAccent}55 0%, ${cat.colorBg} 70%)` }} />
                <div style={{ position: "absolute", top: "18%", left: "50%", transform: "translate(-50%,-50%)", width: "200px", height: "200px", borderRadius: "50%", background: `radial-gradient(circle, ${cat.colorAccent}45 0%, transparent 70%)`, filter: "blur(48px)" }} />
                <div style={{ position: "absolute", right: "18px", top: "50%", transform: "translateY(-50%)", opacity: 0.16, display: "flex" }}>
                  <Icon size={104} strokeWidth={1.3} color={cat.colorLabel} />
                </div>
              </div>
              <p style={{ color: "#888", fontSize: "12px", margin: "6px 0 0", fontWeight: 600 }}>{cat.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

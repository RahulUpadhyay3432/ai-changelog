"use client";

import { useEffect, useRef, useId } from "react";

export function MermaidDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "d");

  useEffect(() => {
    let cancelled = false;
    import("mermaid").then((mod) => {
      if (cancelled) return;
      mod.default.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: {
          primaryColor: "#1c1c1c",
          primaryTextColor: "#e5e5e5",
          primaryBorderColor: "#333",
          lineColor: "#555",
          secondaryColor: "#111",
          tertiaryColor: "#181818",
          background: "#0a0a0a",
          mainBkg: "#161616",
          nodeBorder: "#444",
          clusterBkg: "#111",
          titleColor: "#e5e5e5",
          edgeLabelBackground: "#111",
          fontFamily: "system-ui, sans-serif",
        },
      });
      mod.default.render(uid, chart).then(({ svg }) => {
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      }).catch(() => {
        if (!cancelled && ref.current) ref.current.textContent = chart;
      });
    });
    return () => { cancelled = true; };
  }, [chart, uid]);

  return (
    <div
      ref={ref}
      aria-label="Architecture diagram"
      style={{
        background: "#111",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        padding: "24px 16px",
        margin: "18px 0 10px",
        overflowX: "auto",
        minHeight: "80px",
      }}
    />
  );
}

"use client";

import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import {
  MODELS,
  CATEGORY_LABELS,
  PRICE_TIER_LABEL,
  formatContext,
  type ModelCategory,
} from "@/lib/models";
import { GOLD, GOLD_SOFT, GOLD_BORDER, SG, TEXT, SURFACE, SURFACE_RAISED, HAIRLINE } from "@/lib/design-tokens";
import styles from "./compare.module.css";

const FILTERS: { key: ModelCategory | "all"; label: string }[] = [
  { key: "all", label: "All models" },
  { key: "frontier", label: "Frontier" },
  { key: "balanced", label: "Balanced" },
  { key: "efficient", label: "Fast & cheap" },
  { key: "reasoning", label: "Reasoning" },
  { key: "open", label: "Open weights" },
];

function CategoryTag({ category }: { category: ModelCategory }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: SG,
        fontSize: "10.5px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: GOLD,
        background: GOLD_SOFT,
        border: `1px solid ${GOLD_BORDER}`,
        borderRadius: "100px",
        padding: "2px 9px",
      }}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}

export function CompareClient({ embed = false }: { embed?: boolean }) {
  const [active, setActive] = useState<ModelCategory | "all">("all");

  const rows = active === "all" ? MODELS : MODELS.filter((m) => m.category === active);

  return (
    <div className={embed ? styles.embedWrap : undefined}>
      {/* Filter chips */}
      <div className={styles.filterRow}>
        {FILTERS.map((f) => {
          const on = active === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setActive(f.key)}
              className={styles.chip}
              style={{
                fontFamily: SG,
                color: on ? "#fff" : TEXT.muted,
                background: on ? GOLD : "transparent",
                border: `1px solid ${on ? GOLD : HAIRLINE}`,
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ fontFamily: SG }}>Model</th>
              <th style={{ fontFamily: SG }}>Type</th>
              <th style={{ fontFamily: SG }}>Context</th>
              <th style={{ fontFamily: SG }}>Cost</th>
              <th style={{ fontFamily: SG }}>Modalities</th>
              <th style={{ fontFamily: SG }}>Open</th>
              <th style={{ fontFamily: SG }}>Best for</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id}>
                <td>
                  <a href={m.providerUrl} target="_blank" rel="noopener noreferrer" className={styles.modelLink} style={{ fontFamily: SG }}>
                    {m.name}
                    <ArrowUpRight size={12} strokeWidth={2.2} style={{ flexShrink: 0, opacity: 0.6 }} />
                  </a>
                  <span className={styles.provider}>{m.provider}</span>
                </td>
                <td><CategoryTag category={m.category} /></td>
                <td style={{ fontFamily: SG, color: TEXT.body, whiteSpace: "nowrap" }}>{formatContext(m.contextK)}</td>
                <td>
                  <span title={PRICE_TIER_LABEL[m.priceTier]} style={{ fontFamily: SG, color: m.priceTier === "free" ? GOLD : TEXT.body }}>
                    {m.priceTier === "free" ? "Free tier" : m.priceTier}
                  </span>
                </td>
                <td style={{ color: TEXT.muted, fontSize: "12.5px", textTransform: "capitalize" }}>{m.modalities.join(", ")}</td>
                <td>{m.openWeights ? <Check size={15} strokeWidth={2.5} style={{ color: GOLD }} /> : <span style={{ color: "#5a564f" }}>—</span>}</td>
                <td style={{ color: TEXT.muted, fontSize: "12.5px", maxWidth: "260px" }}>{m.bestFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className={styles.cardList}>
        {rows.map((m) => (
          <div key={m.id} className={styles.card} style={{ background: SURFACE, border: `1px solid ${HAIRLINE}` }}>
            <div className={styles.cardHead}>
              <a href={m.providerUrl} target="_blank" rel="noopener noreferrer" className={styles.modelLink} style={{ fontFamily: SG, fontSize: "16px" }}>
                {m.name}
                <ArrowUpRight size={13} strokeWidth={2.2} style={{ flexShrink: 0, opacity: 0.6 }} />
              </a>
              <CategoryTag category={m.category} />
            </div>
            <p style={{ color: TEXT.muted, fontSize: "13px", lineHeight: 1.5, margin: "8px 0 12px" }}>{m.bestFor}</p>
            <div className={styles.specRow}>
              <span style={{ background: SURFACE_RAISED }} className={styles.spec}>Context {formatContext(m.contextK)}</span>
              <span style={{ background: SURFACE_RAISED }} className={styles.spec}>
                {m.priceTier === "free" ? "Free tier" : `Cost ${m.priceTier}`}
              </span>
              <span style={{ background: SURFACE_RAISED, textTransform: "capitalize" }} className={styles.spec}>{m.modalities.join(" · ")}</span>
              {m.openWeights && <span style={{ background: GOLD_SOFT, color: GOLD, border: `1px solid ${GOLD_BORDER}` }} className={styles.spec}>Open weights</span>}
            </div>
          </div>
        ))}
      </div>

      {embed && (
        <a href="https://kapyn.app/compare" target="_blank" rel="noopener noreferrer" className={styles.embedCredit} style={{ fontFamily: SG }}>
          AI model comparison by Kapyn →
        </a>
      )}
    </div>
  );
}

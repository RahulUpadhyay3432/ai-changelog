"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight, Search } from "lucide-react";
import { GOLD, HAIRLINE, TEXT, SG } from "@/lib/design-tokens";
import { ThemeToggle } from "@/components/ThemeToggle";
import styles from "./landing.module.css";

// Top-nav for the landing. Tabs link out to the real product surfaces (UX +
// SEO internal-linking). "Skills" opens the Skills view of the MCP market;
// "Learn" points at /explore until the blog ships in Phase 2 (then → /blog).
const TABS: { label: string; href: string }[] = [
  { label: "Feed", href: "/?app=1" },
  { label: "Radar", href: "/radar" },
  { label: "Pulse", href: "/radar/pulse" },
  { label: "Tools & Agents", href: "/radar/browse" },
  { label: "Skills", href: "/radar/mcp?tab=skills" },
  { label: "MCP", href: "/radar/mcp" },
  { label: "Hackathons", href: "/radar/hackathons" },
  { label: "Blog", href: "/blog" },
  { label: "Learn", href: "/explore" },
];

export function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close the mobile sheet on Esc and on outside tap.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onClick = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onClick);
    };
  }, [open]);

  const isActive = (href: string) => href.split("?")[0] === pathname;

  return (
    <nav className={styles.nav} aria-label="Primary">
      <div className={styles.navInner}>
        <Link
          href="/home"
          style={{ fontFamily: SG, fontSize: "19px", fontWeight: 700, letterSpacing: "-0.04em", color: TEXT.primary, textDecoration: "none" }}
        >
          kapyn
        </Link>

        <div className={styles.navTabs}>
          {TABS.map((t) => {
            const active = isActive(t.href);
            return (
              <Link
                key={t.label}
                href={t.href}
                style={{
                  fontFamily: SG,
                  fontSize: "14px",
                  fontWeight: active ? 600 : 500,
                  color: active ? TEXT.primary : TEXT.muted,
                  textDecoration: "none",
                  padding: "8px 11px",
                  borderRadius: "8px",
                  borderBottom: active ? `2px solid ${GOLD}` : "2px solid transparent",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s ease",
                }}
              >
                {t.label}
              </Link>
            );
          })}
        </div>

        {/* Search icon */}
        <Link
          href="/search"
          aria-label="Search"
          style={{
            marginLeft: "auto",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            border: `1px solid ${HAIRLINE}`,
            color: TEXT.muted,
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <Search size={16} strokeWidth={2} />
        </Link>

        <ThemeToggle />

        {/* Desktop "Open" pill */}
        <Link
          href="/?app=1"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontFamily: SG,
            fontSize: "14px",
            fontWeight: 600,
            color: "#ffffff",
            background: GOLD,
            border: "none",
            borderRadius: "100px",
            padding: "8px 16px",
            textDecoration: "none",
          }}
        >
          Open <ArrowUpRight size={15} strokeWidth={2.4} />
        </Link>

        <button
          className={styles.hamburger}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
        </button>
      </div>

      {open && (
        <div className={styles.mobileSheet} ref={sheetRef}>
          {TABS.map((t) => (
            <Link
              key={t.label}
              href={t.href}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                fontFamily: SG,
                fontSize: "16px",
                fontWeight: 600,
                color: isActive(t.href) ? GOLD : TEXT.body,
                textDecoration: "none",
                padding: "12px 4px",
                borderBottom: `1px solid ${HAIRLINE}`,
              }}
            >
              {t.label}
            </Link>
          ))}
          <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap", alignItems: "center" }}>
            <ThemeToggle />
            <Link
              href="/search"
              onClick={() => setOpen(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: SG,
                fontSize: "15px",
                fontWeight: 600,
                color: TEXT.body,
                border: `1px solid ${HAIRLINE}`,
                borderRadius: "100px",
                padding: "10px 18px",
                textDecoration: "none",
              }}
            >
              <Search size={15} strokeWidth={2} /> Search
            </Link>
            <Link
              href="/?app=1"
              onClick={() => setOpen(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: SG,
                fontSize: "15px",
                fontWeight: 600,
                color: "#ffffff",
                background: GOLD,
                borderRadius: "100px",
                padding: "10px 18px",
                textDecoration: "none",
              }}
            >
              Open the app <ArrowUpRight size={16} strokeWidth={2.4} />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

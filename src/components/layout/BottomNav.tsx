"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid2x2, TrendingUp, Bookmark, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/categories", label: "Categories", Icon: Grid2x2 },
  { href: "/trending", label: "Trending", Icon: TrendingUp },
  { href: "/saved", label: "Saved", Icon: Bookmark },
  { href: "/profile", label: "Profile", Icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "60px",
        background: "rgba(10, 10, 10, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        zIndex: 50,
      }}
    >
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              padding: "8px 16px",
              color: active ? "#f5f5f5" : "#525252",
              textDecoration: "none",
              transition: "color 150ms",
            }}
          >
            <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            <span
              style={{
                fontSize: "10px",
                fontWeight: active ? 600 : 400,
                letterSpacing: "0.01em",
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

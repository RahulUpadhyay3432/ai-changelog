import { SOCIAL_PROFILES } from "@/lib/site";
import { HAIRLINE, TEXT } from "@/lib/design-tokens";

// Brand marks are inline SVG on purpose: lucide-react dropped its brand icons in
// v1 (Instagram/Facebook/Twitter are no longer exported, and the `X` it does
// export is the close-cross, not the logo). These are the official marks, single
// path each, inheriting currentColor so they follow the theme.
const PATHS: Record<string, string> = {
  Instagram:
    "M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.6.22 1 .5 1.5.94.44.44.72.9.94 1.5.17.4.36 1 .42 2.2.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.25 1.8-.42 2.2a4 4 0 0 1-.94 1.5c-.44.44-.9.72-1.5.94-.4.17-1 .36-2.2.42-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-1.8-.25-2.2-.42a4 4 0 0 1-1.5-.94 4 4 0 0 1-.94-1.5c-.17-.4-.36-1-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.25-1.8.42-2.2.22-.6.5-1.06.94-1.5.44-.44.9-.72 1.5-.94.4-.17 1-.36 2.2-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.8.07-1 .04-1.5.2-1.8.32-.4.15-.6.3-.9.6-.3.3-.45.5-.6.9-.12.3-.28.8-.32 1.8C3.5 8.5 3.5 8.9 3.5 12s0 3.5.07 4.8c.04 1 .2 1.5.32 1.8.15.4.3.6.6.9.3.3.5.45.9.6.3.12.8.28 1.8.32 1.3.07 1.7.07 4.8.07s3.5 0 4.8-.07c1-.04 1.5-.2 1.8-.32.4-.15.6-.3.9-.6.3-.3.45-.5.6-.9.12-.3.28-.8.32-1.8.07-1.3.07-1.7.07-4.8s0-3.5-.07-4.8c-.04-1-.2-1.5-.32-1.8a2.4 2.4 0 0 0-.6-.9 2.4 2.4 0 0 0-.9-.6c-.3-.12-.8-.28-1.8-.32C15.5 4 15.1 4 12 4Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Zm5.1-2.1a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z",
  X: "M17.53 3h3.1l-6.77 7.74L21.75 21h-5.9l-4.3-5.62L6.6 21H3.5l7.03-8.04L2.75 3h5.9l4.07 5.38L17.53 3Zm-1.1 16.2h1.72L7.06 4.72H5.22l11.21 14.48Z",
  Facebook:
    "M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.25 10.44 22v-7.03H7.9v-2.91h2.54v-2.2c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.91h-2.33V22C18.34 21.25 22 17.08 22 12.06Z",
};

/**
 * The official profile links, rendered once and shared by both footers (the
 * landing page's column grid and the (web) reading layout's tagline footer),
 * which are otherwise two unrelated designs.
 *
 * `rel="me"` is what lets each platform's profile link back and corroborate that
 * these accounts belong to the same entity as the Organization in the JSON-LD.
 */
export function SocialRow({ align = "start" }: { align?: "start" | "center" }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        justifyContent: align === "center" ? "center" : "flex-start",
      }}
    >
      {SOCIAL_PROFILES.map((p) => (
        <a
          key={p.name}
          href={p.url}
          target="_blank"
          rel="me noopener noreferrer"
          aria-label={`Kapyn on ${p.name}`}
          title={`Kapyn on ${p.name}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "34px",
            height: "34px",
            borderRadius: "9px",
            border: `1px solid ${HAIRLINE}`,
            color: TEXT.muted,
            textDecoration: "none",
          }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path d={PATHS[p.name]} />
          </svg>
        </a>
      ))}
    </div>
  );
}

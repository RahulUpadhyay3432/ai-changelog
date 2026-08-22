// SSRF guard for server-side fetches of third-party URLs (RSS item links, OG
// image lookups, etc.). Blocks non-http(s) schemes and hostnames that resolve to
// private, loopback, link-local or carrier-grade-NAT space.
//
// Not DNS-rebinding-proof — it does not resolve hostnames — but it stops the
// direct "put an internal address in a feed item" vector without breaking the
// many legitimate publisher redirects a news pipeline relies on.
//
// ⚠️  The previous version matched IPv6 by string prefix (`startsWith("fc")`),
// which let `::ffff:169.254.169.254` through — the IPv4-mapped form of the cloud
// metadata endpoint. Parse, don't prefix-match. Callers that follow redirects
// must re-check EVERY hop (see fetchPageMeta), because a public URL can 302 to
// an internal one.

const BLOCKED_HOST_PATTERNS: RegExp[] = [
  /^localhost$/i,
  /\.local$/i,
  /\.internal$/i,
  /(^|\.)metadata\.google\.internal$/i,
];

/** True for any IPv4 address we must never fetch. */
function isPrivateIpv4(a: number, b: number): boolean {
  if (a === 0) return true;                       // 0.0.0.0/8 "this host"
  if (a === 10) return true;                      // 10.0.0.0/8 private
  if (a === 127) return true;                     // 127.0.0.0/8 loopback
  if (a === 169 && b === 254) return true;        // 169.254.0.0/16 link-local (cloud metadata)
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 private
  if (a === 192 && b === 168) return true;        // 192.168.0.0/16 private
  if (a === 192 && b === 0) return true;          // 192.0.0.0/24 IETF protocol assignments
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 carrier-grade NAT
  if (a === 198 && (b === 18 || b === 19)) return true; // 198.18.0.0/15 benchmarking
  if (a >= 224) return true;                      // multicast + reserved (224.0.0.0/3)
  return false;
}

/**
 * Parse a hostname as an IPv4 literal.
 *
 * `new URL()` accepts non-decimal forms — 2852039166, 0xA9FE.A9FE, 0251.0376.…
 * all resolve to 169.254.169.254 — so a dotted-decimal-only regex is not enough.
 * Anything that looks numeric but is not plain dotted-decimal is rejected
 * outright rather than decoded: no legitimate publisher URL uses those forms.
 */
function parseIpv4(host: string): { a: number; b: number } | null {
  const dotted = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (dotted) {
    const parts = dotted.slice(1).map(Number);
    if (parts.some((p) => p > 255)) return null; // not a valid v4 literal
    return { a: parts[0], b: parts[1] };
  }
  return null;
}

/** Bare integer / hex / octal hostnames — always refused. */
function isNumericHostEncoding(host: string): boolean {
  if (/^\d+$/.test(host)) return true;                 // 2852039166
  if (/^0[xX][0-9a-fA-F]+$/.test(host)) return true;   // 0xA9FEA9FE
  // Dotted forms with a leading zero (octal) or hex components.
  if (/^(0\d+|0[xX][0-9a-fA-F]+)(\.|$)/.test(host)) return true;
  return false;
}

function isPrivateIpLiteral(host: string): boolean {
  const v4 = parseIpv4(host);
  if (v4) return isPrivateIpv4(v4.a, v4.b);
  if (isNumericHostEncoding(host)) return true;

  // IPv6 (brackets already stripped by URL.hostname for literals).
  const h = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (!h.includes(":")) return false; // not an IP literal at all

  if (h === "::" || h === "::1") return true; // unspecified / loopback

  // IPv4-mapped forms. Note WHATWG URL normalises the dotted spelling into hex
  // quads: `::ffff:169.254.169.254` arrives as `::ffff:a9fe:a9fe`. Matching only
  // the dotted form is exactly how the metadata endpoint slipped through before.
  const dottedMapped = h.match(/^::(?:ffff:)?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (dottedMapped) {
    const v = parseIpv4(dottedMapped[1]);
    return v ? isPrivateIpv4(v.a, v.b) : true; // unparseable → refuse
  }
  const hexMapped = h.match(/^::(?:ffff:)?([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hexMapped) {
    const hi = parseInt(hexMapped[1], 16);
    const lo = parseInt(hexMapped[2], 16);
    if (Number.isNaN(hi) || Number.isNaN(lo)) return true;
    // hi holds the first two octets, lo the last two.
    return isPrivateIpv4((hi >> 8) & 0xff, hi & 0xff);
  }

  const head = parseInt(h.split(":")[0] || "0", 16);
  if (Number.isNaN(head)) return true;              // malformed → refuse
  if ((head & 0xfe00) === 0xfc00) return true;      // fc00::/7 unique-local
  if ((head & 0xffc0) === 0xfe80) return true;      // fe80::/10 link-local
  return false;
}

export function isSafePublicUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  const host = u.hostname;
  if (!host) return false;
  if (isPrivateIpLiteral(host)) return false;
  if (BLOCKED_HOST_PATTERNS.some((re) => re.test(host))) return false;
  return true;
}

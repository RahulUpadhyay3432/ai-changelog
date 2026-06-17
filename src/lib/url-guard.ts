// SSRF guard for server-side fetches of third-party URLs (RSS item links, etc.).
// Blocks non-http(s) schemes and hostnames that are private/loopback/link-local
// IP literals or internal/metadata names — the direct "put an internal URL in a
// feed item" vector. Not DNS-rebinding-proof (it doesn't resolve hostnames), but
// it stops the obvious internal-address + scheme attacks without breaking the
// many legitimate publisher redirects a news pipeline relies on.

const BLOCKED_HOST_PATTERNS: RegExp[] = [
  /^localhost$/i,
  /\.local$/i,
  /\.internal$/i,
  /(^|\.)metadata\.google\.internal$/i,
];

function isPrivateIpLiteral(host: string): boolean {
  const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const a = Number(v4[1]);
    const b = Number(v4[2]);
    if (a === 0 || a === 10 || a === 127) return true; // this-host / private / loopback
    if (a === 169 && b === 254) return true; // link-local (cloud metadata 169.254.169.254)
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    return false;
  }
  const h = host.replace(/^\[|\]$/g, "").toLowerCase(); // strip IPv6 brackets
  return h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80");
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

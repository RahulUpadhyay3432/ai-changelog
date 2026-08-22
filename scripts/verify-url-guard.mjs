#!/usr/bin/env node
// Regression suite for src/lib/url-guard.ts.
//
// This exists because the guard shipped with a bypass that looked fine on
// inspection: it matched IPv6 by string prefix (`startsWith("fc")`), so
// ::ffff:169.254.169.254 — the IPv4-mapped form of the cloud metadata endpoint —
// sailed straight through. WHATWG URL also normalises that spelling into hex
// quads (::ffff:a9fe:a9fe), which defeated the first attempt at a fix too.
//
// Run after touching url-guard.ts:  node scripts/verify-url-guard.mjs
// Requires tsx:                     npx tsx scripts/verify-url-guard.mjs

import { isSafePublicUrl } from "../src/lib/url-guard.ts";

const MUST_BLOCK = [
  // IPv4-mapped IPv6 — the original bypass, in both spellings
  "http://[::ffff:169.254.169.254]/", "http://[::ffff:127.0.0.1]/", "http://[::ffff:10.0.0.1]/",
  // Cloud metadata, direct
  "http://169.254.169.254/latest/meta-data/",
  // Alternate encodings of the same address
  "http://2852039166/", "http://0xA9FEA9FE/",
  // IPv6 private / loopback / unspecified
  "http://[fc00::1]/", "http://[fd12:3456::1]/", "http://[fe80::1]/", "http://[::1]/", "http://[::]/",
  // IPv4 private and reserved ranges
  "http://10.0.0.1/", "http://127.0.0.1:8080/", "http://172.16.0.1/", "http://192.168.1.1/",
  "http://0.0.0.0/", "http://100.64.0.1/", "http://198.18.0.1/", "http://192.0.0.1/",
  "http://239.255.255.250/",
  // Internal names and non-http schemes
  "http://localhost/", "http://metadata.google.internal/", "http://foo.internal/",
  "file:///etc/passwd", "gopher://x/", "javascript:alert(1)",
];

const MUST_ALLOW = [
  "https://techcrunch.com/feed/", "http://example.com/a?b=c",
  "https://github.com/upstash/context7", "https://8.8.8.8/", "https://1.1.1.1/",
  "https://images.unsplash.com/photo-1", "https://sub.domain.co.uk/x",
  "https://[2606:4700::1111]/", "https://fcm.googleapis.com/fcm/send/abc",
];

let failures = 0;
for (const u of MUST_BLOCK) {
  if (isSafePublicUrl(u)) { console.error(`  LEAK   ${u}`); failures++; }
}
for (const u of MUST_ALLOW) {
  if (!isSafePublicUrl(u)) { console.error(`  BROKE  ${u}`); failures++; }
}

console.log(
  failures === 0
    ? `\n  PASS — ${MUST_BLOCK.length} blocked, ${MUST_ALLOW.length} allowed`
    : `\n  ${failures} FAILURE(S)`
);
process.exit(failures ? 1 : 0);

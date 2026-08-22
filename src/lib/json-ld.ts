/**
 * Serialise a JSON-LD object for injection into a <script type="application/ld+json"> tag.
 *
 * `JSON.stringify` does NOT escape `<`, so a string containing `</script>` ends
 * the block early and everything after it is parsed as HTML. Our structured data
 * embeds tool names and descriptions that originate from GitHub, Product Hunt and
 * RSS feeds, so those strings are not ours to trust.
 *
 * Escaping `<` as `<` is valid JSON, parses identically, and makes the
 * sequence impossible to form. Use this everywhere instead of raw JSON.stringify.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

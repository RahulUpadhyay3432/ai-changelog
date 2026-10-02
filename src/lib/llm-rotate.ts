// Shared key rotation for every multi-key LLM provider.
//
// Written after an audit on 2026-10-02 found that ONE bad key could take down an
// entire provider. Each provider's attempt() threw on any non-retryable status,
// the throw escaped the rotation loop uncaught, and classifyAndSummarize's
// DEAD_PROVIDER_PATTERN then matched the 401 and marked the whole provider dead
// for the rest of the run. With 27 keys across six providers that is not a corner
// case: one revoked key silently removed a provider that still had four working
// ones, and the only symptom was a smaller `llmProviders` map nobody reads.
//
// The distinction this module exists to make:
//
//   429 / 413 / 5xx   this key is busy right now        -> next key, same provider
//   401 / 403         this KEY is bad                   -> retire the key, keep going
//   402               this key's ACCOUNT is out of credit -> retire the key, keep going
//   404               the MODEL or endpoint is wrong    -> no key can fix it, kill provider
//
// 402 retires the key rather than the provider because the keys are deliberately
// on separate accounts, so one empty balance says nothing about the other four.
// 404 is the opposite: every key would get the identical answer, and discovering
// that once per key per story is the waste that made OpenRouter cost ~150 pointless
// round trips a run before it was caught.

/** How long a retired key stays retired. */
const KEY_COOLDOWN_MS = 10 * 60_000;

// Retired keys live at module scope deliberately. Fluid Compute reuses instances,
// so this survives between stories and between requests on the same instance,
// which is the point: a revoked key should be learned once, not re-discovered on
// every story. The TTL is what keeps that safe. A key retired for 402 comes back
// by itself after a top-up, and a cold instance simply starts from a clean slate,
// so the worst case is re-learning rather than a permanently wrong verdict.
const retiredUntil = new Map<string, number>();

/**
 * Stable per-key label that is safe to log. Only the last 6 characters, which is
 * enough to tell five keys apart and useless to anyone reading the logs.
 */
export function keyLabel(provider: string, key: string): string {
  return `${provider}:...${key.slice(-6)}`;
}

function isRetired(label: string): boolean {
  const until = retiredUntil.get(label);
  if (until === undefined) return false;
  if (Date.now() >= until) {
    retiredUntil.delete(label); // cooled off: let it prove itself again
    return false;
  }
  return true;
}

function retire(label: string): void {
  retiredUntil.set(label, Date.now() + KEY_COOLDOWN_MS);
}

/** Exposed for diagnostics: which keys are currently benched, and for how long. */
export function retiredKeys(): { label: string; secondsLeft: number }[] {
  const now = Date.now();
  return [...retiredUntil.entries()]
    .filter(([, until]) => until > now)
    .map(([label, until]) => ({ label, secondsLeft: Math.round((until - now) / 1000) }));
}

/** Test seam: rotation state must not leak between cases. */
export function __resetRotationState(): void {
  retiredUntil.clear();
}

/**
 * One attempt against one key.
 * Return a string on success, null when the key is merely busy (429/413/5xx),
 * and throw for anything else so the status code can be classified here.
 */
export type KeyAttempt = (key: string, prompt: string) => Promise<string | null>;

export interface RotateOptions {
  provider: string;
  keys: string[];
  /** Mutable round-robin position, so load spreads across calls rather than
   *  hammering the first key until it rate-limits. */
  cursor: { i: number };
  attempt: KeyAttempt;
  prompt: string;
  rounds?: number;
  /** Pause between full rounds; the per-minute window is what is being waited out. */
  backoffMs?: (round: number) => number;
}

/** A model/endpoint fault: every key answers identically, so stop immediately. */
function isProviderFault(message: string): boolean {
  return /\b404\b/.test(message);
}

/** A key-specific fault: this key is bad, the others may be fine. */
function isKeyFault(message: string): boolean {
  return /\b(401|402|403)\b/.test(message);
}

/**
 * Rotates through every live key, `rounds` times, and returns the first success.
 *
 * Throws only when no key can serve the request. The message keeps the historic
 * "key(s) exhausted" wording because classifyAndSummarize's EXHAUSTED_PATTERN
 * counts strikes against it, and it appends the distinct statuses actually seen
 * so DEAD_PROVIDER_PATTERN can still retire a provider whose keys are ALL bad.
 */
export async function rotateKeys({
  provider,
  keys,
  cursor,
  attempt,
  prompt,
  rounds = 3,
  backoffMs = (round) => 1500 * (round + 1),
}: RotateOptions): Promise<string> {
  if (!keys.length) throw new Error(`${provider}: no keys configured`);

  const seen = new Set<string>();
  let retiredThisCall = 0;

  for (let round = 0; round < rounds; round++) {
    let triedSomething = false;

    for (let i = 0; i < keys.length; i++) {
      const idx = (cursor.i + i) % keys.length;
      const key = keys[idx];
      const label = keyLabel(provider, key);
      if (isRetired(label)) continue;

      triedSomething = true;
      try {
        const text = await attempt(key, prompt);
        if (text) {
          // Start the next call on the following key so one key does not absorb
          // every request and hit its per-minute ceiling alone.
          cursor.i = (idx + 1) % keys.length;
          return text;
        }
        seen.add("429/5xx");
      } catch (err) {
        const message = String(err);

        if (isProviderFault(message)) {
          // Wrong model or endpoint. Every remaining key would return this too.
          throw new Error(`${provider}: ${message.slice(0, 180)}`);
        }

        if (isKeyFault(message)) {
          retire(label);
          retiredThisCall++;
          seen.add(message.match(/\b(401|402|403)\b/)?.[1] ?? "4xx");
          continue;
        }

        // Unknown failure: treat as this-key-busy rather than condemning the
        // provider on one unrecognised string.
        seen.add(message.slice(0, 60));
      }
    }

    // Every key is retired; more rounds cannot help.
    if (!triedSomething) break;
    if (round < rounds - 1) await new Promise((r) => setTimeout(r, backoffMs(round)));
  }

  const detail = seen.size ? ` [${[...seen].join(", ")}]` : "";
  const retiredNote = retiredThisCall ? `, ${retiredThisCall} key(s) retired this call` : "";
  throw new Error(
    `${provider}: ${keys.length} key(s) exhausted after ${rounds} rounds${retiredNote}${detail}`
  );
}

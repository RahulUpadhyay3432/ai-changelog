const SKIP_COUNT_KEY = "kapyn_notif_skip_count";
const LAST_SHOWN_KEY = "kapyn_notif_last_shown";
const DISMISSED_KEY = "kapyn_notif_dismissed";

// Days to wait before re-showing after skip 1, then skip 2
const COOLDOWN_DAYS = [3, 7];

export function shouldShowNotifCard(): boolean {
  if (typeof window === "undefined") return false;
  if (!("PushManager" in window) || !("Notification" in window)) return false;
  if (Notification.permission !== "default") return false;
  try {
    if (localStorage.getItem(DISMISSED_KEY)) return false;
    const skipCount = parseInt(localStorage.getItem(SKIP_COUNT_KEY) ?? "0", 10);
    if (skipCount >= 3) {
      localStorage.setItem(DISMISSED_KEY, "1");
      return false;
    }
    const lastShown = parseInt(localStorage.getItem(LAST_SHOWN_KEY) ?? "0", 10);
    if (!lastShown) return true;
    const daysSince = (Date.now() - lastShown) / 86400000;
    return daysSince >= (COOLDOWN_DAYS[skipCount - 1] ?? 7);
  } catch {
    return false;
  }
}

export function recordNotifSkip(): void {
  try {
    const count = parseInt(localStorage.getItem(SKIP_COUNT_KEY) ?? "0", 10) + 1;
    localStorage.setItem(SKIP_COUNT_KEY, String(count));
    localStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
    if (count >= 3) localStorage.setItem(DISMISSED_KEY, "1");
  } catch {}
}

export function recordNotifDismissed(): void {
  try {
    localStorage.setItem(DISMISSED_KEY, "1");
  } catch {}
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export async function subscribeToNotifications(): Promise<boolean> {
  try {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing) return true;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ) as unknown as BufferSource,
    });
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub.toJSON()),
    });
    return true;
  } catch {
    return false;
  }
}

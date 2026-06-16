import type { NewsItem } from "./types";

// Check if localStorage is available (SSR-safe)
const isBrowser = typeof window !== "undefined";

const KEYS = {
  BOOKMARKS: "ai_changelog_bookmarks",
  PINNED_CATEGORIES: "ai_changelog_pinned_categories",
  STREAK_DATES: "ai_changelog_streak_dates",
  LAST_VISIT: "kapyn_last_visit",
  READ_HISTORY: "kapyn_read_history",
};

const READ_HISTORY_CAP = 500;

// ==========================================
// Last Visit Timestamp
// ==========================================

export function getLastVisitTimestamp(): number | null {
  if (!isBrowser) return null;
  try {
    const raw = localStorage.getItem(KEYS.LAST_VISIT);
    return raw ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

export function setLastVisitTimestamp(): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(KEYS.LAST_VISIT, Date.now().toString());
  } catch {}
}

// ==========================================
// Bookmarks Storage
// ==========================================

export function getSavedStories(): NewsItem[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(KEYS.BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading bookmarks:", e);
    return [];
  }
}

export function saveStory(item: NewsItem): void {
  if (!isBrowser) return;
  try {
    const saved = getSavedStories();
    if (!saved.some((s) => s.id === item.id)) {
      saved.push(item);
      localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(saved));
    }
  } catch (e) {
    console.error("Error saving bookmark:", e);
  }
}

export function removeStory(id: string): void {
  if (!isBrowser) return;
  try {
    const saved = getSavedStories();
    const updated = saved.filter((s) => s.id !== id);
    localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(updated));
  } catch (e) {
    console.error("Error removing bookmark:", e);
  }
}

export function isStorySaved(id: string): boolean {
  if (!isBrowser) return false;
  return getSavedStories().some((s) => s.id === id);
}

// ==========================================
// Pinned Categories Storage
// ==========================================

export function getPinnedCategories(): string[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(KEYS.PINNED_CATEGORIES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading pinned categories:", e);
    return [];
  }
}

export function toggleCategoryPin(slug: string): boolean {
  if (!isBrowser) return false;
  try {
    const pinned = getPinnedCategories();
    const index = pinned.indexOf(slug);
    let newPinnedState = false;

    if (index > -1) {
      pinned.splice(index, 1);
    } else {
      pinned.push(slug);
      newPinnedState = true;
    }

    localStorage.setItem(KEYS.PINNED_CATEGORIES, JSON.stringify(pinned));
    return newPinnedState;
  } catch (e) {
    console.error("Error toggling category pin:", e);
    return false;
  }
}

export function isCategoryPinned(slug: string): boolean {
  if (!isBrowser) return false;
  return getPinnedCategories().includes(slug);
}

// ==========================================
// Streak Gamification Storage
// ==========================================

export function getStreak(): number {
  if (!isBrowser) return 0;
  try {
    const raw = localStorage.getItem(KEYS.STREAK_DATES);
    const dates: string[] = raw ? JSON.parse(raw) : [];
    if (dates.length === 0) return 0;

    // Get today and yesterday in local YYYY-MM-DD
    const getLocalDateString = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const todayStr = getLocalDateString(new Date());
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    // Sort dates descending
    const sortedDates = [...new Set(dates)].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    const latestDate = sortedDates[0];

    // If the user's latest active date is older than yesterday, the streak is broken
    if (latestDate !== todayStr && latestDate !== yesterdayStr) {
      return 0;
    }

    // Trace backwards consecutively
    let streak = 0;
    const currentCheck = new Date(latestDate);

    while (true) {
      const checkStr = getLocalDateString(currentCheck);
      if (sortedDates.includes(checkStr)) {
        streak++;
        // Go back 1 day
        currentCheck.setDate(currentCheck.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  } catch (e) {
    console.error("Error calculating streak:", e);
    return 0;
  }
}

export function updateStreak(): void {
  if (!isBrowser) return;
  try {
    const raw = localStorage.getItem(KEYS.STREAK_DATES);
    const dates: string[] = raw ? JSON.parse(raw) : [];

    const getLocalDateString = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const todayStr = getLocalDateString(new Date());

    if (!dates.includes(todayStr)) {
      dates.push(todayStr);
      localStorage.setItem(KEYS.STREAK_DATES, JSON.stringify(dates));
    }
  } catch (e) {
    console.error("Error updating streak:", e);
  }
}

// ==========================================
// Read History
// ==========================================

export interface ReadRecord {
  id: string;
  categorySlug: NewsItem["categorySlug"];
  at: string; // ISO date string
}

export function getReadHistory(): ReadRecord[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(KEYS.READ_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordRead(item: NewsItem): void {
  if (!isBrowser) return;
  try {
    const history = getReadHistory();
    if (history.some((r) => r.id === item.id)) return;
    history.push({ id: item.id, categorySlug: item.categorySlug, at: new Date().toISOString() });
    // Keep only the most recent entries
    if (history.length > READ_HISTORY_CAP) history.splice(0, history.length - READ_HISTORY_CAP);
    localStorage.setItem(KEYS.READ_HISTORY, JSON.stringify(history));
  } catch {}
}

// ==========================================
// Push Notification Opt-in Storage
// ==========================================

export function getPushOptedIn(): boolean {
  if (!isBrowser) return false;
  return localStorage.getItem("kapyn_push_opted_in") === "true";
}

export function setPushOptedIn(): void {
  if (!isBrowser) return;
  localStorage.setItem("kapyn_push_opted_in", "true");
}

export function getPushDismissed(): boolean {
  if (!isBrowser) return false;
  return localStorage.getItem("kapyn_push_dismissed") === "true";
}

export function setPushDismissed(): void {
  if (!isBrowser) return;
  localStorage.setItem("kapyn_push_dismissed", "true");
}

// ==========================================
// Feed Preferences
// ==========================================

const FEED_PREFS_KEY = "kapyn_feed_prefs";
// Hint is dismissed permanently only via the ✕ button.
// Going to Profile does NOT dismiss it — the hint hides naturally once the
// user has selected ≥1 category (getFeedPrefs().length > 0).
const FEED_HINT_DISMISSED_KEY = "kapyn_feed_hint_dismissed_v1";

// null = never configured (show all). Array = user's chosen slugs.
export function getFeedPrefs(): string[] | null {
  if (!isBrowser) return null;
  try {
    const raw = localStorage.getItem(FEED_PREFS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setFeedPrefs(slugs: string[]): void {
  if (!isBrowser) return;
  try { localStorage.setItem(FEED_PREFS_KEY, JSON.stringify(slugs)); } catch {}
}

// Returns true if hint should be hidden (user dismissed with ✕, or has prefs set)
export function getFeedHintShown(): boolean {
  if (!isBrowser) return false;
  if (localStorage.getItem(FEED_HINT_DISMISSED_KEY) === "1") return true;
  try {
    const raw = localStorage.getItem(FEED_PREFS_KEY);
    const prefs: string[] | null = raw ? JSON.parse(raw) : null;
    return prefs !== null && prefs.length > 0;
  } catch { return false; }
}

// Only call this from the ✕ dismiss button — not from navigating to Profile
export function setFeedHintShown(): void {
  if (!isBrowser) return;
  try { localStorage.setItem(FEED_HINT_DISMISSED_KEY, "1"); } catch {}
}

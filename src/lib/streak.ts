"use client";

export const LEGACY_STREAK_STORAGE_KEY = "tlp-streak-dates";

export function getStreakStorageKey(userId: string) {
  return `tlp-streak-dates:${userId}`;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function sanitizeDates(parsed: unknown) {
  return Array.isArray(parsed)
    ? parsed.filter((value): value is string => typeof value === "string")
    : [];
}

function computeCurrentStreak(dates: string[]) {
  const uniqueDates = new Set(dates);
  const today = new Date();
  let streak = 0;
  let cursor = today;

  while (uniqueDates.has(toDateKey(cursor))) {
    streak += 1;
    cursor = shiftDays(cursor, -1);
  }

  return streak;
}

export function readStreakDates(userId?: string) {
  if (typeof window === "undefined") return [];

  try {
    const raw =
      (userId ? window.localStorage.getItem(getStreakStorageKey(userId)) : null) ??
      window.localStorage.getItem(LEGACY_STREAK_STORAGE_KEY);
    if (!raw) return [];

    const parsed = sanitizeDates(JSON.parse(raw));

    if (userId && !window.localStorage.getItem(getStreakStorageKey(userId))) {
      window.localStorage.setItem(
        getStreakStorageKey(userId),
        JSON.stringify(parsed)
      );
    }

    return parsed;
  } catch {
    return [];
  }
}

export function getCurrentStreak(userId?: string) {
  return computeCurrentStreak(readStreakDates(userId));
}

export function recordTodayForStreak(userId?: string) {
  if (typeof window === "undefined") return 0;

  const dates = readStreakDates(userId);
  const todayKey = toDateKey(new Date());
  const merged = Array.from(new Set([...dates, todayKey])).sort();

  try {
    window.localStorage.setItem(
      userId ? getStreakStorageKey(userId) : LEGACY_STREAK_STORAGE_KEY,
      JSON.stringify(merged)
    );
  } catch {
    // Ignore storage failures and still compute from the in-memory value.
  }

  return computeCurrentStreak(merged);
}

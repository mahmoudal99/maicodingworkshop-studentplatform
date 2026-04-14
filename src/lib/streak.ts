"use client";

const STREAK_STORAGE_KEY = "tlp-streak-dates";

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

export function readStreakDates() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STREAK_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

export function getCurrentStreak(dates = readStreakDates()) {
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

export function recordTodayForStreak() {
  if (typeof window === "undefined") return 0;

  const dates = readStreakDates();
  const todayKey = toDateKey(new Date());
  const merged = Array.from(new Set([...dates, todayKey])).sort();

  try {
    window.localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Ignore storage failures and still compute from the in-memory value.
  }

  return getCurrentStreak(merged);
}

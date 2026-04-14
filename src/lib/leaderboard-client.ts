"use client";

export interface SyncLeaderboardInput {
  userId: string;
  userName: string;
  versionKey: "A" | "B";
  totalXp: number;
  deltaXp: number;
  streak: number;
  completedCount: number;
  currentWeek: number;
}

export async function syncLeaderboard(input: SyncLeaderboardInput) {
  const response = await fetch("/api/leaderboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to sync leaderboard");
  }

  return response.json();
}

export async function fetchLeaderboard() {
  const response = await fetch("/api/leaderboard", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load leaderboard");
  }
  return response.json();
}

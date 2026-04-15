import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const LOCAL_FILE = join(process.cwd(), ".dev-leaderboard.json");

export interface ClassLeaderboardEntry {
  userId: string;
  userName: string;
  versionKey: "A" | "B";
  totalXp: number;
  weeklyXp: number;
  streak: number;
  completedCount: number;
  currentWeek: number;
  updatedAt: string;
}

interface LeaderboardState {
  seasonId: string;
  entries: ClassLeaderboardEntry[];
}

function currentSeasonId(date = new Date()) {
  const year = date.getFullYear();
  const start = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  const weekOfYear = Math.floor(dayOfYear / 7);
  return `${year}-W${weekOfYear}`;
}

async function getBlobStore() {
  try {
    const { getStore } = await import("@netlify/blobs");
    return getStore("workshop-leaderboard");
  } catch {
    return null;
  }
}

function readLocal(): LeaderboardState {
  try {
    if (existsSync(LOCAL_FILE)) {
      return JSON.parse(readFileSync(LOCAL_FILE, "utf-8")) as LeaderboardState;
    }
  } catch {
    // Ignore malformed local state.
  }

  return { seasonId: currentSeasonId(), entries: [] };
}

function writeLocal(state: LeaderboardState) {
  writeFileSync(LOCAL_FILE, JSON.stringify(state, null, 2));
}

async function readState(): Promise<LeaderboardState> {
  const seasonId = currentSeasonId();
  const store = await getBlobStore();

  if (store) {
    try {
      const state = (await store.get("class-leaderboard", {
        type: "json",
      })) as LeaderboardState | null;

      if (!state || state.seasonId !== seasonId) {
        return { seasonId, entries: [] };
      }

      return state;
    } catch {
      return { seasonId, entries: [] };
    }
  }

  const local = readLocal();
  if (local.seasonId !== seasonId) {
    return { seasonId, entries: [] };
  }
  return local;
}

async function writeState(state: LeaderboardState) {
  const store = await getBlobStore();
  if (store) {
    await store.setJSON("class-leaderboard", state);
    return;
  }
  writeLocal(state);
}

function sortEntries(entries: ClassLeaderboardEntry[]) {
  return [...entries].sort((left, right) => {
    if (right.weeklyXp !== left.weeklyXp) return right.weeklyXp - left.weeklyXp;
    if (right.totalXp !== left.totalXp) return right.totalXp - left.totalXp;
    return right.streak - left.streak;
  });
}

export async function getClassLeaderboard() {
  const state = await readState();
  return {
    seasonId: state.seasonId,
    entries: sortEntries(state.entries),
  };
}

export async function upsertClassLeaderboardEntry(input: {
  userId: string;
  userName: string;
  versionKey: "A" | "B";
  totalXp: number;
  deltaXp: number;
  streak: number;
  completedCount: number;
  currentWeek: number;
}) {
  const state = await readState();
  const existingIndex = state.entries.findIndex((entry) => entry.userId === input.userId);
  const nowIso = new Date().toISOString();

  if (existingIndex >= 0) {
    const existing = state.entries[existingIndex];
    state.entries[existingIndex] = {
      ...existing,
      userName: input.userName,
      versionKey: input.versionKey,
      totalXp: input.totalXp,
      weeklyXp: Math.max(0, existing.weeklyXp + input.deltaXp),
      streak: input.streak,
      completedCount: input.completedCount,
      currentWeek: input.currentWeek,
      updatedAt: nowIso,
    };
  } else {
    state.entries.push({
      userId: input.userId,
      userName: input.userName,
      versionKey: input.versionKey,
      totalXp: input.totalXp,
      weeklyXp: Math.max(0, input.deltaXp),
      streak: input.streak,
      completedCount: input.completedCount,
      currentWeek: input.currentWeek,
      updatedAt: nowIso,
    });
  }

  state.entries = sortEntries(state.entries);
  await writeState(state);

  return {
    seasonId: state.seasonId,
    entries: state.entries,
  };
}

export async function deleteClassLeaderboardEntry(userId: string) {
  const state = await readState();
  state.entries = state.entries.filter((entry) => entry.userId !== userId);
  await writeState(state);

  return {
    seasonId: state.seasonId,
    entries: sortEntries(state.entries),
  };
}

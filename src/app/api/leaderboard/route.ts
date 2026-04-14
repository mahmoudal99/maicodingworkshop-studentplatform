import { NextResponse } from "next/server";
import {
  getClassLeaderboard,
  upsertClassLeaderboardEntry,
} from "@/lib/class-leaderboard";

export async function GET() {
  const leaderboard = await getClassLeaderboard();
  return NextResponse.json(leaderboard);
}

export async function POST(request: Request) {
  let body: {
    userId?: string;
    userName?: string;
    versionKey?: "A" | "B";
    totalXp?: number;
    deltaXp?: number;
    streak?: number;
    completedCount?: number;
    currentWeek?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !body.userId ||
    !body.userName ||
    (body.versionKey !== "A" && body.versionKey !== "B") ||
    typeof body.totalXp !== "number" ||
    typeof body.deltaXp !== "number" ||
    typeof body.streak !== "number" ||
    typeof body.completedCount !== "number" ||
    typeof body.currentWeek !== "number"
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const leaderboard = await upsertClassLeaderboardEntry({
    userId: body.userId,
    userName: body.userName,
    versionKey: body.versionKey,
    totalXp: body.totalXp,
    deltaXp: body.deltaXp,
    streak: body.streak,
    completedCount: body.completedCount,
    currentWeek: body.currentWeek,
  });

  return NextResponse.json(leaderboard);
}

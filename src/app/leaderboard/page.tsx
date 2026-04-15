"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import RevealOnScroll from "@/components/RevealOnScroll";
import TrophyStage from "@/components/game/TrophyStage";
import { useProgress } from "@/lib/progress";
import { useUser } from "@/lib/store";
import { fetchLeaderboard, syncLeaderboard } from "@/lib/leaderboard-client";
import type { ClassLeaderboardEntry } from "@/lib/class-leaderboard";
import { getCurrentStreak } from "@/lib/streak";

const LEAGUE_PLANETS = [
  "/Planets/p8.png",
  "/Planets/p2.png",
  "/Planets/p11.png",
  "/Planets/p5.png",
  "/Planets/p9.png",
  "/Planets/p3.png",
];

const LEAGUE_TROPHIES = ["bronze", "silver", "gold", "orbital", "nova", "core"] as const;

const PODIUM_TROPHIES = {
  1: "gold",
  2: "silver",
  3: "bronze",
} as const;

const TROPHY_LABELS = {
  bronze: "Bronze crest",
  silver: "Silver crest",
  gold: "Gold crest",
  orbital: "Orbital crystal",
  nova: "Nova crystal",
  core: "Core trophy",
} as const;

const TROPHY_ACCENTS = {
  bronze: "#FFB36B",
  silver: "#8FD2FF",
  gold: "#FFD96F",
  orbital: "#46D9FF",
  nova: "#84F4D2",
  core: "#9BC1FF",
} as const;

const LEAGUE_NAMES = [
  "Boot League",
  "Relay League",
  "Circuit League",
  "Orbital League",
  "Nova League",
  "Core League",
];

function initialsForName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function accentForRank(rank: number) {
  if (rank === 1) return "#FFC94A";
  if (rank === 2) return "#46D9FF";
  if (rank === 3) return "#3BE67F";
  return rank % 2 === 0 ? "#5FA8FF" : "#8E7CFF";
}

function endsInLabel() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 0, 0);
  const daysUntilSunday = (7 - now.getDay()) % 7;
  end.setDate(now.getDate() + daysUntilSunday);
  const diffDays = Math.ceil((end.getTime() - now.getTime()) / 86400000);

  if (diffDays <= 0) return "Ends tonight";
  if (diffDays === 1) return "Ends in 1 day";
  return `Ends in ${diffDays} days`;
}

function leagueIndexForRank(rank: number) {
  if (rank <= 3) return 5;
  if (rank <= 5) return 4;
  if (rank <= 8) return 3;
  if (rank <= 10) return 2;
  if (rank <= 12) return 1;
  return 0;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { userId, userName, versionKey, loaded } = useUser();
  const { xp, getOverallProgress, progressLoaded } = useProgress();
  const [entries, setEntries] = useState<ClassLeaderboardEntry[]>([]);
  const [seasonId, setSeasonId] = useState("");
  const [loading, setLoading] = useState(true);

  const overall = getOverallProgress(versionKey);
  const streak = getCurrentStreak(userId);

  useEffect(() => {
    if (loaded && !userName) {
      router.replace("/");
    }
  }, [loaded, router, userName]);

  useEffect(() => {
    if (!loaded || !progressLoaded || !userId || !userName) return;

    let cancelled = false;

    async function loadLeaderboard() {
      try {
        await syncLeaderboard({
          userId,
          userName,
          versionKey,
          totalXp: xp,
          deltaXp: 0,
          streak,
          completedCount: overall.done,
          currentWeek: overall.currentWeek,
        });

        const data = await fetchLeaderboard();
        if (!cancelled) {
          setEntries(data.entries ?? []);
          setSeasonId(data.seasonId ?? "");
        }
      } catch {
        if (!cancelled) {
          setEntries([]);
          setSeasonId("");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [loaded, overall.currentWeek, overall.done, progressLoaded, streak, userId, userName, versionKey, xp]);

  const userRank = entries.findIndex((entry) => entry.userId === userId) + 1;
  const leagueIndex = leagueIndexForRank(userRank || entries.length || 1);
  const topThree = entries.slice(0, 3);
  const podiumOrder = [topThree[1], topThree[0], topThree[2]]
    .filter((entry): entry is ClassLeaderboardEntry => Boolean(entry))
    .map((entry) => ({
      entry,
      rank: entries.findIndex((candidate) => candidate.userId === entry.userId) + 1,
    }));
  const demotionStart = Math.max(entries.length - 2, 0);
  const leagueName = LEAGUE_NAMES[leagueIndex];
  const leaguePlanet = LEAGUE_PLANETS[leagueIndex];
  const leagueTrophy = LEAGUE_TROPHIES[leagueIndex];

  const userWeeklyXp = useMemo(() => {
    return entries.find((entry) => entry.userId === userId)?.weeklyXp ?? 0;
  }, [entries, userId]);

  if (!loaded || !progressLoaded || !userName) return null;

  return (
    <>
      <Navbar />
      <div className="main-content page-enter">
        <Link href="/dashboard" className="back-btn">
          {"← Back to dashboard"}
        </Link>

        <div className="page-title">Leaderboard</div>
        <p className="page-sub">
          Real class standings. Earn XP in the Living Lab and climb the weekly league together.
        </p>

        <div className="leaderboard-hero">
          <div className="leaderboard-hero-copy">
            <span className="leaderboard-kicker">{"// Class league"}</span>
            <h2 className="leaderboard-league-name">{leagueName}</h2>
            <p className="leaderboard-league-sub">
              {seasonId ? `Season ${seasonId} is live now.` : "This week's league is forming now."}
            </p>

            <div className="leaderboard-hero-stats">
              <div className="leaderboard-hero-stat">
                <span className="leaderboard-hero-stat-label">Rank</span>
                <strong>{userRank ? `#${userRank}` : "—"}</strong>
              </div>
              <div className="leaderboard-hero-stat">
                <span className="leaderboard-hero-stat-label">Weekly XP</span>
                <strong>{userWeeklyXp}</strong>
              </div>
              <div className="leaderboard-hero-stat">
                <span className="leaderboard-hero-stat-label">Streak</span>
                <strong>🔥 {streak}</strong>
              </div>
              <div className="leaderboard-hero-stat">
                <span className="leaderboard-hero-stat-label">Clock</span>
                <strong>{endsInLabel()}</strong>
              </div>
            </div>
          </div>

          <div className="leaderboard-stage">
            <img className="leaderboard-stage-planet" src={leaguePlanet} alt="" />
            <div className="leaderboard-stage-trophy">
              <TrophyStage variant={leagueTrophy} size="hero" title={`${leagueName} trophy`} />
            </div>
            <div className="leaderboard-stage-caption">
              <span className="leaderboard-stage-caption-kicker">{"// League trophy"}</span>
              <strong>{TROPHY_LABELS[leagueTrophy]}</strong>
            </div>
          </div>
        </div>

        {topThree.length > 0 && (
          <div className="leaderboard-podium">
            {podiumOrder.map(({ entry, rank }, index) => {
              const podiumClass =
                rank === 1
                  ? "leaderboard-podium-card-first"
                  : rank === 2
                  ? "leaderboard-podium-card-second"
                  : "leaderboard-podium-card-third";

              return (
                <RevealOnScroll key={entry.userId} delay={index * 0.07}>
                  <div className={`leaderboard-podium-card ${podiumClass}`}>
                    <span className="leaderboard-podium-place">#{rank}</span>
                    <div
                      className="leaderboard-podium-trophy"
                      style={{ "--podium-accent": TROPHY_ACCENTS[PODIUM_TROPHIES[rank as 1 | 2 | 3]] } as React.CSSProperties}
                    >
                      <TrophyStage
                        variant={PODIUM_TROPHIES[rank as 1 | 2 | 3]}
                        size="podium"
                        title={`${rank} place trophy`}
                        autoRotate={false}
                      />
                    </div>
                    <strong>{entry.userName}</strong>
                    <span className="leaderboard-podium-badge">
                      {initialsForName(entry.userName)}
                    </span>
                    <span className="leaderboard-podium-xp">{entry.weeklyXp} XP this week</span>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        )}

        <div className="leaderboard-board">
          <div className="leaderboard-board-header">
            <span>{"// League table"}</span>
            <span>{endsInLabel()}</span>
          </div>

          <div className="leaderboard-zone leaderboard-zone-promo">
            Promotion zone · top 3
          </div>

          <div className="leaderboard-list">
            {loading ? (
              <div className="leaderboard-row">
                <div className="leaderboard-row-copy">
                  <strong>Loading class standings...</strong>
                </div>
              </div>
            ) : entries.length === 0 ? (
              <div className="leaderboard-row">
                <div className="leaderboard-row-copy">
                  <strong>No standings yet</strong>
                  <span className="leaderboard-row-meta">
                    Finish a room and the class board will start filling up.
                  </span>
                </div>
              </div>
            ) : (
              entries.map((entry, index) => (
                <RevealOnScroll key={entry.userId} delay={(index % 6) * 0.04}>
                  <>
                    {index === demotionStart && entries.length > 5 && (
                      <div className="leaderboard-zone leaderboard-zone-drop">
                        Drop zone · bottom 2
                      </div>
                    )}
                    <div
                      className={`leaderboard-row${entry.userId === userId ? " leaderboard-row-user" : ""}`}
                    >
                      <div className="leaderboard-row-rank">#{index + 1}</div>

                      <div
                        className="leaderboard-avatar"
                        style={{ "--avatar-accent": accentForRank(index + 1) } as React.CSSProperties}
                      >
                        {initialsForName(entry.userName)}
                      </div>

                      <div className="leaderboard-row-copy">
                        <strong>
                          {entry.userId === userId ? `${entry.userName} (You)` : entry.userName}
                        </strong>
                        <span className="leaderboard-row-meta">
                          <span>🔥 {entry.streak}</span>
                          <span>{entry.totalXp} total XP</span>
                        </span>
                      </div>

                      <div className="leaderboard-row-score">{entry.weeklyXp} XP</div>
                    </div>
                  </>
                </RevealOnScroll>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

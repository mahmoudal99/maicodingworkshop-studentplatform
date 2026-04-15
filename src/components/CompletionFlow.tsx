"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FbxAssetStage from "@/components/game/FbxAssetStage";
import { useProgress } from "@/lib/progress";
import { recordTodayForStreak } from "@/lib/streak";
import { syncLeaderboard } from "@/lib/leaderboard-client";
import { useUser } from "@/lib/store";

interface CompletionFlowProps {
  accent: string;
  earnedXp: boolean;
  lessonIndex: number;
  totalLessons: number;
  weekId: number;
  continueLabel: string;
  onContinue: () => void;
  onReview: () => void;
}

const SHIP_MODELS = [
  "/Assets/Stargazer.fbx",
  "/Assets/Icarus.fbx",
  "/Assets/Kingfisher.fbx",
  "/Assets/Nightingale.fbx",
  "/Assets/Paladin.fbx",
  "/Assets/Centurion.fbx",
  "/Assets/Saber.fbx",
  "/Assets/Templar.fbx",
  "/Assets/Exarch.fbx",
  "/Assets/Fafnir.fbx",
];

const PLANETS = [
  { src: "/Planets/p1.png", name: "Amber Reach" },
  { src: "/Planets/p2.png", name: "Coral Circuit" },
  { src: "/Planets/p3.png", name: "Nova Bloom" },
  { src: "/Planets/p4.png", name: "Signal Sea" },
  { src: "/Planets/p5.png", name: "Glyph Garden" },
  { src: "/Planets/p6.png", name: "Prism Drift" },
  { src: "/Planets/p7.png", name: "Pulse Haven" },
  { src: "/Planets/p8.png", name: "Relay Reef" },
  { src: "/Planets/p9.png", name: "Aurora Forge" },
  { src: "/Planets/p10.png", name: "Lumen Vale" },
  { src: "/Planets/p11.png", name: "Orbit Ember" },
  { src: "/Planets/p12.png", name: "Circuit Bloom" },
] as const;

const PLANET_ROUTE = [7, 1, 10, 4, 11, 2, 8, 5, 0, 9, 3, 6];

type FlowStep = 0 | 1 | 2;

export default function CompletionFlow({
  accent,
  earnedXp,
  lessonIndex,
  totalLessons,
  weekId,
  continueLabel,
  onContinue,
  onReview,
}: CompletionFlowProps) {
  const { xp, getOverallProgress } = useProgress();
  const { userId, userName, versionKey } = useUser();
  const [step, setStep] = useState<FlowStep>(0);
  const [animIn, setAnimIn] = useState(false);
  const [stepReady, setStepReady] = useState(false);
  const [displayXp, setDisplayXp] = useState(0);
  const syncedRef = useRef(false);

  const xpGain = earnedXp ? 10 : 0;
  const previousXp = Math.max(0, xp - xpGain);
  const overall = getOverallProgress(versionKey);
  const shipModel = SHIP_MODELS[lessonIndex % SHIP_MODELS.length];
  const remaining = totalLessons - lessonIndex - 1;
  const travelRoute = useMemo(() => {
    const startOffset = (weekId * 3) % PLANET_ROUTE.length;
    return Array.from({ length: totalLessons + 1 }, (_, index) => {
      const routeIndex = PLANET_ROUTE[(startOffset + index) % PLANET_ROUTE.length];
      return PLANETS[routeIndex];
    });
  }, [totalLessons, weekId]);
  const currentPlanet = travelRoute[Math.min(lessonIndex, travelRoute.length - 1)];
  const nextPlanet = travelRoute[Math.min(lessonIndex + 1, travelRoute.length - 1)];
  const currentRoomLabel = `${currentPlanet.name} // Room ${lessonIndex + 1}`;
  const nextRoomLabel =
    remaining > 0
      ? `${nextPlanet.name} // Room ${lessonIndex + 2}`
      : `${nextPlanet.name} // Core Dock`;

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 42 }, (_, index) => ({
        id: index,
        x: `${4 + Math.random() * 92}%`,
        delay: `${Math.random() * 0.45}s`,
        duration: `${1.15 + Math.random() * 1.35}s`,
        rotation: `${Math.random() * 680}deg`,
        color: [accent, "#FFD166", "#46D9FF", "#3BE67F", "#FF8C42"][index % 5],
      })),
    [accent]
  );

  const travelStars = useMemo(
    () =>
      Array.from({ length: 22 }, (_, index) => ({
        id: index,
        left: `${4 + Math.random() * 92}%`,
        top: `${8 + Math.random() * 76}%`,
        delay: `${Math.random() * 2}s`,
        duration: `${1.8 + Math.random() * 2.8}s`,
      })),
    []
  );

  useEffect(() => {
    if (syncedRef.current) return;
    syncedRef.current = true;

    const currentStreak = recordTodayForStreak(userId);
    if (userId && userName) {
      syncLeaderboard({
        userId,
        userName,
        versionKey,
        totalXp: xp,
        deltaXp: xpGain,
        streak: currentStreak,
        completedCount: overall.done,
        currentWeek: overall.currentWeek,
      }).catch(() => {
        // Ignore sync issues for now so completion flow never blocks progression.
      });
    }
    const frame = requestAnimationFrame(() => setAnimIn(true));
    return () => cancelAnimationFrame(frame);
  }, [overall.currentWeek, overall.done, userId, userName, versionKey, xp, xpGain]);

  useEffect(() => {
    setAnimIn(false);
    setStepReady(false);
    const enterFrame = requestAnimationFrame(() => setAnimIn(true));

    let timeoutId: number | undefined;
    let xpFrame = 0;

    if (step === 0) {
      timeoutId = window.setTimeout(() => setStepReady(true), 1100);
    }

    if (step === 1) {
      const animationStart = performance.now();
      const animationDuration = earnedXp ? 1150 : 520;
      setDisplayXp(previousXp);

      const tick = (now: number) => {
        const progress = Math.min(1, (now - animationStart) / animationDuration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const nextValue = Math.round(previousXp + (xp - previousXp) * eased);
        setDisplayXp(nextValue);

        if (progress < 1) {
          xpFrame = window.requestAnimationFrame(tick);
          return;
        }

        setStepReady(true);
      };

      xpFrame = window.requestAnimationFrame(tick);
    }

    if (step === 2) {
      timeoutId = window.setTimeout(() => setStepReady(true), 2100);
    }

    return () => {
      cancelAnimationFrame(enterFrame);
      if (timeoutId) window.clearTimeout(timeoutId);
      if (xpFrame) window.cancelAnimationFrame(xpFrame);
    };
  }, [earnedXp, previousXp, step, xp]);

  const advanceFlow = useCallback(() => {
    if (!stepReady) return;

    setAnimIn(false);
    window.setTimeout(() => {
      if (step < 2) {
        setStep((current) => (current + 1) as FlowStep);
        return;
      }

      onContinue();
    }, 220);
  }, [onContinue, step, stepReady]);

  const buttonLabel =
    step === 0 ? "COLLECT XP" : step === 1 ? "PLOT COURSE" : continueLabel;

  return (
    <div className="cflow" style={{ "--cflow-accent": accent } as React.CSSProperties}>
      <div className="cflow-bg" aria-hidden="true">
        <div className="cflow-glow" />
        <img className="cflow-bg-planet cflow-bg-planet-left" src={currentPlanet.src} alt="" />
        <img className="cflow-bg-planet cflow-bg-planet-right" src={nextPlanet.src} alt="" />
        {travelStars.map((star) => (
          <span
            key={star.id}
            className="cflow-star"
            style={
              {
                left: star.left,
                top: star.top,
                "--delay": star.delay,
                "--dur": star.duration,
              } as React.CSSProperties
            }
          />
        ))}
        {step === 0 && (
          <div className="cflow-confetti">
            {confettiPieces.map((piece) => (
              <span
                key={piece.id}
                className="cflow-confetti-piece"
                style={
                  {
                    "--x": piece.x,
                    "--delay": piece.delay,
                    "--dur": piece.duration,
                    "--rot": piece.rotation,
                    background: piece.color,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        )}
      </div>

      <div
        className={`cflow-content ${animIn ? "cflow-in" : "cflow-out"}${
          step === 2 ? " cflow-content-travel" : ""
        }`}
      >
        {step === 0 && (
          <div className="cflow-step cflow-celebration-step">
            <div className="cflow-celebration-core">
              <div className="cflow-celebration-ring" />
              <div className="cflow-celebration-ship">
                <FbxAssetStage
                  modelPath={shipModel}
                  accent={accent}
                  variant="hero"
                  autoRotate
                  float
                  zoom={1.08}
                  modelRotation={[0.08, 0.6, 0]}
                />
              </div>
            </div>
            <h1 className="cflow-heading">
              {earnedXp ? "Room Restored!" : "Replay Complete!"}
            </h1>
            <div className="cflow-xp-pill">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
              </svg>
              <span>{earnedXp ? "+10 XP locked in" : "Progress already saved"}</span>
            </div>
            <p className="cflow-sub">
              {earnedXp
                ? remaining > 0
                  ? `The Living Lab stabilized. ${remaining} more ${
                      remaining === 1 ? "room" : "rooms"
                    } this week.`
                  : "The final room is restored. The Core is glowing again."
                : "You can still move on to the next room right away."}
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="cflow-step cflow-xp-count-step">
            <div className="cflow-xp-orb">
              <span className="cflow-xp-orb-badge">{earnedXp ? `+${xpGain}` : "OK"}</span>
            </div>
            <h1 className="cflow-heading">XP Bank</h1>
            <div className="cflow-xp-count-card">
              <span className="cflow-xp-total-label">Total XP</span>
              <strong className="cflow-xp-count">{displayXp}</strong>
              <div className="cflow-xp-track">
                <div
                  className="cflow-xp-track-fill"
                  style={{
                    width: `${Math.max(
                      16,
                      Math.min(100, ((displayXp % 100) / 100) * 100 || (displayXp > 0 ? 100 : 16))
                    )}%`,
                  }}
                />
              </div>
              <span className="cflow-xp-note">
                {earnedXp ? `${xpGain} XP awarded for restoring this room.` : "Replay complete. No extra XP this time."}
              </span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="cflow-step cflow-travel-step">
            <h1 className="cflow-heading">Setting Course</h1>
            <p className="cflow-sub">
              {remaining > 0
                ? "Byte is routing the ship to the next repair mission."
                : "The ship is docking back at the Core after the final room."}
            </p>

            <div className="cflow-travel-scene">
              <div className="cflow-travel-orbit" aria-hidden="true" />

              <div className="cflow-travel-planet cflow-travel-planet-current">
                <div className="cflow-travel-planet-glow" />
                <img src={currentPlanet.src} alt="" />
                <span className="cflow-travel-planet-label">{currentRoomLabel}</span>
              </div>

              <div className="cflow-travel-planet cflow-travel-planet-next">
                <div className="cflow-travel-planet-glow" />
                <img src={nextPlanet.src} alt="" />
                <span className="cflow-travel-planet-label">{nextRoomLabel}</span>
              </div>

              <div className={`cflow-travel-ship${stepReady ? " cflow-travel-ship-ready" : ""}`}>
                <div className="cflow-travel-ship-shell">
                  <FbxAssetStage
                    modelPath={shipModel}
                    accent={accent}
                    variant="hero"
                    autoRotate={false}
                    float={false}
                    zoom={1.02}
                    modelRotation={[0.08, 0.78, 0]}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="cflow-bar">
        <div className="cflow-bar-inner">
          <button className="cflow-bar-review" onClick={onReview} type="button">
            REVIEW ROOM
          </button>
          <button
            className="cflow-bar-continue"
            onClick={advanceFlow}
            type="button"
            disabled={!stepReady}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

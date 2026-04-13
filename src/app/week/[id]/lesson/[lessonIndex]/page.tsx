"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/lib/store";
import { useProgress } from "@/lib/progress";
import { WEEKS_A, WEEKS_B } from "@/lib/data";
import { getGameId } from "@/lib/game-map";
import BinaryCountingGame from "@/components/games/BinaryCountingGame";
import ComponentMatchGame from "@/components/games/ComponentMatchGame";
import WireframeBuilder from "@/components/games/WireframeBuilder";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { userName, versionKey, loaded } = useUser();
  const { toggle, isCompleted, getWeekProgress } = useProgress();
  const [showResult, setShowResult] = useState(false);
  const [xpBurst, setXpBurst] = useState(false);

  const weekId = Number(params.id);
  const lessonIndex = Number(params.lessonIndex);
  const weeks = versionKey === "A" ? WEEKS_A : WEEKS_B;
  const week = weeks[weekId];

  // Flatten all items to find the lesson by global index
  const allItems: { item: string; key: string; sectionTitle: string; sectionIcon: string; sectionIndex: number; itemIndex: number }[] = [];
  if (week) {
    week.sections.forEach((section, sIdx) => {
      section.items.forEach((item, iIdx) => {
        allItems.push({
          item,
          key: `${versionKey}-${weekId}-${sIdx}-${iIdx}`,
          sectionTitle: section.title,
          sectionIcon: section.icon,
          sectionIndex: sIdx,
          itemIndex: iIdx,
        });
      });
    });
  }

  const lesson = allItems[lessonIndex];
  const completed = lesson ? isCompleted(lesson.key) : false;
  const weekProgress = week ? getWeekProgress(versionKey, weekId) : { done: 0, total: 0, percent: 0 };
  const progressPercent = weekProgress.total > 0
    ? Math.round(((lessonIndex + (completed ? 1 : 0)) / allItems.length) * 100)
    : 0;

  // Check if previous lesson is completed (sequential lock)
  const prevComplete = lessonIndex === 0 || (allItems[lessonIndex - 1] && isCompleted(allItems[lessonIndex - 1].key));

  useEffect(() => {
    if (loaded && !userName) {
      router.replace("/");
    }
    if (loaded && userName && !prevComplete) {
      router.replace(`/week/${weekId}`);
    }
  }, [userName, loaded, prevComplete, weekId, router]);

  const handleComplete = useCallback(() => {
    if (!lesson || completed) return;
    toggle(lesson.key);
    setXpBurst(true);
    setShowResult(true);
    setTimeout(() => setXpBurst(false), 1000);
  }, [lesson, completed, toggle]);

  const handleContinue = useCallback(() => {
    // Go to next lesson or back to week path
    if (lessonIndex < allItems.length - 1) {
      router.push(`/week/${weekId}/lesson/${lessonIndex + 1}`);
    } else {
      router.push(`/week/${weekId}`);
    }
  }, [lessonIndex, allItems.length, weekId, router]);

  if (!loaded || !userName || !week || !lesson || !prevComplete) return null;

  const gameId = getGameId(versionKey, weekId, lesson.sectionIndex, lesson.itemIndex);

  const GAME_COMPONENTS: Record<string, React.ComponentType<{ onComplete: () => void; accent: string }>> = {
    "binary-counting": BinaryCountingGame,
    "component-match": ComponentMatchGame,
    "wireframe-builder": WireframeBuilder,
  };

  const GameComponent = gameId ? GAME_COMPONENTS[gameId] : null;

  return (
    <div className="lesson-page">
      {/* Top bar */}
      <div className="lesson-topbar">
        <button
          className="lesson-close"
          onClick={() => router.push(`/week/${weekId}`)}
          aria-label="Close lesson"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
        <div className="lesson-progress-bar">
          <div
            className="lesson-progress-fill"
            style={{ width: `${progressPercent}%`, background: week.accent }}
          />
        </div>
        <div className="lesson-xp-count" style={{ color: week.accent }}>
          {weekProgress.done * 10} XP
        </div>
      </div>

      {/* Main content */}
      <div className="lesson-content">
        {showResult ? (
          /* Success screen */
          <div className="lesson-result">
            <div className={`lesson-result-star${xpBurst ? " lesson-star-burst" : ""}`} style={{ color: week.accent }}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
              </svg>
            </div>
            <h2 className="lesson-result-title">Nice work!</h2>
            <p className="lesson-result-xp" style={{ color: week.accent }}>+10 XP</p>
            <p className="lesson-result-sub">
              {lessonIndex < allItems.length - 1
                ? `${allItems.length - lessonIndex - 1} more ${allItems.length - lessonIndex - 1 === 1 ? "level" : "levels"} to go`
                : "You've completed all levels this week!"}
            </p>
            <button
              className="lesson-continue-btn"
              style={{ background: week.accent }}
              onClick={handleContinue}
              type="button"
            >
              CONTINUE
            </button>
          </div>
        ) : GameComponent && !completed ? (
          /* Interactive game */
          <>
            <div className="lesson-section-badge">
              <span>{lesson.sectionIcon}</span>
              <span>{lesson.sectionTitle}</span>
              <span className="lesson-section-num">
                Level {lessonIndex + 1} of {allItems.length}
              </span>
            </div>
            <GameComponent onComplete={handleComplete} accent={week.accent} />
          </>
        ) : (
          /* Plain activity card (for non-game lessons or already completed games) */
          <>
            <div className="lesson-section-badge">
              <span>{lesson.sectionIcon}</span>
              <span>{lesson.sectionTitle}</span>
              <span className="lesson-section-num">
                Level {lessonIndex + 1} of {allItems.length}
              </span>
            </div>

            <div className="lesson-card" style={{ "--lesson-accent": week.accent } as React.CSSProperties}>
              <div className="lesson-card-icon" style={{ background: `${week.accent}20`, color: week.accent }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
              <h2 className="lesson-card-title">Activity</h2>
              <p className="lesson-card-text">{lesson.item}</p>
            </div>

            <div className="lesson-actions">
              {completed ? (
                <div className="lesson-already-done">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Already completed</span>
                </div>
              ) : (
                <button
                  className="lesson-complete-btn"
                  style={{ background: week.accent }}
                  onClick={handleComplete}
                  type="button"
                >
                  COMPLETE
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Bottom spacer for mobile */}
      <div className="lesson-bottom-spacer" />
    </div>
  );
}

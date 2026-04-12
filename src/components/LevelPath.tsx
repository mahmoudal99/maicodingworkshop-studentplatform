"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/lib/store";
import { useProgress } from "@/lib/progress";
import type { WeekSection } from "@/lib/data";

/* S-curve offsets for the winding path */
const CURVE_OFFSETS = [0, 50, 80, 50, 0, -50, -80, -50];

function LevelNode({
  itemKey,
  globalIndex,
  weekIndex,
  sectionColor,
  locked,
  isFirstActive,
}: {
  itemKey: string;
  globalIndex: number;
  weekIndex: number;
  sectionColor: string;
  locked: boolean;
  isFirstActive: boolean;
}) {
  const router = useRouter();
  const { isCompleted } = useProgress();
  const completed = isCompleted(itemKey);
  const isActive = !completed && !locked;
  const offset = CURVE_OFFSETS[globalIndex % CURVE_OFFSETS.length];

  const handleClick = () => {
    if (locked) return;
    router.push(`/week/${weekIndex}/lesson/${globalIndex}`);
  };

  const stateClass = completed
    ? "lp-bubble-done"
    : locked
    ? "lp-bubble-locked"
    : "lp-bubble-active";

  return (
    <div
      className="lp-node-wrapper"
      style={{ transform: `translateX(${offset}px)` }}
    >
      {/* START badge for the first active (unlocked incomplete) node */}
      {isFirstActive && isActive && (
        <div className="lp-start-badge" style={{ background: sectionColor }}>
          START
        </div>
      )}

      <div className="lp-node">
        <button
          className={`lp-bubble ${stateClass}`}
          style={
            {
              "--node-color": sectionColor,
              "--node-glow": `${sectionColor}30`,
            } as React.CSSProperties
          }
          onClick={handleClick}
          type="button"
        >
          {completed ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill="currentColor"
              />
            </svg>
          ) : locked ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M8 11V7a4 4 0 118 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function SectionDivider({
  section,
  sectionIndex,
  weekIndex,
  versionKey,
  color,
}: {
  section: WeekSection;
  sectionIndex: number;
  weekIndex: number;
  versionKey: string;
  color: string;
}) {
  const { completed } = useProgress();

  let done = 0;
  for (let i = 0; i < section.items.length; i++) {
    if (completed[`${versionKey}-${weekIndex}-${sectionIndex}-${i}`]) done++;
  }
  const allDone = done === section.items.length && section.items.length > 0;

  return (
    <div className="lp-divider">
      <div className="lp-divider-line" />
      <div
        className={`lp-divider-label${allDone ? " lp-divider-done" : ""}`}
        style={{ borderColor: allDone ? color : "var(--border)" }}
      >
        <span className="lp-divider-icon">{allDone ? "\u2B50" : section.icon}</span>
        <span className="lp-divider-title">{section.title}</span>
        <span className="lp-divider-count" style={{ color }}>
          {done}/{section.items.length}
        </span>
      </div>
      <div className="lp-divider-line" />
    </div>
  );
}

export default function LevelPath({
  sections,
  weekIndex,
  accent,
}: {
  sections: WeekSection[];
  weekIndex: number;
  accent: string;
}) {
  const { versionKey } = useUser();
  const { isCompleted } = useProgress();

  // Flatten all items for global indexing and sequential locking
  const allItems: { key: string }[] = [];
  sections.forEach((section, sIdx) => {
    section.items.forEach((_, iIdx) => {
      allItems.push({ key: `${versionKey}-${weekIndex}-${sIdx}-${iIdx}` });
    });
  });

  let globalIdx = 0;
  // Find first incomplete unlocked index so only ONE gets the START badge
  let firstActiveGlobal = -1;
  for (let i = 0; i < allItems.length; i++) {
    const locked = i > 0 && !isCompleted(allItems[i - 1].key);
    if (!isCompleted(allItems[i].key) && !locked) {
      firstActiveGlobal = i;
      break;
    }
  }

  return (
    <div className="lp-path">
      {sections.map((section, sIdx) => {
        const nodes = section.items.map((_, iIdx) => {
          const gi = globalIdx++;
          const itemKey = allItems[gi].key;
          const locked = gi > 0 && !isCompleted(allItems[gi - 1].key);

          return (
            <LevelNode
              key={`${sIdx}-${iIdx}`}
              itemKey={itemKey}
              globalIndex={gi}
              weekIndex={weekIndex}
              sectionColor={accent}
              locked={locked}
              isFirstActive={gi === firstActiveGlobal}
            />
          );
        });

        return (
          <div key={sIdx} className="lp-section">
            <SectionDivider
              section={section}
              sectionIndex={sIdx}
              weekIndex={weekIndex}
              versionKey={versionKey}
              color={accent}
            />
            <div className="lp-nodes">{nodes}</div>
          </div>
        );
      })}
    </div>
  );
}

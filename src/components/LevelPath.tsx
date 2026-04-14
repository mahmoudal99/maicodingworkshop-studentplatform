"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/lib/store";
import { useProgress } from "@/lib/progress";
import type { WeekSection } from "@/lib/data";

/* S-curve offsets for the winding path */
const CURVE_OFFSETS = [0, 50, 80, 50, 0, -50, -80, -50];
const MACHINE_LAB_SECTION_COPY = [
  {
    sector: "Sector 1",
    subtitle: "Power the active machine rooms",
  },
  {
    sector: "Sector 2",
    subtitle: "Unlock the inner systems",
  },
];

type PathTheme = "default" | "machine-lab";

function NodeConnector({ fromOffset, toOffset, done, color }: { fromOffset: number; toOffset: number; done: boolean; color: string }) {
  const dx = toOffset - fromOffset;
  // Vertical distance accounts for node height (~48px) + gap (8px for default, 14px for machine)
  const dy = 28;
  return (
    <svg
      className="lp-connector"
      width={Math.abs(dx) + 4}
      height={dy}
      style={{
        marginLeft: dx >= 0 ? `${-Math.abs(dx) / 2 - 2}px` : `${-Math.abs(dx) / 2 - 2}px`,
        transform: `translateX(${(fromOffset + toOffset) / 2}px)`,
        marginBottom: -4,
      }}
      viewBox={`0 0 ${Math.abs(dx) + 4} ${dy}`}
    >
      <line
        x1={dx >= 0 ? 2 : Math.abs(dx) + 2}
        y1={0}
        x2={dx >= 0 ? Math.abs(dx) + 2 : 2}
        y2={dy}
        className={done ? "lp-connector-line-done" : "lp-connector-line"}
        style={done ? { stroke: color } : undefined}
      />
    </svg>
  );
}

function LevelNode({
  itemKey,
  globalIndex,
  weekIndex,
  sectionColor,
  locked,
  isFirstActive,
  label,
  pathTheme,
  isKeyConcept,
  prevOffset,
  showConnector,
  prevDone,
}: {
  itemKey: string;
  globalIndex: number;
  weekIndex: number;
  sectionColor: string;
  locked: boolean;
  isFirstActive: boolean;
  label: string;
  pathTheme: PathTheme;
  isKeyConcept: boolean;
  prevOffset: number;
  showConnector: boolean;
  prevDone: boolean;
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
  const nodeLabelClass = completed
    ? "lp-node-label-done"
    : locked
    ? "lp-node-label-locked"
    : "lp-node-label-active";
  const roomCode = `R-${String(globalIndex + 1).padStart(2, "0")}`;

  return (
    <div
      className="lp-node-wrapper"
      style={{ transform: `translateX(${offset}px)` }}
    >
      {/* Connector line from previous node */}
      {showConnector && (
        <NodeConnector fromOffset={prevOffset} toOffset={offset} done={prevDone} color={sectionColor} />
      )}

      {/* START badge for the first active (unlocked incomplete) node */}
      {isFirstActive && isActive && (
        <div className="lp-start-badge" style={{ background: sectionColor }}>
          {pathTheme === "machine-lab" ? "Enter Lab" : "START"}
        </div>
      )}

      <div
        className="lp-node"
        style={
          {
            "--node-color": sectionColor,
            "--node-glow": `${sectionColor}30`,
            "--node-index": globalIndex,
          } as React.CSSProperties
        }
      >
        <button
          className={`lp-bubble ${stateClass}${pathTheme === "machine-lab" ? " lp-bubble-machine" : ""}${isKeyConcept ? " lp-bubble-hex" : ""}`}
          onClick={handleClick}
          type="button"
          aria-label={`${label}${locked ? " locked" : completed ? " completed" : " ready"}`}
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

        {pathTheme === "machine-lab" && (
          <div className={`lp-node-label ${nodeLabelClass}`}>
            <span className="lp-node-code">{roomCode}</span>
            <span className="lp-node-name">{label}</span>
          </div>
        )}
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
  pathTheme,
}: {
  section: WeekSection;
  sectionIndex: number;
  weekIndex: number;
  versionKey: string;
  color: string;
  pathTheme: PathTheme;
}) {
  const { completed } = useProgress();

  let done = 0;
  for (let i = 0; i < section.items.length; i++) {
    if (completed[`${versionKey}-${weekIndex}-${sectionIndex}-${i}`]) done++;
  }
  const allDone = done === section.items.length && section.items.length > 0;
  const sectionCopy = MACHINE_LAB_SECTION_COPY[sectionIndex];

  return (
    <div className="lp-divider">
      <div className="lp-divider-line" />
      <div
        className={`lp-divider-label${allDone ? " lp-divider-done" : ""}${
          pathTheme === "machine-lab" ? " lp-divider-label-machine" : ""
        }`}
        style={{ borderColor: allDone ? color : "var(--border)" }}
      >
        <span className="lp-divider-icon">{allDone ? "\u2B50" : section.icon}</span>
        <div className="lp-divider-copy">
          <span className="lp-divider-title">{section.title}</span>
          {pathTheme === "machine-lab" && sectionCopy && (
            <span className="lp-divider-subtitle">{sectionCopy.subtitle}</span>
          )}
        </div>
        {pathTheme === "machine-lab" && sectionCopy && (
          <span className="lp-divider-sector">{sectionCopy.sector}</span>
        )}
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
  pathTheme = "default",
}: {
  sections: WeekSection[];
  weekIndex: number;
  accent: string;
  pathTheme?: PathTheme;
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
    <div className={`lp-path${pathTheme === "machine-lab" ? " lp-path-machine" : ""}`}>
      {sections.map((section, sIdx) => {
        const nodes = section.items.map((_, iIdx) => {
          const gi = globalIdx++;
          const itemKey = allItems[gi].key;
          const locked = gi > 0 && !isCompleted(allItems[gi - 1].key);
          const prevGi = gi - 1;
          const prevCurveOffset = prevGi >= 0 ? CURVE_OFFSETS[prevGi % CURVE_OFFSETS.length] : 0;
          const prevItemDone = prevGi >= 0 && isCompleted(allItems[prevGi].key);

          return (
            <LevelNode
              key={`${sIdx}-${iIdx}`}
              itemKey={itemKey}
              globalIndex={gi}
              weekIndex={weekIndex}
              sectionColor={accent}
              locked={locked}
              isFirstActive={gi === firstActiveGlobal}
              label={section.items[iIdx]}
              pathTheme={pathTheme}
              isKeyConcept={sIdx >= 1}
              prevOffset={prevCurveOffset}
              showConnector={iIdx > 0}
              prevDone={prevItemDone}
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
              pathTheme={pathTheme}
            />
            <div className="lp-nodes">{nodes}</div>
          </div>
        );
      })}
    </div>
  );
}

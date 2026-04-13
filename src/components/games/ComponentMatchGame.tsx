"use client";

import { useState, useCallback, useMemo } from "react";

interface Props {
  onComplete: () => void;
  accent: string;
}

const PAIRS = [
  { component: "CPU", description: "Processes instructions and does calculations" },
  { component: "RAM", description: "Stores data temporarily while programs run" },
  { component: "Storage (SSD)", description: "Saves files permanently, even when off" },
  { component: "Keyboard / Mouse", description: "Sends information into the computer" },
  { component: "Monitor / Speakers", description: "Displays or outputs results to the user" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ComponentMatchGame({ onComplete, accent }: Props) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const [phase, setPhase] = useState<"playing" | "done">("playing");

  // Shuffle right column once on mount
  const rightOrder = useMemo(() => shuffle(PAIRS.map((_, i) => i)), []);

  const handleLeftClick = useCallback(
    (idx: number) => {
      if (matched.has(idx) || phase !== "playing") return;
      setSelectedLeft(idx);
      setWrongIdx(null);
    },
    [matched, phase]
  );

  const handleRightClick = useCallback(
    (pairIdx: number) => {
      if (matched.has(pairIdx) || selectedLeft === null || phase !== "playing") return;

      if (pairIdx === selectedLeft) {
        // Correct match
        const next = new Set(matched);
        next.add(pairIdx);
        setMatched(next);
        setSelectedLeft(null);
        setWrongIdx(null);

        if (next.size === PAIRS.length) {
          setPhase("done");
        }
      } else {
        // Wrong
        setWrongIdx(pairIdx);
        setTimeout(() => setWrongIdx(null), 500);
      }
    },
    [selectedLeft, matched, phase]
  );

  if (phase === "done") {
    return (
      <div className="game-container">
        <div className="game-target" style={{ color: accent, fontSize: 32 }}>
          All Matched!
        </div>
        <p style={{ color: "var(--muted2)", fontSize: 14, textAlign: "center" }}>
          You matched all {PAIRS.length} components correctly
        </p>
        <button
          className="game-btn"
          style={{ background: accent }}
          onClick={onComplete}
          type="button"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="game-container" style={{ "--game-accent": accent } as React.CSSProperties}>
      <p className="game-instruction">Match each component to its description</p>
      <p className="game-round">{matched.size} of {PAIRS.length} matched</p>

      <div className="cmg-columns">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {PAIRS.map((pair, i) => (
            <div
              key={i}
              className={`cmg-card${selectedLeft === i ? " cmg-card-selected" : ""}${matched.has(i) ? " cmg-card-matched" : ""}`}
              onClick={() => handleLeftClick(i)}
            >
              <span className="cmg-card-label">{pair.component}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rightOrder.map((pairIdx) => (
            <div
              key={pairIdx}
              className={`cmg-card${matched.has(pairIdx) ? " cmg-card-matched" : ""}${wrongIdx === pairIdx ? " cmg-wrong" : ""}`}
              onClick={() => handleRightClick(pairIdx)}
            >
              {PAIRS[pairIdx].description}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

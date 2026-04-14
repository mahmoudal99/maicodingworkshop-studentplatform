"use client";

import { useState, useCallback, useMemo } from "react";

interface Props {
  onComplete: () => void;
  accent: string;
}

const PAIRS = [
  {
    component: "CPU Core",
    description: "Processes instructions and does the machine's thinking",
    status: "CPU core online. It is the machine's main thinker.",
  },
  {
    component: "RAM Deck",
    description: "Holds the data the machine is using right now",
    status: "RAM deck online. It keeps active work ready to use.",
  },
  {
    component: "Storage Vault",
    description: "Keeps files saved even when the machine powers off",
    status: "Storage vault online. It keeps things for later.",
  },
  {
    component: "Input Port",
    description: "Sends information into the machine",
    status: "Input port online. It lets signals come in.",
  },
  {
    component: "Output Screen",
    description: "Shows or plays the machine's results",
    status: "Output screen online. It sends results back out.",
  },
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
  const [status, setStatus] = useState(
    "Repair each machine bay by matching the part to its job."
  );

  // Shuffle right column once on mount
  const rightOrder = useMemo(() => shuffle(PAIRS.map((_, i) => i)), []);

  const handleLeftClick = useCallback(
    (idx: number) => {
      if (matched.has(idx) || phase !== "playing") return;
      setSelectedLeft(idx);
      setWrongIdx(null);
      setStatus(`Selected ${PAIRS[idx].component}. Find its job panel.`);
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
        setStatus(PAIRS[pairIdx].status);

        if (next.size === PAIRS.length) {
          setPhase("done");
        }
      } else {
        // Wrong
        setWrongIdx(pairIdx);
        setStatus("That job belongs to a different part. Try another bay.");
        setTimeout(() => setWrongIdx(null), 500);
      }
    },
    [selectedLeft, matched, phase]
  );

  if (phase === "done") {
    return (
      <div className="game-container">
        <div className="lab-done">
          <div className="lab-done-icon" style={{ color: accent }}>
            BAY OK
          </div>
          <h3>Repair complete</h3>
          <p>You brought the machine bays back online by matching each part to its job.</p>
          <div className="lab-takeaway">
            Takeaway: Different computer parts each have a special job.
          </div>
          <button
            className="game-btn"
            style={{ background: accent }}
            onClick={onComplete}
            type="button"
          >
            Open Next Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container" style={{ "--game-accent": accent } as React.CSSProperties}>
      <div className="lab-panel">
        <div className="lab-panel-header">
          <span className="lab-room">Machine Mission</span>
          <span className="lab-step">
            {matched.size} of {PAIRS.length} bays online
          </span>
        </div>
        <h2 className="lab-title">Parts Bay Repair</h2>
        <p className="lab-copy">
          Pair each machine part with the bay that explains its job.
        </p>

        <div className="lab-workspace">
          <div className="cmg-columns">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PAIRS.map((pair, i) => (
                <div
                  key={i}
                  className={`cmg-card${selectedLeft === i ? " cmg-card-selected" : ""}${
                    matched.has(i) ? " cmg-card-matched" : ""
                  }`}
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
                  className={`cmg-card${matched.has(pairIdx) ? " cmg-card-matched" : ""}${
                    wrongIdx === pairIdx ? " cmg-wrong" : ""
                  }`}
                  onClick={() => handleRightClick(pairIdx)}
                >
                  {PAIRS[pairIdx].description}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lab-status">{status}</div>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo, useCallback } from "react";

interface Props {
  onComplete: () => void;
  accent: string;
}

interface Stage {
  id: string;
  label: string;
  description: string;
  icon: string;
}

const CORRECT_CHAIN: Stage[] = [
  { id: "write", label: "You write JavaScript", description: "A programmer types code in a text editor or browser", icon: "✍️" },
  { id: "browser", label: "The browser reads it", description: "The browser's JavaScript engine parses your code", icon: "🌐" },
  { id: "translate", label: "Translates to binary", description: "The engine compiles your code into machine instructions (0s and 1s)", icon: "🔄" },
  { id: "cpu", label: "CPU executes it", description: "The processor runs the binary instructions one by one", icon: "⚡" },
  { id: "result", label: "Result appears on screen", description: "The output — text, images, animations — shows up in the browser", icon: "🖥️" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CodeExecutionChainGame({ onComplete, accent }: Props) {
  const shuffled = useMemo(() => shuffle(CORRECT_CHAIN), []);
  const [placed, setPlaced] = useState<Stage[]>([]);
  const [wrong, setWrong] = useState(false);
  const [done, setDone] = useState(false);
  const [showInfo, setShowInfo] = useState<string | null>(null);

  const remaining = shuffled.filter((s) => !placed.find((p) => p.id === s.id));

  const handlePick = useCallback(
    (stage: Stage) => {
      const expectedIndex = placed.length;
      if (stage.id !== CORRECT_CHAIN[expectedIndex].id) {
        setWrong(true);
        setTimeout(() => setWrong(false), 600);
        return;
      }
      const next = [...placed, stage];
      setPlaced(next);
      setShowInfo(stage.id);
      setTimeout(() => setShowInfo(null), 1500);

      if (next.length === CORRECT_CHAIN.length) {
        setTimeout(() => setDone(true), 1200);
      }
    },
    [placed]
  );

  if (done) {
    return (
      <div className="game-container">
        <div className="cec-done">
          <div className="cec-chain-display">
            {CORRECT_CHAIN.map((s, i) => (
              <span key={s.id} className="cec-chain-item">
                <span className="cec-chain-icon">{s.icon}</span>
                {i < CORRECT_CHAIN.length - 1 && <span className="cec-arrow">→</span>}
              </span>
            ))}
          </div>
          <h3>You traced the full chain!</h3>
          <p>
            Every time you run code, this is what happens — from human-readable
            instructions all the way down to binary, and back up to pixels on
            your screen.
          </p>
          <button
            className="cec-finish-btn"
            style={{ background: accent }}
            onClick={onComplete}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <p className="game-instruction">
        HOW DOES CODE RUN ON A COMPUTER?
      </p>
      <p className="cec-subtitle">
        Tap the stages in order — from writing code to seeing the result
      </p>

      {/* Placed chain */}
      <div className="cec-placed">
        {placed.map((s, i) => (
          <div key={s.id} className="cec-placed-stage" style={{ borderColor: accent }}>
            <span className="cec-stage-icon">{s.icon}</span>
            <span className="cec-stage-label">{s.label}</span>
            {showInfo === s.id && (
              <div className="cec-info-popup">{s.description}</div>
            )}
            {i < placed.length - 1 && <div className="cec-connector" style={{ background: accent }} />}
          </div>
        ))}
        {placed.length < CORRECT_CHAIN.length && (
          <div className={`cec-placeholder${wrong ? " csg-shake" : ""}`}>
            <span className="cec-stage-icon">?</span>
            <span className="cec-stage-label">Step {placed.length + 1}</span>
          </div>
        )}
      </div>

      {/* Choices */}
      <div className="cec-choices">
        {remaining.map((s) => (
          <button
            key={s.id}
            className="cec-choice-btn"
            onClick={() => handlePick(s)}
          >
            <span className="cec-choice-icon">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

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
  { id: "write", label: "You type the code", description: "A human writes a command the machine can read later", icon: "✍️" },
  { id: "browser", label: "The browser reads it", description: "The browser opens the code packet and checks the instructions", icon: "🌐" },
  { id: "translate", label: "It translates to machine signals", description: "The code is turned into instructions the hardware can use", icon: "🔄" },
  { id: "cpu", label: "The CPU runs it", description: "The CPU follows those machine instructions step by step", icon: "⚡" },
  { id: "result", label: "The result appears", description: "The machine sends the finished result to the screen", icon: "🖥️" },
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
        <div className="lab-done">
          <div className="cec-chain-display">
            {CORRECT_CHAIN.map((s, i) => (
              <span key={s.id} className="cec-chain-item">
                <span className="cec-chain-icon">{s.icon}</span>
                {i < CORRECT_CHAIN.length - 1 && <span className="cec-arrow">→</span>}
              </span>
            ))}
          </div>
          <h3>Conveyor complete</h3>
          <p>You guided the code packet through every room inside the machine.</p>
          <div className="lab-takeaway">
            Takeaway: Code goes through several systems before you see the result.
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
    <div
      className="game-container"
      style={{ "--game-accent": accent } as React.CSSProperties}
    >
      <div className="lab-panel">
        <div className="lab-panel-header">
          <span className="lab-room">Machine Mission</span>
          <span className="lab-step">
            Stage {placed.length + 1} of {CORRECT_CHAIN.length}
          </span>
        </div>
        <h2 className="lab-title">Code Conveyor</h2>
        <p className="lab-copy">
          Send the code packet through the right rooms in order.
        </p>
        <p className="cec-subtitle">
          Tap the next room the packet should visit.
        </p>

        <div className="lab-workspace">
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
                <span className="cec-stage-label">Room {placed.length + 1}</span>
              </div>
            )}
          </div>

          <div className="cec-choices">
            {remaining.map((s) => (
              <button
                key={s.id}
                className="cec-choice-btn"
                onClick={() => handlePick(s)}
                type="button"
              >
                <span className="cec-choice-icon">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lab-status">
          {wrong
            ? "That room comes later in the conveyor."
            : "The packet starts with human-written code and ends as visible output."}
        </div>
      </div>
    </div>
  );
}

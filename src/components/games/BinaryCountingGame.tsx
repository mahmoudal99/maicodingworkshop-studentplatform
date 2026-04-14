"use client";

import { useState, useCallback } from "react";

interface Props {
  onComplete: () => void;
  accent: string;
}

const POWERS = [16, 8, 4, 2, 1];
const TOTAL_ROUNDS = 5;

function randomTarget() {
  return Math.floor(Math.random() * 31) + 1; // 1-31
}

export default function BinaryCountingGame({ onComplete, accent }: Props) {
  const [bits, setBits] = useState<boolean[]>([false, false, false, false, false]);
  const [target, setTarget] = useState(() => randomTarget());
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<"playing" | "correct" | "done">("playing");
  const [results, setResults] = useState<number[]>([]);
  const [roundStart, setRoundStart] = useState(() => Date.now());
  const [valuePop, setValuePop] = useState(false);

  const currentValue = bits.reduce((sum, on, i) => sum + (on ? POWERS[i] : 0), 0);
  const breakdown = POWERS.filter((_, index) => bits[index]).join(" + ");

  const toggleBit = useCallback(
    (index: number) => {
      if (phase !== "playing") return;
      const next = [...bits];
      next[index] = !next[index];
      const nextValue = next.reduce(
        (sum, on, bitIndex) => sum + (on ? POWERS[bitIndex] : 0),
        0
      );

      setBits(next);
      setValuePop(true);
      setTimeout(() => setValuePop(false), 250);

      if (nextValue === target) {
        const elapsed = Date.now() - roundStart;
        setResults((prev) => [...prev, elapsed]);
        setPhase("correct");

        setTimeout(() => {
          if (round >= TOTAL_ROUNDS) {
            setPhase("done");
          } else {
            setRound((r) => r + 1);
            setBits([false, false, false, false, false]);
            setTarget(randomTarget());
            setRoundStart(Date.now());
            setPhase("playing");
          }
        }, 1200);
      }
    },
    [bits, phase, round, roundStart, target]
  );

  if (phase === "done") {
    const avgTime = Math.round(results.reduce((a, b) => a + b, 0) / results.length / 1000 * 10) / 10;
    return (
      <div className="game-container">
        <div className="lab-done">
          <div className="lab-done-icon" style={{ color: accent }}>
            CORE OK
          </div>
          <h3>Reactor stable</h3>
          <p>You powered every request by turning the right bit cells on and off.</p>
          <div className="lab-takeaway">
            Takeaway: Bits act like tiny switches that combine into bigger numbers.
          </div>
          <p style={{ color: "var(--muted2)", fontSize: 13, textAlign: "center" }}>
            Average stabilise time: {avgTime}s
          </p>
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
            Reactor {round} of {TOTAL_ROUNDS}
          </span>
        </div>
        <h2 className="lab-title">Bit Reactor</h2>
        <p className="lab-copy">
          Charge the right energy cells to match the reactor power request.
        </p>

        <div className="lab-workspace">
          <div className={`game-target${phase === "correct" ? " game-target-correct" : ""}`} style={{ color: accent, "--game-accent": accent } as React.CSSProperties}>
            {target}
          </div>

          <div className="bcg-bits">
            {POWERS.map((power, i) => (
              <div key={i} className="bcg-bit-col">
                <button
                  className={`bcg-bit-btn${bits[i] ? " bcg-bit-on" : ""}`}
                  onClick={() => toggleBit(i)}
                  type="button"
                >
                  {bits[i] ? "1" : "0"}
                </button>
                <span className="bcg-power">{power}</span>
              </div>
            ))}
          </div>

          <div className={`bcg-value${phase === "correct" ? " bcg-correct" : ""}${valuePop ? " bcg-value-pop" : ""}`}>
            Power output = {currentValue}
          </div>
          <div className="bcg-breakdown">{breakdown ? `${currentValue} = ${breakdown}` : "All cells are sleeping"}</div>
        </div>

        <div className="lab-status" style={{ color: phase === "correct" ? accent : undefined }}>
          {phase === "correct"
            ? "Reactor locked. Those glowing cells combined perfectly."
            : "Flip cells on and off until the output matches the target."}
        </div>
      </div>
    </div>
  );
}

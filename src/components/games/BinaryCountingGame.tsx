"use client";

import { useState, useCallback, useEffect } from "react";

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
  const [roundStart, setRoundStart] = useState(Date.now());

  const currentValue = bits.reduce((sum, on, i) => sum + (on ? POWERS[i] : 0), 0);

  const toggleBit = useCallback(
    (index: number) => {
      if (phase !== "playing") return;
      setBits((prev) => {
        const next = [...prev];
        next[index] = !next[index];
        return next;
      });
    },
    [phase]
  );

  // Check if correct
  useEffect(() => {
    if (phase !== "playing") return;
    if (currentValue === target) {
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
  }, [currentValue, target, phase, round, roundStart]);

  if (phase === "done") {
    const avgTime = Math.round(results.reduce((a, b) => a + b, 0) / results.length / 1000 * 10) / 10;
    return (
      <div className="game-container">
        <div className="game-target" style={{ color: accent, fontSize: 36 }}>
          {TOTAL_ROUNDS}/{TOTAL_ROUNDS} Rounds Complete!
        </div>
        <p style={{ color: "var(--muted2)", fontSize: 14, textAlign: "center" }}>
          Average time: {avgTime}s per round
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
      <p className="game-round">Round {round} of {TOTAL_ROUNDS}</p>
      <p className="game-instruction">Toggle the bits to make</p>
      <div className="game-target" style={{ color: accent }}>{target}</div>

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

      <div className={`bcg-value${phase === "correct" ? " bcg-correct" : ""}`}>
        = {currentValue}
      </div>

      <div className="game-feedback" style={{ color: phase === "correct" ? accent : "transparent" }}>
        {phase === "correct" ? "Correct!" : "\u00A0"}
      </div>
    </div>
  );
}

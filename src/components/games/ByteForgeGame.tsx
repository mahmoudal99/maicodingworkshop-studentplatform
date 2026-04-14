"use client";

import { useCallback, useState } from "react";

interface Props {
  onComplete: () => void;
  accent: string;
}

const CAPSULES = [
  { icon: "A", label: "Letter capsule" },
  { icon: "★", label: "Badge capsule" },
  { icon: "⚙", label: "Tool capsule" },
];

function freshCells() {
  return new Array(8).fill(false);
}

export default function ByteForgeGame({ onComplete, accent }: Props) {
  const [cells, setCells] = useState<boolean[]>(() => freshCells());
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<"charging" | "sealed" | "done">(
    "charging"
  );

  const activeCount = cells.filter(Boolean).length;
  const capsule = CAPSULES[round];

  const toggleCell = useCallback(
    (index: number) => {
      if (phase !== "charging") return;
      const next = [...cells];
      next[index] = !next[index];
      const nextCount = next.filter(Boolean).length;

      setCells(next);

      if (nextCount === 8) {
        setPhase("sealed");
        setTimeout(() => {
          if (round === CAPSULES.length - 1) {
            setPhase("done");
            return;
          }
          setRound((prev) => prev + 1);
          setCells(freshCells());
          setPhase("charging");
        }, 900);
      }
    },
    [cells, phase, round]
  );

  if (phase === "done") {
    return (
      <div className="game-container">
        <div className="lab-done">
          <div className="lab-done-icon" style={{ color: accent }}>
            1 BYTE
          </div>
          <h3>Byte forged</h3>
          <p>Those eight glowing bit slots just sealed into one byte capsule.</p>
          <div className="lab-takeaway">
            Takeaway: A byte is 8 bits working together.
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
          <span className="lab-room">System Room</span>
          <span className="lab-step">
            Capsule {round + 1} of {CAPSULES.length}
          </span>
        </div>
        <h2 className="lab-title">Byte Forge</h2>
        <p className="lab-copy">
          Fill every bit slot to seal one byte capsule for the machine.
        </p>

        <div className="lab-workspace">
          <div className={`bfg-core${phase === "sealed" ? " bfg-core-sealed" : ""}`}>
            <div className="bfg-core-label">Forge Core</div>
            <div className="bfg-core-icon">{capsule.icon}</div>
            <div className="bfg-core-count">{activeCount}/8 bits charged</div>
          </div>

          <div className="bfg-grid">
            {cells.map((active, index) => (
              <button
                key={index}
                className={`bfg-cell${active ? " bfg-cell-on" : ""}`}
                onClick={() => toggleCell(index)}
                type="button"
                aria-label={active ? `Disable bit ${index + 1}` : `Enable bit ${index + 1}`}
              >
                {active ? 1 : 0}
              </button>
            ))}
          </div>
        </div>

        <div className="lab-status" style={{ color: phase === "sealed" ? accent : undefined }}>
          {phase === "sealed"
            ? `${capsule.label} sealed. Eight bits became one byte.`
            : "Charge all 8 slots to compress them into one byte."}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useMemo, useState } from "react";
import { pickWithSeed } from "@/lib/game/randomize";
import { useUser } from "@/lib/store";

interface Props {
  onComplete: () => void;
  accent: string;
}

interface CapsuleChallenge {
  id: string;
  icon: string;
  label: string;
  objective: string;
  modeLabel: string;
  targetLabel: string;
  statusHint: string;
  successLine: string;
  targetBits: boolean[];
  initialBits: boolean[];
  lockedBits: boolean[];
}

const BIT_WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];

const CHARGE_CHALLENGE: CapsuleChallenge = {
  id: "shell-byte",
  icon: "8",
  label: "Byte shell",
  objective: "Charge every slot to forge one full byte shell.",
  modeLabel: "Charge all 8",
  targetLabel: "Full byte shell",
  statusHint: "First forge: every bit must be on. A byte is 8 live bits together.",
  successLine: "Shell sealed. Next forge: match an exact byte pattern.",
  targetBits: new Array(8).fill(true),
  initialBits: new Array(8).fill(false),
  lockedBits: new Array(8).fill(false),
};

const BADGE_CHALLENGE_OPTIONS: CapsuleChallenge[] = [
  {
    id: "badge-a",
    icon: "A",
    label: "Badge capsule",
    objective: "Match the byte pattern that encodes the badge letter A.",
    modeLabel: "Match pattern",
    targetLabel: "Letter A",
    statusHint: "Now precision matters. Match the byte exactly to seal the badge capsule.",
    successLine: "Badge encoded. Final forge: repair a damaged byte with locked bits.",
    targetBits: [false, true, false, false, false, false, false, true],
    initialBits: new Array(8).fill(false),
    lockedBits: new Array(8).fill(false),
  },
  {
    id: "badge-c",
    icon: "C",
    label: "Badge capsule",
    objective: "Match the byte pattern that encodes the badge letter C.",
    modeLabel: "Match pattern",
    targetLabel: "Letter C",
    statusHint: "Now precision matters. Match the byte exactly to seal the badge capsule.",
    successLine: "Badge encoded. Final forge: repair a damaged byte with locked bits.",
    targetBits: [false, true, false, false, false, false, true, true],
    initialBits: new Array(8).fill(false),
    lockedBits: new Array(8).fill(false),
  },
  {
    id: "badge-p",
    icon: "P",
    label: "Badge capsule",
    objective: "Match the byte pattern that encodes the badge letter P.",
    modeLabel: "Match pattern",
    targetLabel: "Letter P",
    statusHint: "Now precision matters. Match the byte exactly to seal the badge capsule.",
    successLine: "Badge encoded. Final forge: repair a damaged byte with locked bits.",
    targetBits: [false, true, false, true, false, false, false, false],
    initialBits: new Array(8).fill(false),
    lockedBits: new Array(8).fill(false),
  },
];

const REPAIR_CHALLENGE_OPTIONS: CapsuleChallenge[] = [
  {
    id: "tool-repair",
    icon: "⚙",
    label: "Tool capsule",
    objective: "Repair the damaged byte. Locked sockets stay fixed while you patch the loose ones.",
    modeLabel: "Repair byte",
    targetLabel: "Tool checksum",
    statusHint: "The locked bits are stable. Fix only the loose sockets to restore the tool capsule.",
    successLine: "Tool capsule repaired. One byte can hold a precise pattern, not just full power.",
    targetBits: [true, false, true, true, false, true, false, false],
    initialBits: [true, true, false, true, true, false, false, false],
    lockedBits: [true, false, false, true, false, false, true, true],
  },
  {
    id: "drone-repair",
    icon: "🛸",
    label: "Drone capsule",
    objective: "Repair the damaged byte. Locked sockets stay fixed while you patch the loose ones.",
    modeLabel: "Repair byte",
    targetLabel: "Drone checksum",
    statusHint: "The locked bits are stable. Fix only the loose sockets to restore the drone capsule.",
    successLine: "Drone capsule repaired. One byte can hold a precise pattern, not just full power.",
    targetBits: [false, true, true, false, true, false, true, false],
    initialBits: [false, false, false, false, true, true, true, false],
    lockedBits: [true, false, false, true, true, false, true, true],
  },
  {
    id: "dock-repair",
    icon: "🔧",
    label: "Dock capsule",
    objective: "Repair the damaged byte. Locked sockets stay fixed while you patch the loose ones.",
    modeLabel: "Repair byte",
    targetLabel: "Dock checksum",
    statusHint: "The locked bits are stable. Fix only the loose sockets to restore the dock capsule.",
    successLine: "Dock capsule repaired. One byte can hold a precise pattern, not just full power.",
    targetBits: [true, true, false, false, true, false, true, true],
    initialBits: [true, false, false, true, false, false, true, false],
    lockedBits: [true, false, true, false, false, true, true, false],
  },
];

function cloneBits(bits: boolean[]) {
  return [...bits];
}

function formatPattern(bits: boolean[]) {
  return bits.map((bit) => (bit ? "1" : "0")).join("");
}

function isChallengeSolved(challenge: CapsuleChallenge, cells: boolean[]) {
  return cells.every((cell, index) => cell === challenge.targetBits[index]);
}

export default function ByteForgeGame({ onComplete, accent }: Props) {
  const { userId } = useUser();
  const [challenges] = useState(() => [
    CHARGE_CHALLENGE,
    pickWithSeed(BADGE_CHALLENGE_OPTIONS, `${userId}:byte-forge:badge`),
    pickWithSeed(REPAIR_CHALLENGE_OPTIONS, `${userId}:byte-forge:repair`),
  ]);
  const [round, setRound] = useState(0);
  const [cells, setCells] = useState<boolean[]>(() => cloneBits(challenges[0].initialBits));
  const [phase, setPhase] = useState<"charging" | "sealed" | "done">("charging");

  const challenge = challenges[round];
  const activeCount = cells.filter(Boolean).length;
  const matchedCount = cells.reduce(
    (count, cell, index) => count + Number(cell === challenge.targetBits[index]),
    0,
  );
  const currentPattern = useMemo(() => formatPattern(cells), [cells]);
  const targetPattern = useMemo(() => formatPattern(challenge.targetBits), [challenge.targetBits]);

  const advanceRound = useCallback(() => {
    if (round === challenges.length - 1) {
      setPhase("done");
      return;
    }

    const nextRound = round + 1;
    setRound(nextRound);
    setCells(cloneBits(challenges[nextRound].initialBits));
    setPhase("charging");
  }, [challenges, round]);

  const toggleCell = useCallback(
    (index: number) => {
      if (phase !== "charging" || challenge.lockedBits[index]) return;

      const next = [...cells];
      next[index] = !next[index];
      setCells(next);

      if (isChallengeSolved(challenge, next)) {
        setPhase("sealed");
        window.setTimeout(() => {
          advanceRound();
        }, 1100);
      }
    },
    [advanceRound, cells, challenge, phase],
  );

  if (phase === "done") {
    return (
      <div className="game-container">
        <div className="lab-done">
          <div className="lab-done-icon" style={{ color: accent }}>
            1 BYTE
          </div>
          <h3>Byte forged</h3>
          <p>You charged a full shell, matched a letter byte, and repaired a damaged byte.</p>
          <div className="lab-takeaway">
            Takeaway: A byte is 8 bits, and the exact 0/1 pattern is what gives it meaning.
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
          <span className="lab-step">Capsule {round + 1} of {challenges.length}</span>
        </div>
        <h2 className="lab-title">Byte Forge</h2>
        <p className="lab-copy">{challenge.objective}</p>

        <div className="lab-workspace">
          <div className={`bfg-core${phase === "sealed" ? " bfg-core-sealed" : ""}`}>
            <div className="bfg-core-topline">
              <span className="bfg-core-label">Forge Core</span>
              <span className="bfg-core-mode">{challenge.modeLabel}</span>
            </div>
            <div className="bfg-core-icon">{challenge.icon}</div>
            <div className="bfg-core-count">
              {challenge.id === "shell-byte" ? `${activeCount}/8 sockets charged` : `${matchedCount}/8 bits aligned`}
            </div>
          </div>

          <div className="bfg-byte-readout">
            <div className="bfg-byte-card">
              <span className="bfg-byte-label">Target byte</span>
              <div className="bfg-byte-strip" aria-label={`Target pattern ${targetPattern}`}>
                {challenge.targetBits.map((bit, index) => (
                  <span key={`target-${challenge.id}-${index}`} className={`bfg-byte-bit${bit ? " bfg-byte-bit-on" : ""}`}>
                    {bit ? 1 : 0}
                  </span>
                ))}
              </div>
              <strong>{targetPattern}</strong>
              <small>{challenge.targetLabel}</small>
            </div>

            <div className="bfg-byte-card">
              <span className="bfg-byte-label">Current byte</span>
              <div className="bfg-byte-strip" aria-label={`Current pattern ${currentPattern}`}>
                {cells.map((bit, index) => (
                  <span
                    key={`current-${challenge.id}-${index}`}
                    className={`bfg-byte-bit${bit ? " bfg-byte-bit-on" : ""}${
                      bit === challenge.targetBits[index] ? " bfg-byte-bit-match" : " bfg-byte-bit-miss"
                    }`}
                  >
                    {bit ? 1 : 0}
                  </span>
                ))}
              </div>
              <strong>{currentPattern}</strong>
              <small>{matchedCount}/8 aligned</small>
            </div>
          </div>

          <div className="bfg-grid">
            {cells.map((active, index) => {
              const locked = challenge.lockedBits[index];
              const matchesTarget = active === challenge.targetBits[index];

              return (
                <button
                  key={`${challenge.id}-${index}`}
                  className={`bfg-cell${active ? " bfg-cell-on" : ""}${locked ? " bfg-cell-locked" : ""}${
                    matchesTarget ? " bfg-cell-match" : " bfg-cell-miss"
                  }`}
                  onClick={() => toggleCell(index)}
                  type="button"
                  disabled={phase !== "charging" || locked}
                  aria-label={
                    locked
                      ? `Bit ${index + 1} locked at ${active ? 1 : 0}`
                      : active
                      ? `Disable bit ${index + 1}`
                      : `Enable bit ${index + 1}`
                  }
                >
                  <span className="bfg-cell-weight">{BIT_WEIGHTS[index]}</span>
                  <span className="bfg-cell-value">{active ? 1 : 0}</span>
                  <span className="bfg-cell-tag">{locked ? "LOCK" : matchesTarget ? "SYNC" : "TUNE"}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lab-status" style={{ color: phase === "sealed" ? accent : undefined }}>
          {phase === "sealed" ? challenge.successLine : challenge.statusHint}
        </div>
      </div>
    </div>
  );
}

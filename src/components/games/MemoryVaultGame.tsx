"use client";

import { useCallback, useState } from "react";

interface Props {
  onComplete: () => void;
  accent: string;
}

type MemoryHome = "ram" | "storage";

interface MemoryItem {
  icon: string;
  label: string;
  home: MemoryHome;
  reason: string;
}

const MEMORY_ITEMS: MemoryItem[] = [
  {
    icon: "🎮",
    label: "The level you are playing right now",
    home: "ram",
    reason: "RAM holds what the machine is using right now.",
  },
  {
    icon: "📸",
    label: "A photo saved for later",
    home: "storage",
    reason: "Storage keeps files even after the machine powers down.",
  },
  {
    icon: "🎵",
    label: "A song the machine is playing right now",
    home: "ram",
    reason: "Playing something now means the machine keeps it ready in RAM.",
  },
  {
    icon: "📝",
    label: "A finished homework file you saved yesterday",
    home: "storage",
    reason: "Saved work lives in storage until you open it again.",
  },
  {
    icon: "🧭",
    label: "The map the machine is using right this second",
    home: "ram",
    reason: "Active data needs quick access, so it stays in RAM.",
  },
  {
    icon: "🎞️",
    label: "A video kept on the device for later",
    home: "storage",
    reason: "Kept for later means it belongs in storage.",
  },
];

export default function MemoryVaultGame({ onComplete, accent }: Props) {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [locked, setLocked] = useState(false);
  const [done, setDone] = useState(false);
  const item = MEMORY_ITEMS[index];

  const handleChoice = useCallback(
    (choice: MemoryHome) => {
      if (locked) return;

      setLocked(true);
      setFeedback(
        choice === item.home ? item.reason : `Not quite. ${item.reason}`
      );

      setTimeout(() => {
        if (index === MEMORY_ITEMS.length - 1) {
          setDone(true);
          return;
        }
        setIndex((prev) => prev + 1);
        setFeedback("");
        setLocked(false);
      }, 1100);
    },
    [index, item.home, item.reason, locked]
  );

  if (done) {
    return (
      <div className="game-container">
        <div className="lab-done">
          <div className="lab-done-icon" style={{ color: accent }}>
            RAM / SAVE
          </div>
          <h3>Vault sorted</h3>
          <p>You separated live machine memory from files saved for later.</p>
          <div className="lab-takeaway">
            Takeaway: RAM is for now. Storage is for later.
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
            Sort {index + 1} of {MEMORY_ITEMS.length}
          </span>
        </div>
        <h2 className="lab-title">Memory Vault</h2>
        <p className="lab-copy">
          Send each item to the right place inside the machine.
        </p>

        <div className="lab-workspace">
          <div className="mvg-item-card">
            <div className="mvg-item-icon">{item.icon}</div>
            <div className="mvg-item-label">{item.label}</div>
          </div>

          <div className="mvg-choices">
            <button
              className="mvg-choice mvg-choice-ram"
              onClick={() => handleChoice("ram")}
              type="button"
              disabled={locked}
              style={{ borderColor: accent }}
            >
              <span className="mvg-choice-title">Use Now</span>
              <span className="mvg-choice-sub">RAM Desk</span>
            </button>
            <button
              className="mvg-choice mvg-choice-storage"
              onClick={() => handleChoice("storage")}
              type="button"
              disabled={locked}
            >
              <span className="mvg-choice-title">Keep For Later</span>
              <span className="mvg-choice-sub">Storage Vault</span>
            </button>
          </div>
        </div>

        <div className="lab-status">
          {feedback || "Pick the room where this item belongs."}
        </div>
      </div>
    </div>
  );
}

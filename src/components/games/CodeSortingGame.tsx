"use client";

import { useState, useCallback } from "react";

interface Props {
  onComplete: () => void;
  accent: string;
}

interface Challenge {
  title: string;
  steps: string[];
}

const CHALLENGES: Challenge[] = [
  {
    title: "Wake the scout bot",
    steps: [
      "Press the scout bot power switch",
      "Wait for the boot lights",
      "Load the mission chip",
      "Tell the bot to stand by",
      "Send the start command",
    ],
  },
  {
    title: "Open the shield door",
    steps: [
      "Tap the door panel",
      "Enter the access code",
      "Wait for the machine to check it",
      "Press unlock",
      "Walk through the open door",
    ],
  },
  {
    title: "Deliver an energy cell",
    steps: [
      "Pick up the energy cell",
      "Carry it to the charger bay",
      "Place it in the slot",
      "Wait for the charge light",
      "Return to the control path",
    ],
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

export default function CodeSortingGame({ onComplete, accent }: Props) {
  const [round, setRound] = useState(0);
  const [shuffled, setShuffled] = useState(() => shuffle(CHALLENGES[0].steps));
  const [selected, setSelected] = useState<string[]>([]);
  const [wrong, setWrong] = useState(false);
  const [done, setDone] = useState(false);

  const challenge = CHALLENGES[round];
  const correctOrder = challenge.steps;

  const handlePick = useCallback(
    (step: string) => {
      const nextSelected = [...selected, step];
      const expectedIndex = nextSelected.length - 1;

      if (step !== correctOrder[expectedIndex]) {
        setWrong(true);
        setTimeout(() => setWrong(false), 600);
        return;
      }

      setSelected(nextSelected);

      if (nextSelected.length === correctOrder.length) {
        // Round complete
        setTimeout(() => {
          if (round + 1 < CHALLENGES.length) {
            const nextRound = round + 1;
            setRound(nextRound);
            setShuffled(shuffle(CHALLENGES[nextRound].steps));
            setSelected([]);
          } else {
            setDone(true);
          }
        }, 800);
      }
    },
    [selected, correctOrder, round]
  );

  if (done) {
    return (
      <div className="game-container">
        <div className="lab-done">
          <div className="lab-done-icon" style={{ color: accent }}>
            CMD OK
          </div>
          <h3>Commands accepted</h3>
          <p>The lab robots only finished each mission when the steps were in the right order.</p>
          <div className="lab-takeaway">
            Takeaway: Code is a sequence of precise steps.
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

  const remaining = shuffled.filter((s) => !selected.includes(s));

  return (
    <div
      className="game-container"
      style={{ "--game-accent": accent } as React.CSSProperties}
    >
      <div className="lab-panel">
        <div className="lab-panel-header">
          <span className="lab-room">Machine Mission</span>
          <span className="lab-step">
            Mission {round + 1} of {CHALLENGES.length}
          </span>
        </div>
        <h2 className="lab-title">Command Builder</h2>
        <p className="lab-copy">
          Put the robot steps in order so the mission can run.
        </p>
        <p className="csg-title">
          Mission: <strong>{challenge.title}</strong>
        </p>

        <div className="lab-workspace">
          <div className="csg-placed">
            {selected.map((s, i) => (
              <div key={i} className="csg-placed-step" style={{ borderLeftColor: accent }}>
                <span className="csg-step-num">{i + 1}</span>
                {s}
              </div>
            ))}
            {selected.length < correctOrder.length && (
              <div className={`csg-placeholder${wrong ? " csg-shake" : ""}`}>
                <span className="csg-step-num">{selected.length + 1}</span>
                Pick the next command...
              </div>
            )}
          </div>

          <div className="csg-choices">
            {remaining.map((s) => (
              <button
                key={s}
                className="csg-choice-btn"
                onClick={() => handlePick(s)}
                type="button"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="lab-status">
          {wrong
            ? "That command happens at a different point in the mission."
            : "Robots follow steps exactly in the order you give them."}
        </div>
      </div>
    </div>
  );
}

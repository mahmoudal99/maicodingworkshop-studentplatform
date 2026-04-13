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
    title: "Make a cup of tea",
    steps: [
      "Boil the kettle",
      "Put a teabag in the cup",
      "Pour hot water into the cup",
      "Wait 2 minutes",
      "Remove the teabag",
      "Drink the tea",
    ],
  },
  {
    title: "Log in to a website",
    steps: [
      "Open the browser",
      "Type the website URL",
      "Click the login button",
      "Enter your username",
      "Enter your password",
      "Click submit",
    ],
  },
  {
    title: "Send a text message",
    steps: [
      "Unlock your phone",
      "Open the messaging app",
      "Choose the contact",
      "Type your message",
      "Check for typos",
      "Press send",
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
        <div className="csg-done">
          <div className="csg-done-icon">🎯</div>
          <h3>You think like a coder!</h3>
          <p>
            Coding is exactly this — writing precise instructions in the right
            order. A computer follows your steps exactly, so the order matters.
          </p>
          <button
            className="csg-finish-btn"
            style={{ background: accent }}
            onClick={onComplete}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  const remaining = shuffled.filter((s) => !selected.includes(s));

  return (
    <div className="game-container">
      <p className="game-instruction">
        Round {round + 1} of {CHALLENGES.length}
      </p>
      <p className="csg-title">
        PUT THE STEPS IN ORDER: <strong>{challenge.title}</strong>
      </p>

      {/* Already placed steps */}
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
            Pick the next step…
          </div>
        )}
      </div>

      {/* Remaining choices */}
      <div className="csg-choices">
        {remaining.map((s) => (
          <button
            key={s}
            className="csg-choice-btn"
            onClick={() => handlePick(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

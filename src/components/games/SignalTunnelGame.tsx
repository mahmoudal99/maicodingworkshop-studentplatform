"use client";

import { useCallback, useState } from "react";

interface Props {
  onComplete: () => void;
  accent: string;
}

interface TunnelStep {
  id: string;
  stage: "Input" | "Process" | "Output";
  label: string;
}

interface TunnelScenario {
  icon: string;
  prompt: string;
  steps: TunnelStep[];
}

const SCENARIOS: TunnelScenario[] = [
  {
    icon: "🚪",
    prompt: "Open the lab door when the button is pressed.",
    steps: [
      { id: "door-input", stage: "Input", label: "The door button gets pressed" },
      { id: "door-process", stage: "Process", label: "The machine checks the signal" },
      { id: "door-output", stage: "Output", label: "The door slides open" },
    ],
  },
  {
    icon: "💡",
    prompt: "Turn on the warning lamp when the sensor detects motion.",
    steps: [
      { id: "lamp-input", stage: "Input", label: "The motion sensor detects movement" },
      { id: "lamp-process", stage: "Process", label: "The controller decides what to do" },
      { id: "lamp-output", stage: "Output", label: "The warning lamp lights up" },
    ],
  },
  {
    icon: "🔊",
    prompt: "Play a sound after the launch button is tapped.",
    steps: [
      { id: "sound-input", stage: "Input", label: "The launch button gets tapped" },
      { id: "sound-process", stage: "Process", label: "The machine reads the command" },
      { id: "sound-output", stage: "Output", label: "The speakers play a sound" },
    ],
  },
];

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export default function SignalTunnelGame({ onComplete, accent }: Props) {
  const [round, setRound] = useState(0);
  const [placed, setPlaced] = useState<TunnelStep[]>([]);
  const [choices, setChoices] = useState<TunnelStep[]>(() =>
    shuffle(SCENARIOS[0].steps)
  );
  const [feedback, setFeedback] = useState("Route the signal through the tunnel.");
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const scenario = SCENARIOS[round];

  const handlePick = useCallback(
    (step: TunnelStep) => {
      const expected = scenario.steps[placed.length];
      if (!expected) return;

      if (step.stage !== expected.stage) {
        setWrongId(step.id);
        setFeedback(`That belongs in ${step.stage}. Start with the signal entering the machine.`);
        setTimeout(() => setWrongId(null), 500);
        return;
      }

      const nextPlaced = [...placed, step];
      setPlaced(nextPlaced);
      setFeedback(step.label);

      if (nextPlaced.length === scenario.steps.length) {
        setTimeout(() => {
          if (round === SCENARIOS.length - 1) {
            setDone(true);
            return;
          }

          const nextRound = round + 1;
          setRound(nextRound);
          setPlaced([]);
          setChoices(shuffle(SCENARIOS[nextRound].steps));
          setFeedback("Route the signal through the tunnel.");
        }, 900);
      }
    },
    [placed, round, scenario.steps]
  );

  if (done) {
    return (
      <div className="game-container">
        <div className="lab-done">
          <div className="lab-done-icon" style={{ color: accent }}>
            I → P → O
          </div>
          <h3>Signal locked in</h3>
          <p>The tunnel carried each mission from input to process to output.</p>
          <div className="lab-takeaway">
            Takeaway: Computers take something in, work on it, and send something out.
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
            Tunnel {round + 1} of {SCENARIOS.length}
          </span>
        </div>
        <h2 className="lab-title">Signal Tunnel</h2>
        <p className="lab-copy">
          {scenario.icon} {scenario.prompt}
        </p>

        <div className="lab-workspace">
          <div className="stg-track">
            {(["Input", "Process", "Output"] as const).map((stage, index) => {
              const step = placed[index];
              const active = step?.stage === stage;

              return (
                <div
                  key={stage}
                  className={`stg-slot${active ? " stg-slot-active" : ""}`}
                  style={
                    active
                      ? ({
                          borderColor: accent,
                          background: `${accent}18`,
                        } as React.CSSProperties)
                      : undefined
                  }
                >
                  <div className="stg-slot-label">{stage}</div>
                  <div className="stg-slot-text">
                    {active ? step.label : "Waiting for signal..."}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="stg-choices">
            {choices
              .filter((step) => !placed.some((placedStep) => placedStep.id === step.id))
              .map((step) => (
                <button
                  key={step.id}
                  className={`stg-choice${wrongId === step.id ? " stg-choice-wrong" : ""}`}
                  onClick={() => handlePick(step)}
                  type="button"
                >
                  <span className="stg-choice-stage">{step.stage}</span>
                  <span>{step.label}</span>
                </button>
              ))}
          </div>
        </div>

        <div className="lab-status">{feedback}</div>
      </div>
    </div>
  );
}

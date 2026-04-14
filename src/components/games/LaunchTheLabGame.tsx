"use client";

import { useCallback, useState } from "react";

interface Props {
  onComplete: () => void;
  accent: string;
}

const BOOT_STEPS = [
  {
    title: "Power the boot core to 5.",
    hint: "Flip the right bits to hit the target.",
  },
  {
    title: "Choose where the active game level should live.",
    hint: "Pick the fast memory used right now.",
  },
  {
    title: "The CPU finished the command. Where should the result appear?",
    hint: "Output is what the user can see or hear.",
  },
] as const;

export default function LaunchTheLabGame({ onComplete, accent }: Props) {
  const [step, setStep] = useState(0);
  const [bits, setBits] = useState<boolean[]>([false, false, false]);
  const [feedback, setFeedback] = useState("Wake the machine one system at a time.");
  const [done, setDone] = useState(false);

  const value = bits.reduce((sum, active, index) => {
    const powers = [4, 2, 1];
    return sum + (active ? powers[index] : 0);
  }, 0);

  const toggleBit = useCallback(
    (index: number) => {
      if (step !== 0) return;
      const next = [...bits];
      next[index] = !next[index];
      const nextValue = next.reduce((sum, active, bitIndex) => {
        const powers = [4, 2, 1];
        return sum + (active ? powers[bitIndex] : 0);
      }, 0);

      setBits(next);

      if (nextValue === 5) {
        setFeedback("Boot core online. The machine now has power.");
        setTimeout(() => setStep(1), 850);
      }
    },
    [bits, step]
  );

  const handleChoice = useCallback(
    (choice: "ram" | "storage" | "screen" | "speaker") => {
      if (step === 1) {
        if (choice === "ram") {
          setFeedback("Live data belongs in RAM so the machine can use it fast.");
          setTimeout(() => setStep(2), 850);
        } else {
          setFeedback("That would save it for later. Active play data needs RAM.");
        }
        return;
      }

      if (step === 2) {
        if (choice === "screen") {
          setFeedback("Result launched. The lab is fully online.");
          setTimeout(() => setDone(true), 850);
        } else {
          setFeedback("Close. Output should appear where the user can see it.");
        }
      }
    },
    [step]
  );

  if (done) {
    return (
      <div className="game-container">
        <div className="lab-done">
          <div className="lab-done-icon" style={{ color: accent }}>
            LAB ON
          </div>
          <h3>Inside the Machine is online</h3>
          <p>You powered the core, chose the right memory, and launched the output.</p>
          <div className="lab-takeaway">
            Takeaway: Bits, memory, and code flow work together to make the machine run.
          </div>
          <button
            className="game-btn"
            style={{ background: accent }}
            onClick={onComplete}
            type="button"
          >
            Finish Week Room
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
            Boot Step {step + 1} of {BOOT_STEPS.length}
          </span>
        </div>
        <h2 className="lab-title">Launch the Lab</h2>
        <p className="lab-copy">{BOOT_STEPS[step].title}</p>

        <div className="lab-workspace">
          <div className="ltl-meter">
            {BOOT_STEPS.map((bootStep, bootIndex) => (
              <div
                key={bootStep.title}
                className={`ltl-meter-node${bootIndex <= step ? " ltl-meter-node-on" : ""}`}
                style={
                  bootIndex <= step
                    ? ({ borderColor: accent, background: `${accent}18` } as React.CSSProperties)
                    : undefined
                }
              >
                {bootIndex + 1}
              </div>
            ))}
          </div>

          {step === 0 && (
            <div className="ltl-step-card">
              <div className="ltl-target">Target: 5</div>
              <div className="ltl-bits">
                {[4, 2, 1].map((power, index) => (
                  <button
                    key={power}
                    className={`ltl-bit${bits[index] ? " ltl-bit-on" : ""}`}
                    onClick={() => toggleBit(index)}
                    type="button"
                  >
                    <span>{bits[index] ? 1 : 0}</span>
                    <small>{power}</small>
                  </button>
                ))}
              </div>
              <div className="ltl-current">Current power: {value}</div>
            </div>
          )}

          {step === 1 && (
            <div className="ltl-choices">
              <button className="ltl-choice" onClick={() => handleChoice("ram")} type="button">
                RAM Desk
              </button>
              <button className="ltl-choice" onClick={() => handleChoice("storage")} type="button">
                Storage Vault
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="ltl-choices">
              <button className="ltl-choice" onClick={() => handleChoice("screen")} type="button">
                Screen Wall
              </button>
              <button className="ltl-choice" onClick={() => handleChoice("speaker")} type="button">
                Speaker Dock
              </button>
            </div>
          )}
        </div>

        <div className="lab-status">
          {feedback || BOOT_STEPS[step].hint}
        </div>
      </div>
    </div>
  );
}

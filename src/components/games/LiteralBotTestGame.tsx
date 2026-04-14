"use client";

import { useCallback, useState } from "react";

interface Props {
  onComplete: () => void;
  accent: string;
}

interface CommandChoice {
  label: string;
  result: string;
}

interface BotMission {
  mission: string;
  choices: CommandChoice[];
  correctIndex: number;
}

const MISSIONS: BotMission[] = [
  {
    mission: "Get the bot to light the blue lamp.",
    choices: [
      { label: "Turn it on", result: "The bot lights the nearest lamp, not the blue one." },
      { label: "Turn on the blue lamp", result: "The bot finds the blue lamp and powers it on." },
      { label: "Make the room bright", result: "The bot opens the window shades instead." },
    ],
    correctIndex: 1,
  },
  {
    mission: "Tell the bot which battery to charge.",
    choices: [
      { label: "Charge the battery", result: "The bot picks a random battery." },
      { label: "Charge the battery on the left", result: "The bot takes the left battery to the charger." },
      { label: "Fix the power", result: "The bot starts checking cables instead." },
    ],
    correctIndex: 1,
  },
  {
    mission: "Make the bot place the cube on the red pad.",
    choices: [
      { label: "Move the cube", result: "The bot slides the cube to the middle of the room." },
      { label: "Put the cube on the red pad", result: "The bot places the cube exactly on the red pad." },
      { label: "Tidy up", result: "The bot stacks everything in a storage bin." },
    ],
    correctIndex: 1,
  },
];

export default function LiteralBotTestGame({ onComplete, accent }: Props) {
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const mission = MISSIONS[round];

  const handlePick = useCallback(
    (choiceIndex: number) => {
      const choice = mission.choices[choiceIndex];
      setSelected(choiceIndex);

      if (choiceIndex !== mission.correctIndex) {
        setFeedback(`${choice.result} Try a more exact command.`);
        return;
      }

      setFeedback(choice.result);
      setTimeout(() => {
        if (round === MISSIONS.length - 1) {
          setDone(true);
          return;
        }
        setRound((prev) => prev + 1);
        setSelected(null);
        setFeedback("");
      }, 1000);
    },
    [mission, round]
  );

  if (done) {
    return (
      <div className="game-container">
        <div className="lab-done">
          <div className="lab-done-icon" style={{ color: accent }}>
            BOT OK
          </div>
          <h3>Bot calibrated</h3>
          <p>The lab bot only worked when the instructions were exact.</p>
          <div className="lab-takeaway">
            Takeaway: Code works best when your instructions are precise.
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
            Test {round + 1} of {MISSIONS.length}
          </span>
        </div>
        <h2 className="lab-title">Literal Bot Test</h2>
        <p className="lab-copy">{mission.mission}</p>

        <div className="lab-workspace">
          <div className="lbt-bot-card">
            <div className="lbt-bot-face">◉_◉</div>
            <div className="lbt-bot-text">The bot follows commands exactly as written.</div>
          </div>

          <div className="lbt-choices">
            {mission.choices.map((choice, choiceIndex) => {
              const isCorrect = choiceIndex === mission.correctIndex;
              const isSelected = choiceIndex === selected;

              return (
                <button
                  key={choice.label}
                  className={`lbt-choice${isSelected ? " lbt-choice-selected" : ""}${
                    isSelected && !isCorrect ? " lbt-choice-wrong" : ""
                  }`}
                  onClick={() => handlePick(choiceIndex)}
                  type="button"
                  style={
                    isSelected && isCorrect
                      ? ({ borderColor: accent, background: `${accent}18` } as React.CSSProperties)
                      : undefined
                  }
                >
                  {choice.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lab-status">
          {feedback || "Choose the clearest command for the bot."}
        </div>
      </div>
    </div>
  );
}

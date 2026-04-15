"use client";

import { useEffect, useState } from "react";
import GameScene from "@/components/game/GameScene";
import { useCompanion } from "@/lib/game/use-companion";
import { pickWithSeed } from "@/lib/game/randomize";
import { useGameMeta } from "@/lib/game/use-game-meta";
import { useParticles } from "@/lib/game/use-particles";
import { useSound } from "@/lib/game/use-sound";
import { useUser } from "@/lib/store";

interface Props {
  onComplete: () => void;
  accent: string;
}

const POWERS = [16, 8, 4, 2, 1];
const TARGET_POOLS = [
  [5, 6, 9, 10, 12],
  [11, 13, 14, 18, 19],
  [21, 22, 25, 26, 28],
];

function freshBits() {
  return POWERS.map(() => false);
}

export default function BinaryCountingGame({ onComplete, accent }: Props) {
  const { userId, userName } = useUser();
  const {
    character: byteCharacter,
    dialogue: byteDialogue,
    mood: byteMood,
    say: byteSay,
    celebrate: byteCelebrate,
    alert: byteAlert,
  } = useCompanion("byte");
  const {
    character: echoCharacter,
    dialogue: echoDialogue,
    mood: echoMood,
    say: echoSay,
  } = useCompanion("echo");
  const { playTap, playCorrect, playWrong, playCombo, playComplete } = useSound();
  const { containerRef, burst } = useParticles();
  const [targets] = useState(() =>
    TARGET_POOLS.map((pool, index) => pickWithSeed(pool, `${userId}:binary-door:${index}`))
  );
  const { stability, combo, recordCorrect, recordWrong } = useGameMeta(targets.length);

  const [round, setRound] = useState(0);
  const [bits, setBits] = useState<boolean[]>(freshBits);
  const [statusText, setStatusText] = useState(
    "Flip the switch deck until the corridor door reads the right power."
  );
  const [phase, setPhase] = useState<"ready" | "opening" | "complete">("ready");
  const [boltsUnlocked, setBoltsUnlocked] = useState(0);
  const [doorOpen, setDoorOpen] = useState(false);
  const [outputPulse, setOutputPulse] = useState(false);
  const [overloaded, setOverloaded] = useState(false);

  const target = targets[round];
  const currentValue = bits.reduce((sum, active, index) => sum + (active ? POWERS[index] : 0), 0);
  const bitString = bits.map((bit) => (bit ? "1" : "0")).join("");
  const doorState =
    currentValue === target ? "match" : currentValue > target ? "overload" : currentValue > 0 ? "active" : "idle";

  useEffect(() => {
    const player = userName || "Engineer";
    byteSay(`${player}, power the lock and we'll open the corridor.`, 2600);
    echoSay("Each bit is a switch. Their values add together.", 2600);
  }, [byteSay, echoSay, userName]);

  useEffect(() => {
    if (phase !== "opening") return;

    const container = containerRef.current;
    const timers = [
      window.setTimeout(() => setBoltsUnlocked(1), 220),
      window.setTimeout(() => setBoltsUnlocked(2), 480),
      window.setTimeout(() => setBoltsUnlocked(3), 760),
      window.setTimeout(() => {
        setDoorOpen(true);
        playComplete();
        if (container) {
          burst({
            x: container.clientWidth / 2,
            y: 120,
            color: accent,
            count: 18,
            spread: 90,
            size: 8,
          });
        }
      }, 1020),
      window.setTimeout(() => {
        if (round === targets.length - 1) {
          setPhase("complete");
          setStatusText("All binary doors are online. The corridor is stable again.");
          byteCelebrate(`${userName || "Engineer"}, every lock is open!`);
          echoSay("Binary numbers are built by combining switch values.", 2800);
          return;
        }

        setRound((prev) => prev + 1);
        setBits(freshBits());
        setBoltsUnlocked(0);
        setDoorOpen(false);
        setOverloaded(false);
        setPhase("ready");
        setStatusText("New lock loaded. Build the next code with the switch deck.");
        byteSay("Another Glitch lock ahead. Same trick, new number.", 2400);
        echoSay("A different combination can make a new number.", 2400);
      }, 2200),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [accent, burst, byteCelebrate, byteSay, containerRef, echoSay, phase, playComplete, round, targets.length, userName]);

  function handleToggle(index: number) {
    if (phase !== "ready") return;

    playTap();
    setOutputPulse(true);
    window.setTimeout(() => setOutputPulse(false), 180);

    const nextBits = [...bits];
    nextBits[index] = !nextBits[index];
    const nextValue = nextBits.reduce(
      (sum, active, bitIndex) => sum + (active ? POWERS[bitIndex] : 0),
      0
    );

    setBits(nextBits);

    if (nextValue > target) {
      setOverloaded(true);
      setStatusText("Too much energy. A higher-value switch pushed the lock past the target.");
      recordWrong();
      playWrong();
      byteAlert("Whoa, overload spark. Pull one of the bigger switches back.");
      echoSay("Turn off a larger bit to lower the total.", 2200);
      window.setTimeout(() => setOverloaded(false), 320);
      return;
    }

    if (nextValue === target) {
      recordCorrect();
      playCorrect();
      if (combo + 1 > 1) playCombo(combo + 1);
      setStatusText("Perfect match. The corridor lock is disengaging now.");
      byteCelebrate(`${userName || "Engineer"}, you matched the door code!`);
      echoSay("That exact bit pattern makes the target number.", 2400);
      setPhase("opening");
      return;
    }

    if (nextValue === 0) {
      setStatusText("The lock is asleep again. Add power until the target lights match.");
      return;
    }

    setStatusText(`Power climbing. ${nextValue} is active, but the lock still needs ${target}.`);
  }

  const footer =
    phase === "complete" ? (
      <button className="game-btn" style={{ background: accent }} onClick={onComplete} type="button">
        Open Next Room
      </button>
    ) : null;

  return (
    <GameScene
      accent={accent}
      header={{ room: "Bit Reactor Corridor", step: `Door ${round + 1} of ${targets.length}` }}
      missionTitle="Binary Door System"
      missionObjective="Flip the right bit switches to match the lock code and open the corridor."
      subtitle="Each switch adds value to the lock. Match the number to open it."
      companions={[
        {
          character: byteCharacter,
          dialogue: byteDialogue,
          mood: byteMood,
        },
        {
          character: echoCharacter,
          dialogue: echoDialogue,
          mood: echoMood,
        },
      ]}
      stability={{ stability, combo }}
      controls={
        <div className="binary-door-controls">
          <div className="binary-door-switch-deck">
            {POWERS.map((power, index) => (
              <button
                key={power}
                className={`reactor-cell${bits[index] ? " reactor-cell-on" : ""}`}
                onClick={() => handleToggle(index)}
                type="button"
                disabled={phase !== "ready"}
                aria-label={`${bits[index] ? "Disable" : "Enable"} ${power} bit`}
              >
                <span className="reactor-cell-value">{bits[index] ? "1" : "0"}</span>
                <span className="reactor-cell-power">{power}</span>
              </button>
            ))}
          </div>

          <div className="binary-door-readout">
            <div className="binary-door-readout-row">
              <span className="binary-door-readout-label">Bit Pattern</span>
              <span className="binary-door-readout-value">{bitString}</span>
            </div>
            <div className="binary-door-readout-row">
              <span className="binary-door-readout-label">Current Total</span>
              <span
                className={`binary-door-readout-value${outputPulse ? " binary-door-readout-value-pop" : ""}`}
              >
                {currentValue}
              </span>
            </div>
          </div>
        </div>
      }
      footer={footer}
    >
      <div
        ref={containerRef}
        className={`binary-door-room${overloaded ? " game-shake" : ""}${
          doorOpen ? " binary-door-room-open" : ""
        }`}
        data-state={doorState}
      >
        <div className="binary-door-target-card">
          <span className="binary-door-target-label">Target Lock Code</span>
          <strong className="binary-door-target-value">{target}</strong>
          <span className="binary-door-target-sub">Round {round + 1}</span>
        </div>

        <div className="binary-door-frame">
          <div className="binary-door-bolts" aria-hidden="true">
            {[0, 1, 2].map((bolt) => (
              <span
                key={bolt}
                className={`binary-door-bolt${boltsUnlocked > bolt ? " binary-door-bolt-open" : ""}`}
              />
            ))}
          </div>

          <div className="binary-door-rails" aria-hidden="true">
            {POWERS.map((power, index) => (
              <span
                key={power}
                className={`binary-door-rail${bits[index] ? " binary-door-rail-on" : ""}`}
                style={{ animationDelay: `${index * 90}ms` }}
              />
            ))}
          </div>

          <div className="binary-door-shell">
            <div className="binary-door-shell-track" />
            <div className={`binary-door-panel binary-door-panel-left${doorOpen ? " binary-door-panel-slide" : ""}`} />
            <div className={`binary-door-panel binary-door-panel-right${doorOpen ? " binary-door-panel-slide" : ""}`} />
            <div className="binary-door-core">
              <span className="binary-door-core-label">Live Power</span>
              <strong className={`binary-door-core-value${outputPulse ? " reactor-output-pop" : ""}`}>
                {currentValue}
              </strong>
            </div>
          </div>
        </div>

        <div className="reactor-gauge binary-door-gauge">
          <div
            className="reactor-gauge-fill"
            style={{
              width: `${(currentValue / POWERS.reduce((sum, power) => sum + power, 0)) * 100}%`,
            }}
          />
          <div className="reactor-gauge-target" style={{ left: `${(target / 31) * 100}%` }} />
        </div>
      </div>
    </GameScene>
  );
}

"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import GameScene from "@/components/game/GameScene";
import { useCompanion } from "@/lib/game/use-companion";
import { useGameMeta } from "@/lib/game/use-game-meta";
import { useParticles } from "@/lib/game/use-particles";
import { useSound } from "@/lib/game/use-sound";
import { useUser } from "@/lib/store";

interface Props {
  onComplete: () => void;
  accent: string;
}

interface Point {
  x: number;
  y: number;
}

interface BotChoice {
  id: string;
  label: string;
  tag: string;
  summary: string;
  botTarget: Point;
  burstPoint: Point;
  effect: string;
  success: boolean;
  executionText: string;
  resultText: string;
  byteLine: string;
  echoLine: string;
  effectColor?: string;
}

interface BotMission {
  id: string;
  title: string;
  objective: string;
  introLine: string;
  successLine: string;
  botStart: Point;
  choices: BotChoice[];
}

const MISSIONS: BotMission[] = [
  {
    id: "lamp-bay",
    title: "Lamp Calibration",
    objective: "Tell the bot exactly which lamp to power so the blue beacon wakes up.",
    introLine: "The bot listens literally. Pick the instruction that names the exact target.",
    successLine: "Blue beacon online. Precision made the bot choose the right lamp.",
    botStart: { x: 50, y: 78 },
    choices: [
      {
        id: "turn-it-on",
        label: "Turn it on",
        tag: "Too Vague",
        summary: "The bot powers the closest thing it can turn on.",
        botTarget: { x: 28, y: 38 },
        burstPoint: { x: 28, y: 32 },
        effect: "green-lamp",
        success: false,
        executionText: "The bot heads for the nearest lamp and powers it up.",
        resultText: "The green lamp turned on. 'It' was vague, so the bot chose the wrong target.",
        byteLine: "That worked for a lamp, just not the lamp we wanted.",
        echoLine: "Computers do exactly what you say, not what you meant.",
        effectColor: "#22c55e",
      },
      {
        id: "turn-blue-lamp-on",
        label: "Turn on the blue lamp",
        tag: "Precise",
        summary: "The target is named, so the bot can act exactly.",
        botTarget: { x: 74, y: 38 },
        burstPoint: { x: 74, y: 32 },
        effect: "blue-lamp",
        success: true,
        executionText: "The bot locks onto the blue lamp and flips the switch.",
        resultText: "The blue beacon lit up right away because the instruction named the exact lamp.",
        byteLine: "Perfect. The bot knew exactly where to go.",
        echoLine: "Precise instructions create precise results.",
        effectColor: "#38bdf8",
      },
      {
        id: "make-room-bright",
        label: "Make the room bright",
        tag: "Different Goal",
        summary: "The bot increases light another way by opening the window shades.",
        botTarget: { x: 50, y: 20 },
        burstPoint: { x: 50, y: 18 },
        effect: "window-open",
        success: false,
        executionText: "The bot opens the overhead shades to brighten the room.",
        resultText: "The room got brighter, but the blue lamp stayed off. The command changed the wrong thing.",
        byteLine: "Bright room, wrong repair.",
        echoLine: "A broad goal can still produce the wrong action.",
        effectColor: "#f59e0b",
      },
    ],
  },
  {
    id: "battery-bay",
    title: "Battery Sorting",
    objective: "Make the bot charge the left battery, not just any battery in the room.",
    introLine: "There are two batteries here. Precision matters when objects are similar.",
    successLine: "Left battery charging. The bot followed the exact location in the instruction.",
    botStart: { x: 50, y: 78 },
    choices: [
      {
        id: "charge-battery",
        label: "Charge the battery",
        tag: "Too Vague",
        summary: "The bot grabs the closest battery instead of the left one.",
        botTarget: { x: 52, y: 34 },
        burstPoint: { x: 52, y: 24 },
        effect: "charge-right",
        success: false,
        executionText: "The bot rolls a battery to the charger without checking which side you meant.",
        resultText: "The right battery went to the charger. The command never said left.",
        byteLine: "The bot picked a battery, just not the right one.",
        echoLine: "When choices look alike, your instruction has to narrow the target.",
        effectColor: "#fb7185",
      },
      {
        id: "charge-left-battery",
        label: "Charge the battery on the left",
        tag: "Precise",
        summary: "The left battery is named by position, so the bot chooses correctly.",
        botTarget: { x: 52, y: 34 },
        burstPoint: { x: 48, y: 24 },
        effect: "charge-left",
        success: true,
        executionText: "The bot identifies the left battery and docks it in the charger.",
        resultText: "The left battery is charging because the instruction described exactly which one to pick.",
        byteLine: "Locked in. Left battery only.",
        echoLine: "Specific details like side, color, or position remove ambiguity.",
        effectColor: "#22c55e",
      },
      {
        id: "fix-power",
        label: "Fix the power",
        tag: "Different Goal",
        summary: "The bot checks cables because the command sounds like a diagnosis job.",
        botTarget: { x: 50, y: 72 },
        burstPoint: { x: 50, y: 70 },
        effect: "check-cables",
        success: false,
        executionText: "The bot scans the cable terminal and starts a diagnostics routine.",
        resultText: "The bot inspected the cables instead of charging a battery. The goal was too broad.",
        byteLine: "It followed the repair vibe, not the battery task.",
        echoLine: "A vague goal can send a computer into a totally different routine.",
        effectColor: "#f59e0b",
      },
    ],
  },
  {
    id: "cargo-bay",
    title: "Cargo Placement",
    objective: "Get the cube onto the red pad, not just moved somewhere else.",
    introLine: "Final test. The bot will move the cube, but only exact wording lands it on the target pad.",
    successLine: "Cargo aligned. The cube landed on the red pad because the destination was explicit.",
    botStart: { x: 24, y: 78 },
    choices: [
      {
        id: "move-cube",
        label: "Move the cube",
        tag: "Too Vague",
        summary: "The bot moves it, but stops at the center of the room.",
        botTarget: { x: 50, y: 58 },
        burstPoint: { x: 50, y: 58 },
        effect: "cube-center",
        success: false,
        executionText: "The bot lifts the cube and leaves it in the middle of the bay.",
        resultText: "The cube moved, but not onto the red pad. The destination was missing.",
        byteLine: "Move happened. Target missed.",
        echoLine: "Action alone is not enough. Good instructions also name the destination.",
        effectColor: "#f97316",
      },
      {
        id: "cube-red-pad",
        label: "Put the cube on the red pad",
        tag: "Precise",
        summary: "The bot gets both the object and the destination exactly right.",
        botTarget: { x: 74, y: 42 },
        burstPoint: { x: 74, y: 42 },
        effect: "cube-red",
        success: true,
        executionText: "The bot carries the cube across the bay and places it on the red pad.",
        resultText: "The cube snapped onto the red pad because the instruction named both what to move and where to place it.",
        byteLine: "Nailed it. Exact object, exact destination.",
        echoLine: "Precise code describes the action and the target clearly.",
        effectColor: "#ef4444",
      },
      {
        id: "tidy-up",
        label: "Tidy up",
        tag: "Different Goal",
        summary: "The bot stores the cube away because that is its idea of tidy.",
        botTarget: { x: 76, y: 74 },
        burstPoint: { x: 76, y: 74 },
        effect: "cube-bin",
        success: false,
        executionText: "The bot drops the cube into the storage bin to clean the floor.",
        resultText: "The cube is packed away, not on the red pad. 'Tidy up' told the bot to clean, not place.",
        byteLine: "Very tidy. Very wrong.",
        echoLine: "Computers do not guess your hidden goal. They follow the instruction literally.",
        effectColor: "#a78bfa",
      },
    ],
  },
];

function getBatteryPosition(effect: string | null, batteryId: "left" | "right"): Point {
  if (effect === "charge-left" && batteryId === "left") return { x: 47, y: 28 };
  if (effect === "charge-right" && batteryId === "right") return { x: 53, y: 28 };
  return batteryId === "left" ? { x: 26, y: 50 } : { x: 74, y: 50 };
}

function getCubePosition(effect: string | null): Point {
  if (effect === "cube-center") return { x: 50, y: 58 };
  if (effect === "cube-red") return { x: 74, y: 42 };
  if (effect === "cube-bin") return { x: 76, y: 74 };
  return { x: 28, y: 64 };
}

export default function LiteralBotTestGame({ onComplete, accent }: Props) {
  const { userName } = useUser();
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
  const { playTap, playCorrect, playWrong, playCombo, playComplete, playPulse } = useSound();
  const { containerRef, burst } = useParticles();
  const { stability, combo, recordCorrect, recordWrong } = useGameMeta(MISSIONS.length);
  const comboRef = useRef(combo);
  const timersRef = useRef<number[]>([]);

  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<"choose" | "executing" | "transition" | "complete">(
    "choose"
  );
  const [statusText, setStatusText] = useState(MISSIONS[0].introLine);
  const [activeChoiceId, setActiveChoiceId] = useState<string | null>(null);
  const [wrongChoiceId, setWrongChoiceId] = useState<string | null>(null);
  const [sceneEffect, setSceneEffect] = useState<string | null>(null);
  const [botPosition, setBotPosition] = useState<Point>(MISSIONS[0].botStart);

  const mission = MISSIONS[round];
  const activeChoice = mission.choices.find((choice) => choice.id === activeChoiceId) ?? null;
  const repairedRooms = Math.min(
    MISSIONS.length,
    round + (activeChoice?.success && (phase === "transition" || phase === "complete") ? 1 : 0)
  );

  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  useEffect(() => {
    const player = userName || "Engineer";
    byteSay(`${player}, give the bot exact instructions and watch what happens.`, 3000);
    echoSay("Precise code removes ambiguity.", 2200);
  }, [byteSay, echoSay, round, userName]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  function clearTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }

  function burstAt(point: Point, color?: string) {
    const container = containerRef.current;
    if (!container) return;

    burst({
      x: container.clientWidth * (point.x / 100),
      y: container.clientHeight * (point.y / 100),
      color: color || accent,
      count: 20,
      spread: 96,
      size: 7,
    });
  }

  function loadMission(nextRound: number) {
    const nextMission = MISSIONS[nextRound];
    setRound(nextRound);
    setPhase("choose");
    setStatusText(nextMission.introLine);
    setActiveChoiceId(null);
    setWrongChoiceId(null);
    setSceneEffect(null);
    setBotPosition(nextMission.botStart);
  }

  function handleChoice(choice: BotChoice) {
    if (phase !== "choose") return;

    clearTimers();
    setPhase("executing");
    setActiveChoiceId(choice.id);
    setWrongChoiceId(null);
    setSceneEffect(null);
    setStatusText(`Literal Bot executing: ${choice.label}`);
    setBotPosition(choice.botTarget);
    playTap();
    playPulse();
    byteSay(choice.byteLine, 2200);
    echoSay("The bot is following the instruction exactly as written.", 2200);

    timersRef.current.push(
      window.setTimeout(() => {
        setSceneEffect(choice.effect);
        setStatusText(choice.executionText);
        playPulse();
      }, 620)
    );

    timersRef.current.push(
      window.setTimeout(() => {
        setStatusText(choice.resultText);

        if (choice.success) {
          recordCorrect();
          playCorrect();
          if (comboRef.current + 1 > 1) playCombo(comboRef.current + 1);
          playComplete();
          byteCelebrate(choice.byteLine);
          echoSay(choice.echoLine, 2400);
          burstAt(choice.burstPoint, choice.effectColor);

          if (round === MISSIONS.length - 1) {
            setPhase("complete");
            setActiveChoiceId(choice.id);
            setStatusText(
              "Literal Bot calibrated. Precise instructions now repair every target in the bay."
            );
            return;
          }

          setPhase("transition");
          timersRef.current.push(
            window.setTimeout(() => {
              loadMission(round + 1);
            }, 1500)
          );
          return;
        }

        recordWrong();
        playWrong();
        setPhase("transition");
        setWrongChoiceId(choice.id);
        byteAlert(choice.byteLine);
        echoSay(choice.echoLine, 2400);

        timersRef.current.push(
          window.setTimeout(() => {
            setPhase("choose");
            setActiveChoiceId(null);
            setWrongChoiceId(null);
            setSceneEffect(null);
            setBotPosition(mission.botStart);
            setStatusText("Try again with a more exact instruction.");
          }, 1450)
        );
      }, 1320)
    );
  }

  function renderMissionScene() {
    if (mission.id === "lamp-bay") {
      return (
        <>
          <div
            className={`precision-window${sceneEffect === "window-open" ? " precision-window-open" : ""}`}
            style={{ left: "50%", top: "20%" }}
          >
            <span className="precision-window-glow" />
            <span className="precision-window-slats" />
          </div>

          <div
            className={`precision-lamp precision-lamp-green${sceneEffect === "green-lamp" ? " precision-lamp-on" : ""}`}
            style={{ left: "28%", top: "32%" }}
          >
            <span className="precision-lamp-bulb" />
            <span className="precision-lamp-label">Green Lamp</span>
          </div>

          <div
            className={`precision-lamp precision-lamp-blue${sceneEffect === "blue-lamp" ? " precision-lamp-on" : ""}`}
            style={{ left: "74%", top: "32%" }}
          >
            <span className="precision-lamp-bulb" />
            <span className="precision-lamp-label">Blue Lamp</span>
          </div>
        </>
      );
    }

    if (mission.id === "battery-bay") {
      const leftBatteryPosition = getBatteryPosition(sceneEffect, "left");
      const rightBatteryPosition = getBatteryPosition(sceneEffect, "right");

      return (
        <>
          <div className="precision-charger" style={{ left: "50%", top: "24%" }}>
            <span className={`precision-charger-core${sceneEffect?.startsWith("charge-") ? " precision-charger-core-on" : ""}`} />
            <span className="precision-charger-label">Charger</span>
          </div>

          <div
            className={`precision-battery precision-battery-left${
              sceneEffect === "charge-left" ? " precision-battery-charging" : ""
            }`}
            style={{ left: `${leftBatteryPosition.x}%`, top: `${leftBatteryPosition.y}%` }}
          >
            <span className="precision-battery-cap" />
            <span className="precision-battery-label">Left</span>
          </div>

          <div
            className={`precision-battery precision-battery-right${
              sceneEffect === "charge-right" ? " precision-battery-charging" : ""
            }`}
            style={{ left: `${rightBatteryPosition.x}%`, top: `${rightBatteryPosition.y}%` }}
          >
            <span className="precision-battery-cap" />
            <span className="precision-battery-label">Right</span>
          </div>

          <div
            className={`precision-cable-terminal${
              sceneEffect === "check-cables" ? " precision-cable-terminal-live" : ""
            }`}
            style={{ left: "50%", top: "72%" }}
          >
            <span className="precision-cable-node" />
            <span className="precision-cable-node" />
            <span className="precision-cable-node" />
            <span className="precision-cable-label">Cable Hub</span>
          </div>
        </>
      );
    }

    const cubePosition = getCubePosition(sceneEffect);
    return (
      <>
        <div className="precision-pad precision-pad-red" style={{ left: "74%", top: "42%" }}>
          <span className="precision-pad-label">Red Pad</span>
        </div>

        <div className="precision-pad precision-pad-center" style={{ left: "50%", top: "58%" }}>
          <span className="precision-pad-label">Center</span>
        </div>

        <div className={`precision-bin${sceneEffect === "cube-bin" ? " precision-bin-open" : ""}`} style={{ left: "76%", top: "74%" }}>
          <span className="precision-bin-lid" />
          <span className="precision-bin-label">Storage Bin</span>
        </div>

        <div
          className={`precision-cube${
            sceneEffect === "cube-red" ? " precision-cube-targeted" : ""
          }`}
          style={{ left: `${cubePosition.x}%`, top: `${cubePosition.y}%` }}
        >
          <span className="precision-cube-face" />
        </div>
      </>
    );
  }

  const footer =
    phase === "complete" ? (
      <button className="game-btn" style={{ background: accent }} onClick={onComplete} type="button">
        Open Next Room
      </button>
    ) : null;

  return (
    <GameScene
      layout="birdseye"
      accent={accent}
      header={{ room: "Precision Bot Bay", step: `Test ${round + 1} of ${MISSIONS.length}` }}
      missionTitle="Precision Bot"
      missionObjective={mission.objective}
      subtitle="Choose an instruction, then watch the bot follow it literally."
      hint="Name the exact thing and the exact destination. Bots do not guess."
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
      statusText={statusText}
      controls={
        <div className="precision-panel">
          <div className="precision-card precision-mission-card">
            <span className="precision-kicker">Mission Brief</span>
            <strong>{mission.title}</strong>
            <p>{mission.objective}</p>
            <div className="precision-progress-row">
              <div className="precision-progress-bar" aria-hidden="true">
                <span
                  style={{
                    width: `${(repairedRooms / MISSIONS.length) * 100}%`,
                    background: accent,
                  }}
                />
              </div>
              <span>{repairedRooms}/{MISSIONS.length} rooms repaired</span>
            </div>
          </div>

          <div className="precision-card precision-choice-card">
            <span className="precision-kicker">Instruction Deck</span>
            <div className="precision-choice-list">
              {mission.choices.map((choice) => {
                const active = activeChoiceId === choice.id;
                const wrong = wrongChoiceId === choice.id;
                return (
                  <button
                    key={choice.id}
                    className={`precision-choice${active ? " precision-choice-active" : ""}${
                      wrong ? " precision-choice-wrong" : ""
                    }`}
                    onClick={() => handleChoice(choice)}
                    type="button"
                    disabled={phase !== "choose"}
                  >
                    <span className="precision-choice-top">
                      <strong>{choice.label}</strong>
                      <span
                        className={`precision-choice-tag${
                          choice.success
                            ? " precision-choice-tag-precise"
                            : choice.tag === "Too Vague"
                            ? " precision-choice-tag-vague"
                            : " precision-choice-tag-side"
                        }`}
                      >
                        {choice.tag}
                      </span>
                    </span>
                    <small>{choice.summary}</small>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="precision-card precision-rule-card">
            <span className="precision-kicker">Literal Rule</span>
            <strong>Good code names the target clearly.</strong>
            <p>
              Vague instructions create funny failures because the bot follows the words exactly.
              Precise instructions tell it what to act on and where to act.
            </p>
            <div className="precision-rule-pills">
              <span className="precision-rule-pill precision-rule-pill-good">Object</span>
              <span className="precision-rule-pill precision-rule-pill-good">Destination</span>
              <span className="precision-rule-pill">No Guessing</span>
            </div>
          </div>
        </div>
      }
      footer={footer}
    >
      <div ref={containerRef} className="precision-room">
        <div className="precision-room-grid" aria-hidden="true" />
        <div className="precision-room-badge">
          <span>Literal Thinking</span>
          <strong>{mission.title}</strong>
        </div>

        {renderMissionScene()}

        <div
          className={`precision-bot${phase === "executing" ? " precision-bot-walking" : ""}`}
          style={
            {
              left: `${botPosition.x}%`,
              top: `${botPosition.y}%`,
              "--bot-accent": accent,
            } as CSSProperties
          }
        >
          <span className="precision-bot-shadow" />
          <span className="precision-bot-body">
            <span className="precision-bot-face">◉_◉</span>
          </span>
          <span className="precision-bot-label">Literal Bot</span>
        </div>
      </div>
    </GameScene>
  );
}

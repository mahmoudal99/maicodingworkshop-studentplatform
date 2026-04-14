"use client";

import { useEffect, useRef, useState } from "react";
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

interface TerminalChoice {
  id: string;
  label: string;
  shortLabel: string;
  codeLines: string[];
  tokens: string[];
  binary: string[];
  output: string;
}

interface TerminalMission {
  id: string;
  title: string;
  objective: string;
  targetOutput: string;
  correctId: string;
  choices: TerminalChoice[];
  introLine: string;
  successLine: string;
}

const MISSIONS: TerminalMission[] = [
  {
    id: "hello-visor",
    title: "Wake the visor screen",
    objective: "Pick the code that sends HELLO to the visor display.",
    targetOutput: "HELLO",
    correctId: "hello",
    introLine: "We need a greeting on the visor. Choose the code that makes the screen say HELLO.",
    successLine: "Visor online. That code made the greeting appear on the screen.",
    choices: [
      {
        id: "hello",
        label: "Print greeting",
        shortLabel: 'print("HELLO")',
        codeLines: ['print("HELLO")'],
        tokens: ["print", "(", '"HELLO"', ")"],
        binary: ["01110000", "01110010", "01101001", "01101110", "01110100"],
        output: "HELLO",
      },
      {
        id: "save",
        label: "Save file",
        shortLabel: "save(file)",
        codeLines: ["save(file)"],
        tokens: ["save", "(", "file", ")"],
        binary: ["01110011", "01100001", "01110110", "01100101"],
        output: "FILE SAVED",
      },
      {
        id: "turn",
        label: "Turn drone",
        shortLabel: "turnLeft()",
        codeLines: ["turnLeft()"],
        tokens: ["turnLeft", "(", ")"],
        binary: ["01110100", "01110101", "01110010", "01101110"],
        output: "TURNING...",
      },
    ],
  },
  {
    id: "reactor-counter",
    title: "Fix the reactor counter",
    objective: "Pick the code that sets the reactor counter to 5.",
    targetOutput: "5",
    correctId: "five",
    introLine: "The reactor readout is wrong. Choose the code that will display the number 5.",
    successLine: "Counter repaired. That code produced the correct value on the monitor.",
    choices: [
      {
        id: "five",
        label: "Add to five",
        shortLabel: "score = 4 + 1",
        codeLines: ["score = 4 + 1", "print(score)"],
        tokens: ["score", "=", "4", "+", "1"],
        binary: ["01110011", "01100011", "01101111", "01110010", "01100101"],
        output: "5",
      },
      {
        id: "three",
        label: "Add to three",
        shortLabel: "score = 2 + 1",
        codeLines: ["score = 2 + 1", "print(score)"],
        tokens: ["score", "=", "2", "+", "1"],
        binary: ["00110010", "00101011", "00110001", "00111101"],
        output: "3",
      },
      {
        id: "eight",
        label: "Add to eight",
        shortLabel: "score = 4 + 4",
        codeLines: ["score = 4 + 4", "print(score)"],
        tokens: ["score", "=", "4", "+", "4"],
        binary: ["00110100", "00101011", "00110100", "00111101"],
        output: "8",
      },
    ],
  },
  {
    id: "launch-display",
    title: "Trigger the launch display",
    objective: "Pick the code that shows GO! on the launch wall.",
    targetOutput: "GO!",
    correctId: "go",
    introLine: "Launch display is dark. Send the exact message GO! to the wall screen.",
    successLine: "Launch display repaired. The wall screen is showing GO! now.",
    choices: [
      {
        id: "go",
        label: "Show GO!",
        shortLabel: 'print("GO!")',
        codeLines: ['print("GO!")'],
        tokens: ["print", "(", '"GO!"', ")"],
        binary: ["01000111", "01001111", "00100001"],
        output: "GO!",
      },
      {
        id: "ready",
        label: "Show READY",
        shortLabel: 'print("READY")',
        codeLines: ['print("READY")'],
        tokens: ["print", "(", '"READY"', ")"],
        binary: ["01010010", "01000101", "01000001", "01000100", "01011001"],
        output: "READY",
      },
      {
        id: "stop",
        label: "Show STOP",
        shortLabel: 'print("STOP")',
        codeLines: ['print("STOP")'],
        tokens: ["print", "(", '"STOP"', ")"],
        binary: ["01010011", "01010100", "01001111", "01010000"],
        output: "STOP",
      },
    ],
  },
];

const STAGE_LABELS = ["Source", "Tokens", "Binary", "CPU", "Output"];

export default function CodeExecutionChainGame({ onComplete, accent }: Props) {
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

  const [round, setRound] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [runningChoice, setRunningChoice] = useState<TerminalChoice | null>(null);
  const [phase, setPhase] = useState<"select" | "executing" | "complete">("select");
  const [stageIndex, setStageIndex] = useState(-1);
  const [statusText, setStatusText] = useState(MISSIONS[0].introLine);
  const [lastOutput, setLastOutput] = useState<string>("...");
  const [lastRunCorrect, setLastRunCorrect] = useState<boolean | null>(null);

  const mission = MISSIONS[round];
  const selectedChoice =
    mission.choices.find((choice) => choice.id === selectedChoiceId) ?? null;
  const displayChoice = runningChoice ?? selectedChoice ?? mission.choices[0];

  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  useEffect(() => {
    const player = userName || "Engineer";
    byteSay(`${player}, pick some code and watch the terminal turn it into machine action.`, 3200);
    echoSay("Code becomes tokens, machine signals, CPU work, and then output.", 2600);
  }, [byteSay, echoSay, userName]);

  useEffect(() => {
    if (phase !== "executing" || !runningChoice) return;

    const stageTimers = [
      window.setTimeout(() => {
        setStageIndex(0);
        setStatusText("Source code loaded into the terminal.");
        echoSay("First, the machine receives your human-readable code.", 1800);
        playPulse();
      }, 180),
      window.setTimeout(() => {
        setStageIndex(1);
        setStatusText("Breaking the line into readable code tokens.");
        echoSay("The code is split into pieces the system can understand.", 1800);
        playPulse();
      }, 880),
      window.setTimeout(() => {
        setStageIndex(2);
        setStatusText("Translating tokens into machine signals.");
        echoSay("Those pieces are turned into binary-style machine signals.", 1900);
        playPulse();
      }, 1620),
      window.setTimeout(() => {
        setStageIndex(3);
        setStatusText("Routing the signals into the CPU core.");
        echoSay("Now the CPU executes the instruction step by step.", 1900);
        playPulse();
      }, 2360),
      window.setTimeout(() => {
        setStageIndex(4);
        setLastOutput(runningChoice.output);
        setStatusText("Output is appearing on the screen wall now.");
        echoSay("Finally, the result appears as output you can see.", 1800);
        playPulse();
      }, 3080),
    ];

    const resolutionTimer = window.setTimeout(() => {
      const isCorrect = runningChoice.id === mission.correctId;
      setLastRunCorrect(isCorrect);

      if (isCorrect) {
        recordCorrect();
        playCorrect();
        if (comboRef.current + 1 > 1) playCombo(comboRef.current + 1);
        playComplete();
        setStatusText(mission.successLine);
        byteCelebrate("Perfect repair. That code fixed the right system.");

        const container = containerRef.current;
        if (container) {
          burst({
            x: container.clientWidth * 0.79,
            y: container.clientHeight * 0.56,
            count: 22,
            spread: 110,
            color: accent,
            size: 8,
          });
        }

        window.setTimeout(() => {
          if (round === MISSIONS.length - 1) {
            setPhase("complete");
            setStatusText("Terminal tower restored. You watched code become real output.");
            return;
          }

          const nextRound = round + 1;
          const nextMission = MISSIONS[nextRound];
          setRound(nextRound);
          setSelectedChoiceId(null);
          setRunningChoice(null);
          setStageIndex(-1);
          setPhase("select");
          setLastOutput("...");
          setLastRunCorrect(null);
          setStatusText(nextMission.introLine);
          byteSay("Next repair queued. Pick the code that produces the right result.", 2400);
          echoSay("Different goals need different code, but the execution path stays the same.", 2200);
        }, 1500);
        return;
      }

      recordWrong();
      playWrong();
      setPhase("select");
      setStatusText(`That code ran, but it produced ${runningChoice.output} instead of ${mission.targetOutput}. Try another snippet.`);
      byteAlert("That executed correctly, but it repaired the wrong thing.");
      echoSay("Code can run perfectly and still give the wrong result if you choose the wrong instruction.", 2400);
      setRunningChoice(null);
    }, 3900);

    return () => {
      stageTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(resolutionTimer);
    };
  }, [
    accent,
    burst,
    byteAlert,
    byteCelebrate,
    byteSay,
    containerRef,
    echoSay,
    mission,
    phase,
    playCombo,
    playComplete,
    playCorrect,
    playPulse,
    playWrong,
    recordCorrect,
    recordWrong,
    round,
    runningChoice,
  ]);

  function selectChoice(choiceId: string) {
    if (phase !== "select") return;
    setSelectedChoiceId(choiceId);
    setRunningChoice(null);
    setStageIndex(-1);
    setLastRunCorrect(null);
    setLastOutput("...");
    setStatusText("Snippet loaded. Hit Execute to watch the full code path.");
    playTap();
  }

  function handleExecute() {
    if (phase !== "select" || !selectedChoice) return;

    setRunningChoice(selectedChoice);
    setPhase("executing");
    setStageIndex(-1);
    setLastRunCorrect(null);
    setLastOutput("...");
    setStatusText("Injecting source code into the terminal...");
    byteSay("Watch closely. The whole machine is about to answer back.", 1800);
    echoSay("Execution starts with source code.", 1600);
    playPulse();
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
      header={{ room: "Terminal Tower", step: `Script ${round + 1} of ${MISSIONS.length}` }}
      missionTitle="3D Code Terminal Experience"
      missionObjective={mission.objective}
      subtitle="Pick a tiny code snippet, execute it, and watch it turn into tokens, binary pulses, CPU work, and output."
      hint={`The correct repair should make the output monitor show ${mission.targetOutput}.`}
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
        <div className="terminal-control-panel">
          <div className="terminal-mission-card">
            <span className="terminal-mission-kicker">Repair Goal</span>
            <strong>{mission.title}</strong>
            <p>{mission.objective}</p>
            <span className="terminal-target-chip">Target output: {mission.targetOutput}</span>
          </div>

          <div className="terminal-choice-bank">
            {mission.choices.map((choice) => {
              const active = selectedChoiceId === choice.id;
              return (
                <button
                  key={choice.id}
                  className={`terminal-choice-card${active ? " terminal-choice-card-active" : ""}`}
                  onClick={() => selectChoice(choice.id)}
                  type="button"
                  disabled={phase !== "select"}
                  style={active ? ({ borderColor: accent, boxShadow: `0 0 24px ${accent}22` } as React.CSSProperties) : undefined}
                >
                  <span className="terminal-choice-label">{choice.label}</span>
                  <code className="terminal-choice-code">{choice.shortLabel}</code>
                </button>
              );
            })}
          </div>

          <button
            className="game-btn terminal-execute-btn"
            style={{ background: accent }}
            onClick={handleExecute}
            type="button"
            disabled={phase !== "select" || !selectedChoice}
          >
            Execute Code
          </button>
        </div>
      }
      footer={footer}
    >
      <div ref={containerRef} className="terminal-room">
        <div className="terminal-stage-strip">
          {STAGE_LABELS.map((label, index) => (
            <div
              key={label}
              className={`terminal-stage-node${stageIndex >= index ? " terminal-stage-node-on" : ""}${
                stageIndex === index ? " terminal-stage-node-active" : ""
              }`}
            >
              <span>{index + 1}</span>
              <small>{label}</small>
            </div>
          ))}
        </div>

        <div className="terminal-visual-grid">
          <section className="terminal-window-card">
            <div className="terminal-window-bar">
              <span>Source</span>
              <span>{displayChoice.label}</span>
            </div>
            <pre className={`terminal-code-window${stageIndex >= 0 ? " terminal-code-window-live" : ""}`}>
              {displayChoice.codeLines.map((line, index) => (
                <span key={`${line}-${index}`} className={`terminal-code-line${stageIndex === 0 ? " terminal-code-line-active" : ""}`}>
                  {line}
                </span>
              ))}
            </pre>

            <div className={`terminal-token-rack${stageIndex >= 1 ? " terminal-token-rack-on" : ""}`}>
              {displayChoice.tokens.map((token, index) => (
                <span
                  key={`${token}-${index}`}
                  className={`terminal-token${stageIndex >= 1 ? " terminal-token-visible" : ""}`}
                  style={{ transitionDelay: `${index * 70}ms` }}
                >
                  {token}
                </span>
              ))}
            </div>
          </section>

          <section className="terminal-conduit-card">
            <div className={`terminal-binary-tunnel${stageIndex >= 2 ? " terminal-binary-tunnel-on" : ""}`}>
              {displayChoice.binary.map((chunk, index) => (
                <span
                  key={`${chunk}-${index}`}
                  className={`terminal-binary-chip${stageIndex >= 2 ? " terminal-binary-chip-visible" : ""}`}
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  {chunk}
                </span>
              ))}
            </div>
            <div className={`terminal-signal-beam${stageIndex >= 2 ? " terminal-signal-beam-on" : ""}`} />
          </section>

          <section className="terminal-output-stack">
            <div className={`terminal-cpu-core${stageIndex >= 3 ? " terminal-cpu-core-active" : ""}`}>
              <div className="terminal-cpu-ring" />
              <div className="terminal-cpu-label">CPU</div>
            </div>

            <div className={`terminal-output-monitor${stageIndex >= 4 ? " terminal-output-monitor-on" : ""}`}>
              <div className="terminal-output-header">Output Screen</div>
              <div className={`terminal-output-value${lastRunCorrect === false ? " terminal-output-value-wrong" : ""}`}>
                {stageIndex >= 4 ? lastOutput : "waiting..."}
              </div>
            </div>
          </section>
        </div>
      </div>
    </GameScene>
  );
}

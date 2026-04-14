"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import FbxAssetStage from "@/components/game/FbxAssetStage";
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

type StageId = "power" | "byte" | "memory" | "signal" | "output";
type MemoryTarget = "ram" | "storage";
type OutputTarget = "screen" | "speaker";
type SignalNodeId = "input" | "process" | "output";

interface Point {
  x: number;
  y: number;
}

interface BossStage {
  id: StageId;
  title: string;
  objective: string;
  introLine: string;
  successLine: string;
  byteLine: string;
  echoLine: string;
  burstPoint: Point;
}

const BIT_POWERS = [8, 4, 2, 1];
const SIGNAL_ORDER: SignalNodeId[] = ["input", "process", "output"];
const FLEET_FLAGSHIP = {
  name: "Praetor",
  asset: "/Assets/Praetor.fbx",
  role: "Command carrier holding orbit above The Core during the reboot.",
};

const STAGES: BossStage[] = [
  {
    id: "power",
    title: "Prime the Power Rails",
    objective: "Set the rail switches so the boot core receives exactly 5 units of startup power.",
    introLine: "Start the reboot by dialing the power rails to exactly 5.",
    successLine: "Power rails aligned. The central conduit is now live.",
    byteLine: "Nice. The city just felt that surge.",
    echoLine: "Binary switches can represent exact values when you combine them carefully.",
    burstPoint: { x: 22, y: 26 },
  },
  {
    id: "byte",
    title: "Forge the Boot Byte",
    objective: "Charge all 8 byte cells so the startup packet can seal and move into The Core.",
    introLine: "Now seal one full byte. The reboot packet needs all 8 cells charged.",
    successLine: "Boot byte sealed. The startup packet is ready to travel.",
    byteLine: "Eight bright bits. That packet is ready to fly.",
    echoLine: "A byte is one group of 8 bits working together.",
    burstPoint: { x: 78, y: 26 },
  },
  {
    id: "memory",
    title: "Route Active Data",
    objective: "Send the live boot patch into RAM so the machine can use it right now.",
    introLine: "Choose the dock for live boot data. The patch has to stay active during startup.",
    successLine: "Live patch docked in RAM. Fast working memory is online.",
    byteLine: "RAM grabbed it fast. Good call.",
    echoLine: "RAM holds data the computer is using right now.",
    burstPoint: { x: 22, y: 74 },
  },
  {
    id: "signal",
    title: "Route the Startup Signal",
    objective: "Send the pulse through Input, then Process, then Output to wake the final line.",
    introLine: "Build the reboot flow in the right order: input, process, then output.",
    successLine: "Startup signal routed. The CPU is handing the result to the output bus.",
    byteLine: "Clean route. The core understood every step.",
    echoLine: "Computers take input, process it, and then create output.",
    burstPoint: { x: 78, y: 74 },
  },
  {
    id: "output",
    title: "Launch the City Output",
    objective: "Send the restored system state to the screen wall so The Core can visibly reboot.",
    introLine: "Final step. Pick the output that shows the city coming back online.",
    successLine: "Screen wall active. The Core is rebooting right in front of you.",
    byteLine: "There it is. The whole city can see the reboot happen.",
    echoLine: "Output is the result the user can see, hear, or otherwise notice.",
    burstPoint: { x: 50, y: 86 },
  },
];

function includesId(ids: StageId[], id: StageId) {
  return ids.includes(id);
}

function calculateBitValue(bits: boolean[]) {
  return bits.reduce((sum, active, index) => sum + (active ? BIT_POWERS[index] : 0), 0);
}

function stageIndexFor(id: StageId) {
  return STAGES.findIndex((stage) => stage.id === id);
}

export default function LaunchTheLabGame({ onComplete, accent }: Props) {
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
  const { stability, combo, recordCorrect, recordWrong } = useGameMeta(STAGES.length);
  const comboRef = useRef(combo);
  const timersRef = useRef<number[]>([]);

  const [stageIndex, setStageIndex] = useState(0);
  const [phase, setPhase] = useState<"playing" | "transition" | "complete">("playing");
  const [statusText, setStatusText] = useState(STAGES[0].introLine);
  const [completedStages, setCompletedStages] = useState<StageId[]>([]);
  const [wrongModule, setWrongModule] = useState<StageId | null>(null);
  const [bits, setBits] = useState<boolean[]>([false, false, false, false]);
  const [byteCells, setByteCells] = useState<boolean[]>(new Array(8).fill(false));
  const [memoryTarget, setMemoryTarget] = useState<MemoryTarget | null>(null);
  const [signalPath, setSignalPath] = useState<SignalNodeId[]>([]);
  const [outputTarget, setOutputTarget] = useState<OutputTarget | null>(null);
  const [cityOnline, setCityOnline] = useState(false);

  const stage = STAGES[stageIndex];
  const bitValue = calculateBitValue(bits);
  const byteCharge = byteCells.filter(Boolean).length;
  const repairedCount =
    phase === "complete"
      ? STAGES.length
      : completedStages.length +
        (phase === "transition" && !includesId(completedStages, stage.id) ? 1 : 0);
  const currentSignalExpected = SIGNAL_ORDER[signalPath.length];

  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  useEffect(() => {
    const player = userName || "Engineer";
    byteSay(`${player}, this is it. Wake the whole city one subsystem at a time.`, 3200);
    echoSay("Every repair you learned this week now connects into one system.", 2600);
  }, [byteSay, echoSay, userName]);

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
      count: 22,
      spread: 110,
      size: 8,
    });
  }

  function moveToNextStage() {
    if (stageIndex === STAGES.length - 1) {
      setPhase("complete");
      setCityOnline(true);
      setStatusText("The Core is fully rebooted. Rails, memory, CPU flow, and output are all alive again.");
      return;
    }

    const nextStageIndex = stageIndex + 1;
    const nextStage = STAGES[nextStageIndex];
    setStageIndex(nextStageIndex);
    setPhase("playing");
    setWrongModule(null);
    setStatusText(nextStage.introLine);
  }

  function completeCurrentStage(color?: string) {
    if (includesId(completedStages, stage.id)) return;

    setCompletedStages((current) => [...current, stage.id]);
    setWrongModule(null);
    setStatusText(stage.successLine);
    recordCorrect();
    playCorrect();
    if (comboRef.current + 1 > 1) playCombo(comboRef.current + 1);
    playComplete();
    byteCelebrate(stage.byteLine);
    echoSay(stage.echoLine, 2600);
    burstAt(stage.burstPoint, color);

    if (stageIndex === STAGES.length - 1) {
      timersRef.current.push(
        window.setTimeout(() => {
          setCityOnline(true);
          setPhase("complete");
          setStatusText("The Core is fully rebooted. Rails, memory, CPU flow, and output are all alive again.");
        }, 900)
      );
      return;
    }

    setPhase("transition");
    timersRef.current.push(window.setTimeout(moveToNextStage, 1250));
  }

  function flagWrong(moduleId: StageId, message: string, byteLine: string, echoLine: string) {
    setWrongModule(moduleId);
    setStatusText(message);
    recordWrong();
    playWrong();
    byteAlert(byteLine);
    echoSay(echoLine, 2300);
    timersRef.current.push(
      window.setTimeout(() => {
        setWrongModule(null);
      }, 720)
    );
  }

  function handleBitToggle(index: number) {
    if (phase !== "playing" || stage.id !== "power") return;

    clearTimers();
    const nextBits = [...bits];
    nextBits[index] = !nextBits[index];
    const nextValue = calculateBitValue(nextBits);

    setBits(nextBits);
    setStatusText(`Power rails now reading ${nextValue}. Target is 5.`);
    playTap();

    if (nextValue === 5) {
      setPhase("transition");
      timersRef.current.push(
        window.setTimeout(() => {
          completeCurrentStage("#38bdf8");
        }, 520)
      );
    }
  }

  function handleByteCellToggle(index: number) {
    if (phase !== "playing" || stage.id !== "byte") return;

    clearTimers();
    const nextCells = [...byteCells];
    nextCells[index] = !nextCells[index];
    const nextCount = nextCells.filter(Boolean).length;

    setByteCells(nextCells);
    setStatusText(`Boot byte charging: ${nextCount} of 8 cells active.`);
    playTap();

    if (nextCount === 8) {
      setPhase("transition");
      timersRef.current.push(
        window.setTimeout(() => {
          completeCurrentStage("#22c55e");
        }, 520)
      );
    }
  }

  function handleMemoryChoice(target: MemoryTarget) {
    if (phase !== "playing" || stage.id !== "memory") return;

    clearTimers();
    setMemoryTarget(target);
    playTap();

    if (target === "ram") {
      setPhase("transition");
      setStatusText("Routing live boot data into RAM now...");
      timersRef.current.push(
        window.setTimeout(() => {
          completeCurrentStage("#a78bfa");
        }, 560)
      );
      return;
    }

    flagWrong(
      "memory",
      "Storage keeps data for later. The live boot patch has to stay in RAM right now.",
      "Storage is for later. We need fast active memory.",
      "RAM is the place for data the system is using right now."
    );

    timersRef.current.push(
      window.setTimeout(() => {
        setMemoryTarget(null);
      }, 980)
    );
  }

  function handleSignalNode(nodeId: SignalNodeId) {
    if (phase !== "playing" || stage.id !== "signal") return;

    clearTimers();
    if (nodeId !== currentSignalExpected) {
      setSignalPath([]);
      playTap();
      flagWrong(
        "signal",
        "Signal order broke. Rebuild it as Input, then Process, then Output.",
        "The pulse scrambled. Try the flow in the real system order.",
        "Input comes first, processing happens in the middle, and output comes last."
      );
      return;
    }

    const nextPath = [...signalPath, nodeId];
    setSignalPath(nextPath);
    setStatusText(`Signal locked into ${nodeId.toUpperCase()}. Keep routing the reboot pulse.`);
    playPulse();

    if (nextPath.length === SIGNAL_ORDER.length) {
      setPhase("transition");
      timersRef.current.push(
        window.setTimeout(() => {
          completeCurrentStage("#2dd4bf");
        }, 520)
      );
    }
  }

  function handleOutputChoice(target: OutputTarget) {
    if (phase !== "playing" || stage.id !== "output") return;

    clearTimers();
    setOutputTarget(target);
    playTap();

    if (target === "screen") {
      setPhase("transition");
      setStatusText("Sending the reboot result to the city screen wall...");
      timersRef.current.push(
        window.setTimeout(() => {
          completeCurrentStage("#f59e0b");
        }, 560)
      );
      return;
    }

    flagWrong(
      "output",
      "Speaker output can make sound, but the reboot needs a visible citywide display.",
      "Sound is output too, just not the one this mission needs.",
      "Output means the result the user notices. Here, the city needs a screen."
    );

    timersRef.current.push(
      window.setTimeout(() => {
        setOutputTarget(null);
      }, 980)
    );
  }

  const footer =
    phase === "complete" ? (
      <button className="game-btn" style={{ background: accent }} onClick={onComplete} type="button">
        Finish Week Room
      </button>
    ) : null;

  const bootFeed =
    stage.id === "power"
      ? `Rail total ${bitValue} / 5`
      : stage.id === "byte"
      ? `${byteCharge} / 8 byte cells charged`
      : stage.id === "memory"
      ? memoryTarget
        ? `Patch routed to ${memoryTarget.toUpperCase()}`
        : "Awaiting memory dock"
      : stage.id === "signal"
      ? signalPath.length > 0
        ? `Pulse path: ${signalPath.join(" -> ")}`
        : "Awaiting signal route"
      : outputTarget
      ? `Output target: ${outputTarget.toUpperCase()}`
      : "Awaiting output target";

  return (
    <GameScene
      layout="birdseye"
      accent={accent}
      header={{ room: "The Core", step: `Boss ${Math.min(stageIndex + 1, STAGES.length)} of ${STAGES.length}` }}
      missionTitle="Boot the System"
      missionObjective={stage.objective}
      subtitle="Reboot the whole machine-city by restoring power, memory, signal flow, and output."
      hint="Each subsystem unlocks the next one. Watch the city wake up after every fix."
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
          <div className="boot-panel">
          <div className="boot-card boot-mission-card">
            <span className="boot-kicker">Boss Objective</span>
            <strong>{stage.title}</strong>
            <div className="boot-fleet-status">
              <span className="boot-fleet-status-label">Command Carrier</span>
              <strong>{FLEET_FLAGSHIP.name}</strong>
              <small>{FLEET_FLAGSHIP.role}</small>
            </div>
            <p>{stage.objective}</p>
            <div className="boot-progress-row">
              <div className="boot-progress-bar" aria-hidden="true">
                <span
                  style={{
                    width: `${(repairedCount / STAGES.length) * 100}%`,
                    background: accent,
                  }}
                />
              </div>
              <span>{repairedCount}/{STAGES.length} systems restored</span>
            </div>
          </div>

          <div className="boot-card boot-status-card">
            <div className="boot-status-header">
              <span className="boot-kicker">System Map</span>
              <span>{bootFeed}</span>
            </div>
            <div className="boot-stage-list">
              {STAGES.map((bossStage, index) => {
                const complete = includesId(completedStages, bossStage.id);
                const active = stage.id === bossStage.id && phase !== "complete";
                const locked = !complete && index > stageIndex;

                return (
                  <div
                    key={bossStage.id}
                    className={`boot-stage-item${complete ? " boot-stage-item-complete" : ""}${
                      active ? " boot-stage-item-active" : ""
                    }${locked ? " boot-stage-item-locked" : ""}`}
                  >
                    <span className="boot-stage-index">{index + 1}</span>
                    <span className="boot-stage-copy">
                      <strong>{bossStage.title}</strong>
                      <small>
                        {complete
                          ? "Online"
                          : active
                          ? "Current objective"
                          : locked
                          ? "Locked"
                          : "Queued"}
                      </small>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="boot-card boot-readout-card">
            <span className="boot-kicker">Live Readout</span>
            {stage.id === "power" && (
              <div className="boot-readout-block">
                <strong>{bits.map((bit) => (bit ? 1 : 0)).join("")}</strong>
                <small>Use the rails to make exactly 5 units of startup power.</small>
              </div>
            )}

            {stage.id === "byte" && (
              <div className="boot-readout-block">
                <strong>{byteCharge} of 8 cells active</strong>
                <small>One full byte is needed to seal the boot packet.</small>
              </div>
            )}

            {stage.id === "memory" && (
              <div className="boot-readout-block">
                <strong>{memoryTarget ? memoryTarget.toUpperCase() : "Select a dock"}</strong>
                <small>Live data belongs in RAM while the system is running.</small>
              </div>
            )}

            {stage.id === "signal" && (
              <div className="boot-readout-block">
                <strong>{signalPath.length > 0 ? signalPath.join(" -> ") : "No path routed"}</strong>
                <small>Click Input, then Process, then Output.</small>
              </div>
            )}

            {stage.id === "output" && (
              <div className="boot-readout-block">
                <strong>{outputTarget ? outputTarget.toUpperCase() : "Choose the final output"}</strong>
                <small>The reboot must appear where the city can see it.</small>
              </div>
            )}
          </div>
        </div>
      }
      footer={footer}
      >
        <div
          ref={containerRef}
          className={`boot-city${cityOnline ? " boot-city-online" : ""}${
            wrongModule ? " game-shake" : ""
          }`}
        >
          <div className="boot-city-grid" aria-hidden="true" />

          <div className={`boot-flagship${repairedCount > 0 ? " boot-flagship-awake" : ""}${
            cityOnline ? " boot-flagship-live" : ""
          }`}>
            <div className="boot-flagship-stage">
              <FbxAssetStage
                modelPath={FLEET_FLAGSHIP.asset}
                accent={accent}
                title={FLEET_FLAGSHIP.name}
                variant="hero"
                zoom={1.15}
                modelRotation={[0.08, -0.42, 0]}
              />
            </div>
            <div className="boot-flagship-label">
              <span>{FLEET_FLAGSHIP.name}</span>
              <small>Holding orbit</small>
            </div>
          </div>

        <div className="boot-skyline boot-skyline-top" aria-hidden="true">
          {Array.from({ length: 11 }, (_, index) => (
            <span
              key={`top-${index}`}
              className={`boot-skyline-tower${
                cityOnline || index < completedStages.length + 2 ? " boot-skyline-tower-on" : ""
              }`}
              style={{ height: `${26 + ((index * 9) % 42)}px` }}
            />
          ))}
        </div>

        <svg className="boot-network" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {STAGES.map((bossStage) => {
            const active = bossStage.id === stage.id && phase !== "complete";
            const complete = includesId(completedStages, bossStage.id);
            const index = stageIndexFor(bossStage.id);
            const points: Record<StageId, Point> = {
              power: { x: 22, y: 26 },
              byte: { x: 78, y: 26 },
              memory: { x: 22, y: 74 },
              signal: { x: 78, y: 74 },
              output: { x: 50, y: 86 },
            };
            const point = points[bossStage.id];

            return (
              <line
                key={bossStage.id}
                className={`boot-network-line${complete ? " boot-network-line-on" : ""}${
                  active ? " boot-network-line-live" : ""
                }`}
                x1="50"
                y1="50"
                x2={point.x}
                y2={point.y}
                style={{ opacity: complete || active || cityOnline ? 1 : index < stageIndex ? 0.65 : 0.22 }}
              />
            );
          })}
        </svg>

        <div className={`boot-core${cityOnline ? " boot-core-live" : ""}`} style={{ left: "50%", top: "50%" }}>
          <div className="boot-core-ring boot-core-ring-one" />
          <div className="boot-core-ring boot-core-ring-two" />
          <div className="boot-core-heart">
            <span className="boot-core-chip">CPU</span>
            <small>{cityOnline ? "ONLINE" : "BOOTING"}</small>
          </div>
        </div>

        <section
          className={`boot-module boot-module-power${
            stage.id === "power" && phase === "playing" ? " boot-module-active" : ""
          }${includesId(completedStages, "power") ? " boot-module-complete" : ""}${
            wrongModule === "power" ? " boot-module-wrong" : ""
          }`}
          style={{ left: "22%", top: "26%" }}
        >
          <div className="boot-module-header">
            <span>Power Rails</span>
            <strong>Target 5</strong>
          </div>
          <div className="boot-bit-grid">
            {BIT_POWERS.map((power, index) => (
              <button
                key={power}
                className={`boot-bit${bits[index] ? " boot-bit-on" : ""}`}
                onClick={() => handleBitToggle(index)}
                type="button"
                disabled={phase !== "playing" || stage.id !== "power"}
              >
                <span>{bits[index] ? 1 : 0}</span>
                <small>{power}</small>
              </button>
            ))}
          </div>
          <div className="boot-module-readout">Current: {bitValue}</div>
        </section>

        <section
          className={`boot-module boot-module-byte${
            stage.id === "byte" && phase === "playing" ? " boot-module-active" : ""
          }${includesId(completedStages, "byte") ? " boot-module-complete" : ""}${
            wrongModule === "byte" ? " boot-module-wrong" : ""
          }`}
          style={{ left: "78%", top: "26%" }}
        >
          <div className="boot-module-header">
            <span>Boot Byte</span>
            <strong>{byteCharge}/8</strong>
          </div>
          <div className="boot-byte-grid">
            {byteCells.map((active, index) => (
              <button
                key={index}
                className={`boot-byte-cell${active ? " boot-byte-cell-on" : ""}`}
                onClick={() => handleByteCellToggle(index)}
                type="button"
                disabled={phase !== "playing" || stage.id !== "byte"}
              >
                {active ? 1 : 0}
              </button>
            ))}
          </div>
          <div className={`boot-byte-capsule${byteCharge === 8 ? " boot-byte-capsule-sealed" : ""}`}>
            Packet
          </div>
        </section>

        <section
          className={`boot-module boot-module-memory${
            stage.id === "memory" && phase === "playing" ? " boot-module-active" : ""
          }${includesId(completedStages, "memory") ? " boot-module-complete" : ""}${
            wrongModule === "memory" ? " boot-module-wrong" : ""
          }`}
          style={{ left: "22%", top: "74%" }}
        >
          <div className="boot-module-header">
            <span>Memory Dock</span>
            <strong>Live Patch</strong>
          </div>
          <div className="boot-memory-board">
            <div className={`boot-patch-chip${memoryTarget ? ` boot-patch-chip-${memoryTarget}` : ""}`}>
              Patch
            </div>
            <button
              className={`boot-memory-slot${memoryTarget === "ram" ? " boot-memory-slot-on" : ""}`}
              onClick={() => handleMemoryChoice("ram")}
              type="button"
              disabled={phase !== "playing" || stage.id !== "memory"}
            >
              RAM
            </button>
            <button
              className={`boot-memory-slot${memoryTarget === "storage" ? " boot-memory-slot-on" : ""}`}
              onClick={() => handleMemoryChoice("storage")}
              type="button"
              disabled={phase !== "playing" || stage.id !== "memory"}
            >
              Storage
            </button>
          </div>
        </section>

        <section
          className={`boot-module boot-module-signal${
            stage.id === "signal" && phase === "playing" ? " boot-module-active" : ""
          }${includesId(completedStages, "signal") ? " boot-module-complete" : ""}${
            wrongModule === "signal" ? " boot-module-wrong" : ""
          }`}
          style={{ left: "78%", top: "74%" }}
        >
          <div className="boot-module-header">
            <span>Signal Route</span>
            <strong>{"I -> P -> O"}</strong>
          </div>
          <div className="boot-signal-track">
            {SIGNAL_ORDER.map((nodeId, index) => {
              const active = signalPath.includes(nodeId);
              return (
                <button
                  key={nodeId}
                  className={`boot-signal-node${active ? " boot-signal-node-on" : ""}`}
                  onClick={() => handleSignalNode(nodeId)}
                  type="button"
                  disabled={phase !== "playing" || stage.id !== "signal"}
                >
                  <span>{nodeId.slice(0, 1).toUpperCase()}</span>
                  <small>{nodeId}</small>
                  {index < SIGNAL_ORDER.length - 1 && <i className="boot-signal-link" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </section>

        <section
          className={`boot-module boot-module-output${
            stage.id === "output" && phase === "playing" ? " boot-module-active" : ""
          }${includesId(completedStages, "output") ? " boot-module-complete" : ""}${
            wrongModule === "output" ? " boot-module-wrong" : ""
          }`}
          style={{ left: "50%", top: "86%" }}
        >
          <div className="boot-module-header">
            <span>Output Array</span>
            <strong>Choose Display</strong>
          </div>
          <div className="boot-output-options">
            <button
              className={`boot-output-btn${outputTarget === "screen" ? " boot-output-btn-on" : ""}`}
              onClick={() => handleOutputChoice("screen")}
              type="button"
              disabled={phase !== "playing" || stage.id !== "output"}
            >
              Screen Wall
            </button>
            <button
              className={`boot-output-btn${outputTarget === "speaker" ? " boot-output-btn-on" : ""}`}
              onClick={() => handleOutputChoice("speaker")}
              type="button"
              disabled={phase !== "playing" || stage.id !== "output"}
            >
              Speaker Dock
            </button>
          </div>
          <div className={`boot-screen-wall${cityOnline || outputTarget === "screen" ? " boot-screen-wall-on" : ""}`}>
            <span>{cityOnline ? "CORE ONLINE" : outputTarget === "screen" ? "BOOTING..." : "READY"}</span>
          </div>
        </section>
      </div>
    </GameScene>
  );
}

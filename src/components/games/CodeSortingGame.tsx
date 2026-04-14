"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import GameScene from "@/components/game/GameScene";
import FbxAssetStage from "@/components/game/FbxAssetStage";
import { useCompanion } from "@/lib/game/use-companion";
import { useGameMeta } from "@/lib/game/use-game-meta";
import { useParticles } from "@/lib/game/use-particles";
import { useSound } from "@/lib/game/use-sound";
import { useUser } from "@/lib/store";

interface Props {
  onComplete: () => void;
  accent: string;
}

type Direction = "N" | "E" | "S" | "W";
type CommandId = "forward" | "left" | "right" | "boost";

interface Position {
  x: number;
  y: number;
  dir: Direction;
}

interface GridPoint {
  x: number;
  y: number;
}

interface Mission {
  id: string;
  title: string;
  objective: string;
  shipName: string;
  shipAsset: string;
  shipRole: string;
  size: number;
  start: Position;
  goal: GridPoint;
  obstacles: GridPoint[];
  allowedCommands: CommandId[];
  maxCommands: number;
  introLine: string;
  winLine: string;
}

interface CommandSpec {
  id: CommandId;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  description: string;
}

const COMMANDS: Record<CommandId, CommandSpec> = {
  forward: {
    id: "forward",
    label: "Forward",
    shortLabel: "FWD",
    icon: "↑",
    color: "#38bdf8",
    description: "Move one tile forward.",
  },
  left: {
    id: "left",
    label: "Turn Left",
    shortLabel: "LEFT",
    icon: "↺",
    color: "#f59e0b",
    description: "Rotate left without moving.",
  },
  right: {
    id: "right",
    label: "Turn Right",
    shortLabel: "RIGHT",
    icon: "↻",
    color: "#a78bfa",
    description: "Rotate right without moving.",
  },
  boost: {
    id: "boost",
    label: "Boost",
    shortLabel: "BOOST",
    icon: "⇈",
    color: "#fb7185",
    description: "Move two tiles forward.",
  },
};

const MISSIONS: Mission[] = [
  {
    id: "signal-canyon",
    title: "Cross Signal Canyon",
    objective: "Guide the scout ship around the broken relay wall and dock at the beacon on the far side.",
    shipName: "Kingfisher",
    shipAsset: "/Assets/Kingfisher.fbx",
    shipRole: "Scout hull tuned for clean turns and narrow relay lanes.",
    size: 7,
    start: { x: 0, y: 4, dir: "E" },
    goal: { x: 6, y: 5 },
    obstacles: [
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 1, y: 1 },
      { x: 5, y: 2 },
    ],
    allowedCommands: ["forward", "left", "right"],
    maxCommands: 10,
    introLine: "Drop below the relay wall, then fly across to the beacon on the far side.",
    winLine: "Beacon linked. You routed cleanly around the broken relay wall.",
  },
  {
    id: "asteroid-switchback",
    title: "Asteroid Switchback",
    objective: "Thread through the asteroid field and dock at the upper beacon without hitting debris.",
    shipName: "Icarus",
    shipAsset: "/Assets/Icarus.fbx",
    shipRole: "Pathfinder frame built for precise switchbacks through dense fields.",
    size: 8,
    start: { x: 1, y: 6, dir: "N" },
    goal: { x: 6, y: 1 },
    obstacles: [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 4, y: 2 },
      { x: 5, y: 2 },
      { x: 6, y: 2 },
      { x: 4, y: 4 },
      { x: 4, y: 5 },
      { x: 4, y: 6 },
    ],
    allowedCommands: ["forward", "left", "right"],
    maxCommands: 14,
    introLine: "These rocks force a zig-zag. Build the route before you launch.",
    winLine: "Docking complete. Your sequence got the ship through cleanly.",
  },
  {
    id: "boost-gate",
    title: "Boost Gate Run",
    objective: "Use a boost command to clear the long corridor and hit the final dock dramatically.",
    shipName: "Stormspike",
    shipAsset: "/Assets/Stormspike.fbx",
    shipRole: "High-thrust runner made for boost corridors and dramatic docking runs.",
    size: 8,
    start: { x: 0, y: 4, dir: "E" },
    goal: { x: 7, y: 1 },
    obstacles: [
      { x: 1, y: 5 },
      { x: 2, y: 5 },
      { x: 3, y: 5 },
      { x: 4, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 0 },
      { x: 5, y: 1 },
      { x: 5, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
    ],
    allowedCommands: ["forward", "left", "right", "boost"],
    maxCommands: 11,
    introLine: "This lane is made for a boost, but only if you line it up first.",
    winLine: "Boost gate cleared. The ship landed right on the final dock.",
  },
];

function rotateLeft(dir: Direction): Direction {
  if (dir === "N") return "W";
  if (dir === "W") return "S";
  if (dir === "S") return "E";
  return "N";
}

function rotateRight(dir: Direction): Direction {
  if (dir === "N") return "E";
  if (dir === "E") return "S";
  if (dir === "S") return "W";
  return "N";
}

function moveForward(position: Position, distance = 1): Position {
  if (position.dir === "N") return { ...position, y: position.y - distance };
  if (position.dir === "E") return { ...position, x: position.x + distance };
  if (position.dir === "S") return { ...position, y: position.y + distance };
  return { ...position, x: position.x - distance };
}

function cellKey(point: GridPoint) {
  return `${point.x}-${point.y}`;
}

function directionRotation(dir: Direction) {
  // The tactical ship model faces north in its unrotated board view.
  if (dir === "N") return 0;
  if (dir === "E") return 90;
  if (dir === "S") return 180;
  return -90;
}

export default function CodeSortingGame({ onComplete, accent }: Props) {
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
  const [queue, setQueue] = useState<CommandId[]>([]);
  const [ship, setShip] = useState<Position>(MISSIONS[0].start);
  const [trail, setTrail] = useState<string[]>([cellKey(MISSIONS[0].start)]);
  const [phase, setPhase] = useState<"planning" | "running" | "complete">("planning");
  const [activeCommandIndex, setActiveCommandIndex] = useState<number | null>(null);
  const [statusText, setStatusText] = useState(MISSIONS[0].introLine);
  const [crashPoint, setCrashPoint] = useState<GridPoint | null>(null);

  const mission = MISSIONS[round];
  const obstacleSet = useMemo(() => new Set(mission.obstacles.map(cellKey)), [mission]);
  const reachedGoal = ship.x === mission.goal.x && ship.y === mission.goal.y;

  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  useEffect(() => {
    const player = userName || "Engineer";
    byteSay(`${player}, queue the commands and then hit run. The ship obeys every step.`, 3000);
    echoSay("Algorithms are instructions in a specific order.", 2400);
  }, [byteSay, echoSay, userName]);

  useEffect(() => {
    if (phase !== "running") return;

    let current = { ...mission.start };
    let stepIndex = 0;
    let cancelled = false;
    let timer: number | null = null;

    const finishRun = (nextStatus: string) => {
      setActiveCommandIndex(null);
      setPhase("planning");
      setStatusText(nextStatus);
    };

    const runStep = () => {
      if (cancelled) return;

      if (stepIndex >= queue.length) {
        finishRun("The ship drifted to a stop. Adjust the sequence and try again.");
        byteAlert("So close. The ship stopped before the beacon.");
        echoSay("The order is fine only if it reaches the goal.", 2200);
        return;
      }

      const command = queue[stepIndex];
      const commandSpec = COMMANDS[command];
      setActiveCommandIndex(stepIndex);
      setStatusText(`${commandSpec.label} executing...`);
      playPulse();

      if (command === "left") {
        current = { ...current, dir: rotateLeft(current.dir) };
        setShip(current);
        stepIndex += 1;
        timer = window.setTimeout(runStep, 520);
        return;
      }

      if (command === "right") {
        current = { ...current, dir: rotateRight(current.dir) };
        setShip(current);
        stepIndex += 1;
        timer = window.setTimeout(runStep, 520);
        return;
      }

      const moveDistance = command === "boost" ? 2 : 1;
      for (let segment = 0; segment < moveDistance; segment += 1) {
        const next = moveForward(current, 1);
        const outOfBounds =
          next.x < 0 || next.y < 0 || next.x >= mission.size || next.y >= mission.size;
        const blocked = obstacleSet.has(cellKey(next));

        if (outOfBounds || blocked) {
          const failPoint = outOfBounds
            ? {
                x: Math.max(0, Math.min(mission.size - 1, next.x)),
                y: Math.max(0, Math.min(mission.size - 1, next.y)),
              }
            : { x: next.x, y: next.y };

          setCrashPoint(failPoint);
          setActiveCommandIndex(stepIndex);
          setStatusText(outOfBounds ? "The ship flew out of bounds and spun out." : "Crash. An obstacle blocked the route.");
          recordWrong();
          playWrong();
          byteAlert(outOfBounds ? "The ship left the map!" : "Asteroid impact. We need a safer route.");
          echoSay("Computers follow the steps exactly, even when the steps are wrong.", 2400);

          timer = window.setTimeout(() => {
            setCrashPoint(null);
            setShip(mission.start);
            setTrail([cellKey(mission.start)]);
            setActiveCommandIndex(null);
            setPhase("planning");
          }, 820);
          return;
        }

        current = next;
        setShip(current);
        setTrail((prev) => [...prev, cellKey(current)]);

        if (current.x === mission.goal.x && current.y === mission.goal.y) {
          setStatusText(mission.winLine);
          setActiveCommandIndex(stepIndex);
          recordCorrect();
          playCorrect();
          if (comboRef.current + 1 > 1) playCombo(comboRef.current + 1);
          playComplete();
          byteCelebrate("Direct hit. The beacon is online!");
          echoSay("That sequence worked because every instruction happened in the right order.", 2500);

          const container = containerRef.current;
          if (container) {
            burst({
              x: container.clientWidth * ((mission.goal.x + 0.5) / mission.size),
              y: container.clientHeight * ((mission.goal.y + 0.5) / mission.size),
              color: accent,
              count: 20,
              spread: 90,
            });
          }

          timer = window.setTimeout(() => {
            if (round === MISSIONS.length - 1) {
              setPhase("complete");
              setActiveCommandIndex(null);
              setStatusText("All flight paths repaired. The navigation grid is stable again.");
              return;
            }

            const nextRound = round + 1;
            const nextMission = MISSIONS[nextRound];
            setRound(nextRound);
            setQueue([]);
            setShip(nextMission.start);
            setTrail([cellKey(nextMission.start)]);
            setPhase("planning");
            setActiveCommandIndex(null);
            setStatusText(nextMission.introLine);
            byteSay("New route loaded. Build the next flight plan.", 2200);
            echoSay("A different path needs a different sequence.", 2200);
          }, 1450);
          return;
        }
      }

      stepIndex += 1;
      timer = window.setTimeout(runStep, command === "boost" ? 640 : 520);
    };

    timer = window.setTimeout(runStep, 260);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
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
    obstacleSet,
    phase,
    playCombo,
    playComplete,
    playCorrect,
    playPulse,
    playWrong,
    queue,
    recordCorrect,
    recordWrong,
    round,
  ]);

  function addCommand(command: CommandId) {
    if (phase !== "planning") return;
    if (queue.length >= mission.maxCommands) {
      setStatusText("Queue full. Remove a command before adding another.");
      byteAlert("Queue maxed out. Trim the plan first.");
      return;
    }

    setQueue((prev) => [...prev, command]);
    setStatusText(`${COMMANDS[command].label} added to the flight plan.`);
    playTap();
  }

  function removeCommand(index: number) {
    if (phase !== "planning") return;
    setQueue((prev) => prev.filter((_, queueIndex) => queueIndex !== index));
    setStatusText("Command removed. You can rebuild the route.");
  }

  function clearQueue() {
    if (phase !== "planning") return;
    setQueue([]);
    setStatusText("Flight plan cleared. Build a new route.");
  }

  function handleRun() {
    if (phase !== "planning") return;
    if (queue.length === 0) {
      setStatusText("Add commands first. The ship needs a plan before launch.");
      byteAlert("No plan loaded. Give the ship instructions first.");
      return;
    }

    setTrail([cellKey(mission.start)]);
    setShip(mission.start);
    setCrashPoint(null);
    setStatusText("Thrusters online. Executing your sequence now...");
    setPhase("running");
    setActiveCommandIndex(0);
    byteSay("Launching in three... two... one...", 1600);
    echoSay("Now we watch the algorithm run.", 1600);
    playPulse();
  }

  const footer =
    phase === "complete" ? (
      <button className="game-btn" style={{ background: accent }} onClick={onComplete} type="button">
        Open Next Room
      </button>
    ) : null;

  return (
    <>
      <GameScene
        layout="birdseye"
        accent={accent}
        header={{ room: "Navigation Deck", step: `Route ${round + 1} of ${MISSIONS.length}` }}
        missionTitle="Spaceship Command Game"
        missionObjective={mission.objective}
        subtitle="Build the flight plan, then watch the ship obey it step by step."
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
          <div className="spacegame-panel">
            <div className="spacegame-mission-card">
              <span className="spacegame-mission-kicker">Mission</span>
              <strong>{mission.title}</strong>
              <div className="spacegame-mission-ship">
                <div className="spacegame-mission-ship-stage">
                  <FbxAssetStage
                    modelPath={mission.shipAsset}
                    accent={accent}
                    title={mission.shipName}
                    variant="hero"
                    zoom={1.1}
                    modelRotation={[0.1, -0.55, 0]}
                  />
                </div>
                <div className="spacegame-mission-ship-copy">
                  <span className="spacegame-mission-ship-label">Scout Frame</span>
                  <strong>{mission.shipName}</strong>
                  <small>{mission.shipRole}</small>
                </div>
              </div>
              <p>{mission.objective}</p>
              <span className="spacegame-mission-limit">Queue limit: {mission.maxCommands}</span>
            </div>

            <div className="spacegame-command-bank">
              {mission.allowedCommands.map((commandId) => {
                const command = COMMANDS[commandId];
                return (
                  <button
                    key={command.id}
                    className="spacegame-command-chip"
                    onClick={() => addCommand(command.id)}
                    type="button"
                    disabled={phase !== "planning" || queue.length >= mission.maxCommands}
                    style={{ borderColor: `${command.color}55` }}
                  >
                    <span className="spacegame-command-icon" style={{ background: `${command.color}24`, color: command.color }}>
                      {command.icon}
                    </span>
                    <span className="spacegame-command-copy">
                      <strong>{command.label}</strong>
                      <small>{command.description}</small>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="spacegame-queue">
              <div className="spacegame-queue-header">
                <span>Flight Plan</span>
                <span>{queue.length}/{mission.maxCommands}</span>
              </div>

              <div className="spacegame-queue-list">
                {queue.length > 0 ? (
                  queue.map((commandId, index) => {
                    const command = COMMANDS[commandId];
                    const active = activeCommandIndex === index && phase === "running";
                    return (
                      <button
                        key={`${commandId}-${index}`}
                        className={`spacegame-queue-item${active ? " spacegame-queue-item-active" : ""}`}
                        onClick={() => removeCommand(index)}
                        type="button"
                        disabled={phase !== "planning"}
                        style={{
                          borderColor: active ? command.color : undefined,
                          boxShadow: active ? `0 0 20px ${command.color}33` : undefined,
                        }}
                      >
                        <span className="spacegame-queue-top">
                          <span className="spacegame-queue-step">{index + 1}</span>
                          <span className="spacegame-queue-remove">×</span>
                        </span>
                        <span
                          className="spacegame-queue-icon"
                          style={{ background: `${command.color}22`, color: command.color }}
                        >
                          {command.icon}
                        </span>
                        <span className="spacegame-queue-name">{command.shortLabel}</span>
                        <span className="spacegame-queue-meta">{command.label}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="spacegame-queue-empty">Add commands to build the route.</div>
                )}
              </div>
            </div>
          </div>
        }
        footer={footer}
      >
        <div ref={containerRef} className={`spacegame-board-wrap${crashPoint ? " game-shake" : ""}`}>
          <div
            className="spacegame-board"
            style={{
              gridTemplateColumns: `repeat(${mission.size}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${mission.size}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: mission.size * mission.size }, (_, index) => {
              const x = index % mission.size;
              const y = Math.floor(index / mission.size);
              const key = cellKey({ x, y });
              const isObstacle = obstacleSet.has(key);
              const isGoal = mission.goal.x === x && mission.goal.y === y;
              const inTrail = trail.includes(key) && !isGoal;
              const isStart = mission.start.x === x && mission.start.y === y;
              const isCrash = crashPoint?.x === x && crashPoint?.y === y;

              return (
                <div
                  key={key}
                  className={`spacegame-cell${isObstacle ? " spacegame-cell-obstacle" : ""}${
                    isGoal ? " spacegame-cell-goal" : ""
                  }${inTrail ? " spacegame-cell-trail" : ""}${isStart ? " spacegame-cell-start" : ""}${
                    isCrash ? " spacegame-cell-crash" : ""
                  }`}
                >
                  {isObstacle && <span className="spacegame-asteroid" aria-hidden="true" />}
                  {isGoal && <span className={`spacegame-beacon${reachedGoal ? " spacegame-beacon-live" : ""}`} aria-hidden="true" />}
                </div>
              );
            })}

            <div
              className={`spacegame-ship${phase === "running" ? " spacegame-ship-flying" : ""}`}
              style={{
                left: `${((ship.x + 0.5) / mission.size) * 100}%`,
                top: `${((ship.y + 0.5) / mission.size) * 100}%`,
                transform: `translate(-50%, -50%) rotate(${directionRotation(ship.dir)}deg)`,
              }}
              aria-label="Scout ship"
            >
              <div className="spacegame-ship-shell">
                <FbxAssetStage
                  modelPath={mission.shipAsset}
                  accent={accent}
                  title={mission.shipName}
                  variant="board"
                  zoom={1.08}
                  autoRotate={false}
                  float={false}
                  modelRotation={[0, Math.PI / 2, 0]}
                />
              </div>
              <span className="spacegame-ship-thruster" aria-hidden="true" />
            </div>
          </div>
        </div>
      </GameScene>

      {phase !== "complete" && (
        <div className="spacegame-floating-actions" aria-label="Flight controls">
          <div className="spacegame-floating-actions-inner">
            <button
              className="spacegame-secondary-btn"
              onClick={clearQueue}
              type="button"
              disabled={phase !== "planning" || queue.length === 0}
            >
              Clear
            </button>
            <button
              className="game-btn spacegame-run-btn"
              style={{ background: accent }}
              onClick={handleRun}
              type="button"
              disabled={phase !== "planning" || queue.length === 0}
            >
              Run Route
            </button>
          </div>
        </div>
      )}
    </>
  );
}

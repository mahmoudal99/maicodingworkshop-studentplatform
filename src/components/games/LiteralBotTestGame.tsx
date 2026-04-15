"use client";

import { useEffect, useRef, useState, type CSSProperties, type DragEvent } from "react";
import GameScene from "@/components/game/GameScene";
import FbxAssetStage from "@/components/game/FbxAssetStage";
import { useGameMeta } from "@/lib/game/use-game-meta";
import { useParticles } from "@/lib/game/use-particles";
import { useSound } from "@/lib/game/use-sound";

interface Props {
  onComplete: () => void;
  accent: string;
}

type Direction = "N" | "E" | "S" | "W";
type ObjectKind = "lamp" | "switch" | "door" | "cube" | "pad";
type CommandKind = "move" | "left" | "right" | "target" | "use" | "grab" | "drop";

interface GridPoint {
  x: number;
  y: number;
}

interface RobotState extends GridPoint {
  dir: Direction;
}

interface WorldObject extends GridPoint {
  id: string;
  kind: ObjectKind;
  label: string;
  color: string;
  names: string[];
  genericNames: string[];
  on?: boolean;
  open?: boolean;
  placedOn?: string | null;
}

interface ParsedCommand {
  kind: CommandKind;
  value?: string;
  raw: string;
}

interface RuntimeState {
  robot: RobotState;
  objects: WorldObject[];
  targetId: string | null;
  carryingId: string | null;
}

interface MissionConfig {
  id: string;
  title: string;
  objective: string;
  introLine: string;
  successLine: string;
  example: string;
  commandChips: string[];
  goalLabel: string;
  grid: { cols: number; rows: number };
  robotStart: RobotState;
  objects: WorldObject[];
  targetPattern?: boolean[];
}

const MISSIONS: MissionConfig[] = [
  {
    id: "lamp-bay",
    title: "Planet Targeting Run",
    objective: "Move the drone into range, target the blue planet, and wake it up.",
    introLine: "Build instructions, then run them. Vague targeting wakes the wrong planet.",
    successLine: "Blue planet online. Precision routing fixed the bay.",
    example: "move\nmove\nright\nmove\nmove\ntarget blue planet\nuse",
    commandChips: ["move", "left", "right", "target planet", "target blue planet", "use"],
    goalLabel: "Wake the blue planet.",
    grid: { cols: 6, rows: 5 },
    robotStart: { x: 1, y: 4, dir: "N" },
    objects: [
      {
        id: "amber-lamp",
        kind: "lamp",
        label: "Amber Planet",
        color: "#f59e0b",
        x: 1,
        y: 2,
        names: ["amber planet", "amber lamp"],
        genericNames: ["planet", "lamp"],
      },
      {
        id: "blue-lamp",
        kind: "lamp",
        label: "Blue Planet",
        color: "#38bdf8",
        x: 4,
        y: 2,
        names: ["blue planet", "blue lamp"],
        genericNames: ["planet", "lamp"],
      },
    ],
  },
  {
    id: "binary-gate",
    title: "Binary Gate Repair",
    objective: "Toggle the switch lights until the gate reads ON OFF ON.",
    introLine: "Binary lives in switches. Set the real lights, then the door will answer.",
    successLine: "Gate unlocked. The switch pattern matched the ship signal.",
    example: "move\ntarget left switch\nuse\ntarget middle switch\nuse\ntarget right switch\nuse",
    commandChips: [
      "move",
      "left",
      "right",
      "target switch",
      "target left switch",
      "target middle switch",
      "target right switch",
      "use",
    ],
    goalLabel: "Match the gate lights to ON OFF ON.",
    targetPattern: [true, false, true],
    grid: { cols: 6, rows: 5 },
    robotStart: { x: 2, y: 3, dir: "N" },
    objects: [
      {
        id: "left-switch",
        kind: "switch",
        label: "Left Switch",
        color: "#46d9ff",
        x: 1,
        y: 2,
        names: ["left switch"],
        genericNames: ["switch"],
        on: false,
      },
      {
        id: "middle-switch",
        kind: "switch",
        label: "Middle Switch",
        color: "#46d9ff",
        x: 2,
        y: 2,
        names: ["middle switch", "center switch"],
        genericNames: ["switch"],
        on: true,
      },
      {
        id: "right-switch",
        kind: "switch",
        label: "Right Switch",
        color: "#46d9ff",
        x: 3,
        y: 2,
        names: ["right switch"],
        genericNames: ["switch"],
        on: false,
      },
      {
        id: "binary-door",
        kind: "door",
        label: "Gate Door",
        color: "#3be67f",
        x: 4,
        y: 1,
        names: ["door", "gate"],
        genericNames: ["door", "gate"],
        open: false,
      },
    ],
  },
  {
    id: "cargo-bay",
    title: "Cargo Precision Drop",
    objective: "Grab the cube and place it on the red pad, not just any pad.",
    introLine: "Exact object, exact destination. If the target is vague, the cargo lands wrong.",
    successLine: "Cargo aligned. The drone followed the full instruction path.",
    example: "move\nmove\ntarget cube\ngrab\nright\nmove\nmove\nmove\ntarget red pad\ndrop",
    commandChips: [
      "move",
      "left",
      "right",
      "target cube",
      "grab",
      "target pad",
      "target red pad",
      "target blue pad",
      "drop",
    ],
    goalLabel: "Place the cube on the red pad.",
    grid: { cols: 6, rows: 5 },
    robotStart: { x: 1, y: 4, dir: "N" },
    objects: [
      {
        id: "cargo-cube",
        kind: "cube",
        label: "Cargo Cube",
        color: "#f8fafc",
        x: 1,
        y: 2,
        names: ["cube", "cargo cube"],
        genericNames: ["cube", "cargo"],
      },
      {
        id: "blue-pad",
        kind: "pad",
        label: "Blue Pad",
        color: "#38bdf8",
        x: 2,
        y: 1,
        names: ["blue pad"],
        genericNames: ["pad"],
      },
      {
        id: "red-pad",
        kind: "pad",
        label: "Red Pad",
        color: "#fb7185",
        x: 4,
        y: 1,
        names: ["red pad"],
        genericNames: ["pad"],
      },
    ],
  },
];

const MISSION_SHIP_ASSETS: Record<string, string> = {
  "lamp-bay": "/Assets/Kingfisher.fbx",
  "binary-gate": "/Assets/Icarus.fbx",
  "cargo-bay": "/Assets/Stormspike.fbx",
};

const OBJECT_PLANET_SKINS: Record<string, string> = {
  "amber-lamp": "/Planets/p12.png",
  "blue-lamp": "/Planets/p11.png",
  "left-switch": "/Planets/p3.png",
  "middle-switch": "/Planets/p8.png",
  "right-switch": "/Planets/p5.png",
  "cargo-cube": "/Planets/p3.png",
  "blue-pad": "/Planets/p11.png",
  "red-pad": "/Planets/p7.png",
};

function cloneObjects(objects: WorldObject[]) {
  return objects.map((object) => ({ ...object }));
}

function createRuntime(mission: MissionConfig): RuntimeState {
  return {
    robot: { ...mission.robotStart },
    objects: cloneObjects(mission.objects),
    targetId: null,
    carryingId: null,
  };
}

function cloneRuntime(runtime: RuntimeState): RuntimeState {
  return {
    robot: { ...runtime.robot },
    objects: cloneObjects(runtime.objects),
    targetId: runtime.targetId,
    carryingId: runtime.carryingId,
  };
}

function normalizeText(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

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

function moveForward(robot: RobotState): RobotState {
  if (robot.dir === "N") return { ...robot, y: robot.y - 1 };
  if (robot.dir === "E") return { ...robot, x: robot.x + 1 };
  if (robot.dir === "S") return { ...robot, y: robot.y + 1 };
  return { ...robot, x: robot.x - 1 };
}

function distance(a: GridPoint, b: GridPoint) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function isInRange(robot: RobotState, object: WorldObject) {
  return distance(robot, object) <= 1;
}

function parseProgram(code: string) {
  const commands: ParsedCommand[] = [];
  const lines = code.split("\n");

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index].trim();
    if (!raw || raw.startsWith("//")) continue;

    const normalized = normalizeText(raw);

    if (normalized === "move" || normalized === "forward") {
      commands.push({ kind: "move", raw });
      continue;
    }

    if (normalized === "left" || normalized === "turn left") {
      commands.push({ kind: "left", raw });
      continue;
    }

    if (normalized === "right" || normalized === "turn right") {
      commands.push({ kind: "right", raw });
      continue;
    }

    if (normalized.startsWith("target ")) {
      commands.push({ kind: "target", value: normalized.slice(7).trim(), raw });
      continue;
    }

    if (normalized === "use" || normalized === "activate" || normalized === "toggle") {
      commands.push({ kind: "use", raw });
      continue;
    }

    if (normalized === "grab" || normalized === "pickup" || normalized === "pick up") {
      commands.push({ kind: "grab", raw });
      continue;
    }

    if (normalized === "drop" || normalized === "place") {
      commands.push({ kind: "drop", raw });
      continue;
    }

    return {
      commands,
      error: `Line ${index + 1} is unreadable. Try commands like move, target blue planet, use, grab, or drop.`,
    };
  }

  if (commands.length === 0) {
    return { commands, error: "The command deck is empty. Build a few instructions first." };
  }

  return { commands, error: null };
}

function resolveTarget(runtime: RuntimeState, query: string) {
  const normalized = normalizeText(query);
  const exact = runtime.objects.find((object) =>
    object.names.some((name) => normalizeText(name) === normalized)
  );

  if (exact) return exact;

  const genericMatches = runtime.objects.filter((object) =>
    object.genericNames.some((name) => normalizeText(name) === normalized)
  );

  if (genericMatches.length === 0) return null;

  return [...genericMatches].sort((left, right) => {
    const distanceDiff = distance(runtime.robot, left) - distance(runtime.robot, right);
    if (distanceDiff !== 0) return distanceDiff;
    return left.x - right.x;
  })[0];
}

function getObject(runtime: RuntimeState, objectId: string | null) {
  if (!objectId) return null;
  return runtime.objects.find((object) => object.id === objectId) ?? null;
}

function getCurrentPattern(runtime: RuntimeState) {
  return runtime.objects
    .filter((object) => object.kind === "switch")
    .sort((left, right) => left.x - right.x)
    .map((object) => Boolean(object.on));
}

function matchesPattern(pattern: boolean[], target: boolean[]) {
  return pattern.length === target.length && pattern.every((value, index) => value === target[index]);
}

function isMissionSolved(mission: MissionConfig, runtime: RuntimeState) {
  if (mission.id === "lamp-bay") {
    return Boolean(getObject(runtime, "blue-lamp")?.on);
  }

  if (mission.id === "binary-gate") {
    return Boolean(getObject(runtime, "binary-door")?.open);
  }

  if (mission.id === "cargo-bay") {
    return getObject(runtime, "cargo-cube")?.placedOn === "red-pad";
  }

  return false;
}

function getObjectPositionStyle(object: WorldObject, mission: MissionConfig, runtime: RuntimeState) {
  const cols = mission.grid.cols;
  const rows = mission.grid.rows;
  let x = object.x;
  let y = object.y;

  if (object.id === runtime.carryingId) {
    x = runtime.robot.x;
    y = runtime.robot.y;
  }

  return {
    left: `${((x + 0.5) / cols) * 100}%`,
    top: `${((y + 0.5) / rows) * 100}%`,
  };
}

function getRobotStyle(mission: MissionConfig, robot: RobotState): CSSProperties {
  return {
    left: `${((robot.x + 0.5) / mission.grid.cols) * 100}%`,
    top: `${((robot.y + 0.5) / mission.grid.rows) * 100}%`,
    "--robot-rotation": `${robot.dir === "N" ? 0 : robot.dir === "E" ? 90 : robot.dir === "S" ? 180 : -90}deg`,
  } as CSSProperties;
}

function formatChipLabel(snippet: string) {
  return snippet.toUpperCase();
}

function getObjectPlanet(object: WorldObject) {
  return OBJECT_PLANET_SKINS[object.id] ?? "/Planets/p8.png";
}

export default function LiteralBotTestGame({ onComplete, accent }: Props) {
  const missionCount = MISSIONS.length;
  const { playTap, playCorrect, playWrong, playCombo, playComplete, playPulse } = useSound();
  const { containerRef, burst } = useParticles();
  const { stability, combo, recordCorrect, recordWrong } = useGameMeta(missionCount);
  const comboRef = useRef(combo);
  const timersRef = useRef<number[]>([]);
  const dragSnippetRef = useRef<string | null>(null);

  const [round, setRound] = useState(0);
  const [program, setProgram] = useState("");
  const [runtime, setRuntime] = useState<RuntimeState>(() => createRuntime(MISSIONS[0]));
  const [phase, setPhase] = useState<"editing" | "running" | "transition" | "complete">("editing");
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [statusText, setStatusText] = useState(MISSIONS[0].introLine);
  const [runningCommands, setRunningCommands] = useState<ParsedCommand[]>([]);
  const [lastResult, setLastResult] = useState<"success" | "error" | null>(null);

  const mission = MISSIONS[round];
  const shipAsset = MISSION_SHIP_ASSETS[mission.id] ?? "/Assets/Kingfisher.fbx";
  const currentTarget = getObject(runtime, runtime.targetId);
  const carryingObject = getObject(runtime, runtime.carryingId);
  const currentPattern = mission.id === "binary-gate" ? getCurrentPattern(runtime) : null;
  const displayLines =
    phase === "running"
      ? runningCommands.map((command) => command.raw)
      : program.split("\n").filter((line) => line.trim().length > 0);

  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    setProgram("");
    setRuntime(createRuntime(mission));
    setPhase("editing");
    setActiveLine(null);
    setStatusText(mission.introLine);
    setRunningCommands([]);
    setLastResult(null);
  }, [mission]);

  function clearTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }

  function resetMissionView(nextStatus = mission.introLine) {
    setRuntime(createRuntime(mission));
    setPhase("editing");
    setActiveLine(null);
    setRunningCommands([]);
    setStatusText(nextStatus);
    setLastResult(null);
  }

  function burstAtPoint(point: GridPoint, color = accent) {
    const container = containerRef.current;
    if (!container) return;

    burst({
      x: container.clientWidth * ((point.x + 0.5) / mission.grid.cols),
      y: container.clientHeight * ((point.y + 0.5) / mission.grid.rows),
      color,
      count: 16,
      spread: 92,
      size: 7,
    });
  }

  function appendSnippet(snippet: string) {
    if (phase !== "editing") return;
    setProgram((current) => (current.trim().length ? `${current.trimEnd()}\n${snippet}` : snippet));
    setStatusText(`Added "${snippet}". Run it or keep building.`);
    playTap();
  }

  function handleDropSnippet(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const snippet = event.dataTransfer.getData("text/plain") || dragSnippetRef.current;
    dragSnippetRef.current = null;
    if (snippet) appendSnippet(snippet);
  }

  function handleClearProgram() {
    if (phase !== "editing") return;
    setProgram("");
    setStatusText("Command deck cleared. Build a fresh instruction path.");
  }

  function handleResetRoom() {
    if (phase === "running") return;
    resetMissionView("Room reset. Build a new instruction path.");
    playPulse();
  }

  function finishFailure(summary: string) {
    recordWrong();
    playWrong();
    setLastResult("error");
    setStatusText(summary);
    setPhase("transition");

    const resetTimer = window.setTimeout(() => {
      resetMissionView("Adjust the instructions and run the drone again.");
    }, 1600);

    timersRef.current.push(resetTimer);
  }

  function finishSuccess() {
    recordCorrect();
    playCorrect();
    if (comboRef.current + 1 > 1) playCombo(comboRef.current + 1);
    playComplete();
    setLastResult("success");
    setStatusText(mission.successLine);
    setPhase("transition");

    if (mission.id === "lamp-bay") {
      burstAtPoint({ x: 4, y: 2 }, "#38bdf8");
    } else if (mission.id === "binary-gate") {
      burstAtPoint({ x: 4, y: 1 }, "#3be67f");
    } else {
      burstAtPoint({ x: 4, y: 1 }, "#fb7185");
    }

    const nextTimer = window.setTimeout(() => {
      if (round === missionCount - 1) {
        setPhase("complete");
        setStatusText("Command bay restored. Every instruction path now runs cleanly.");
        setActiveLine(null);
        return;
      }

      setRound((current) => current + 1);
    }, 1650);

    timersRef.current.push(nextTimer);
  }

  function executeProgram() {
    if (phase !== "editing") return;

    const parsed = parseProgram(program);
    if (parsed.error) {
      setStatusText(parsed.error);
      playWrong();
      setLastResult("error");
      return;
    }

    clearTimers();
    const initialRuntime = createRuntime(mission);
    setRuntime(initialRuntime);
    setRunningCommands(parsed.commands);
    setPhase("running");
    setActiveLine(0);
    setStatusText("Drone online. Executing the command deck...");
    setLastResult(null);
    playPulse();

    let working = cloneRuntime(initialRuntime);

    const executeStep = (index: number) => {
      if (index >= parsed.commands.length) {
        if (isMissionSolved(mission, working)) {
          finishSuccess();
        } else {
          finishFailure("The drone followed the program, but the room is still not repaired.");
        }
        return;
      }

      const command = parsed.commands[index];
      setActiveLine(index);

      if (command.kind === "move") {
        const nextRobot = moveForward(working.robot);
        const insideBounds =
          nextRobot.x >= 0 &&
          nextRobot.y >= 0 &&
          nextRobot.x < mission.grid.cols &&
          nextRobot.y < mission.grid.rows;

        if (insideBounds) {
          working.robot = nextRobot;
          setStatusText("Drone moved one tile forward.");
        } else {
          setStatusText("Bonk. The drone hit the cockpit wall and stayed put.");
          playWrong();
        }
      }

      if (command.kind === "left") {
        working.robot = { ...working.robot, dir: rotateLeft(working.robot.dir) };
        setStatusText("Drone turned left.");
      }

      if (command.kind === "right") {
        working.robot = { ...working.robot, dir: rotateRight(working.robot.dir) };
        setStatusText("Drone turned right.");
      }

      if (command.kind === "target") {
        const resolved = resolveTarget(working, command.value || "");
        if (resolved) {
          working.targetId = resolved.id;
          setStatusText(
            resolved.names.some((name) => normalizeText(name) === normalizeText(command.value || ""))
              ? `Target locked: ${resolved.label}.`
              : `Target was vague, so the drone locked onto the nearest ${resolved.genericNames[0]}.`
          );
        } else {
          working.targetId = null;
          setStatusText(`No system answered to "${command.value}".`);
          playWrong();
        }
      }

      if (command.kind === "use") {
        const target =
          getObject(working, working.targetId) ??
          [...working.objects]
            .filter((object) => object.kind === "lamp" || object.kind === "switch")
            .sort((left, right) => distance(working.robot, left) - distance(working.robot, right))[0] ??
          null;

        if (!target) {
          setStatusText("The drone had nothing to use.");
        } else if (!isInRange(working.robot, target)) {
          setStatusText(`${target.label} is out of reach. The drone coasted too far away.`);
          playWrong();
        } else if (target.kind === "lamp") {
          target.on = true;
          setStatusText(
            target.id === "blue-lamp"
              ? "Blue planet activated."
              : `${target.label} woke up instead. The command hit the wrong target.`
          );
          burstAtPoint(target, target.color);
          playPulse();
        } else if (target.kind === "switch") {
          target.on = !target.on;
          const door = getObject(working, "binary-door");
          const nextPattern = getCurrentPattern(working);
          if (door && mission.targetPattern) {
            door.open = matchesPattern(nextPattern, mission.targetPattern);
          }
          setStatusText(
            `${target.label} toggled ${target.on ? "on" : "off"}.` +
              (door?.open ? " The gate answered immediately." : "")
          );
          burstAtPoint(target, target.on ? "#46d9ff" : "#94a3b8");
          playPulse();
        } else {
          setStatusText(`The drone tagged ${target.label}, but nothing useful happened.`);
        }
      }

      if (command.kind === "grab") {
        const target =
          getObject(working, working.targetId) ??
          working.objects.find((object) => object.kind === "cube") ??
          null;

        if (working.carryingId) {
          setStatusText("The drone is already carrying something.");
          playWrong();
        } else if (!target || target.kind !== "cube") {
          setStatusText("There is no cargo selected to grab.");
          playWrong();
        } else if (!isInRange(working.robot, target)) {
          setStatusText("The cube is too far away to grab.");
          playWrong();
        } else {
          working.carryingId = target.id;
          target.placedOn = null;
          setStatusText("Cargo cube picked up.");
          burstAtPoint(target, "#f8fafc");
          playPulse();
        }
      }

      if (command.kind === "drop") {
        const cargo = getObject(working, working.carryingId);
        const target =
          getObject(working, working.targetId) ??
          [...working.objects]
            .filter((object) => object.kind === "pad")
            .sort((left, right) => distance(working.robot, left) - distance(working.robot, right))[0] ??
          null;

        if (!cargo) {
          setStatusText("The drone opened its grip, but there was nothing to drop.");
          playWrong();
        } else if (target && target.kind === "pad" && isInRange(working.robot, target)) {
          cargo.x = target.x;
          cargo.y = target.y;
          cargo.placedOn = target.id;
          working.carryingId = null;
          setStatusText(
            target.id === "red-pad"
              ? "Cargo placed on the red pad."
              : `Cargo landed on ${target.label} instead of the mission target.`
          );
          burstAtPoint(target, target.color);
          playPulse();
        } else {
          cargo.x = working.robot.x;
          cargo.y = working.robot.y;
          cargo.placedOn = null;
          working.carryingId = null;
          setStatusText("The drone dropped the cargo at its feet.");
          playWrong();
        }
      }

      setRuntime(cloneRuntime(working));

      if (isMissionSolved(mission, working)) {
        finishSuccess();
        return;
      }

      const nextTimer = window.setTimeout(() => executeStep(index + 1), 640);
      timersRef.current.push(nextTimer);
    };

    const startTimer = window.setTimeout(() => executeStep(0), 260);
    timersRef.current.push(startTimer);
  }

  const footer =
    phase === "complete" ? (
      <button className="game-btn" style={{ background: accent }} onClick={onComplete} type="button">
        Open Next Room
      </button>
    ) : null;

  const phaseLabel =
    phase === "editing"
      ? "Build script"
      : phase === "running"
        ? "Executing"
        : phase === "complete"
          ? "Bay clear"
          : lastResult === "success"
            ? "Fixed"
            : "Adjust";

  const phaseMessage =
    phase === "editing"
      ? "Write the steps, then press Run."
      : phase === "running"
        ? `Running ${activeLine !== null ? activeLine + 1 : 1} of ${Math.max(runningCommands.length, 1)}.`
        : lastResult === "success"
          ? "That script repaired the room."
          : "Change the script and try again.";

  const statusMeta = [
    currentTarget ? `Target ${currentTarget.label}` : null,
    carryingObject ? `Carrying ${carryingObject.label}` : null,
    combo > 1 ? `${combo}x combo` : null,
  ].filter(Boolean) as string[];

  return (
    <GameScene
      layout="birdseye"
      accent={accent}
      header={{ room: "Command Bay", step: `Mission ${round + 1} of ${missionCount}` }}
      missionTitle={mission.title}
      missionObjective={mission.objective}
      stability={{ stability, combo }}
      footer={footer}
    >
      <div className="robotlab-layout">
        <div
          ref={containerRef}
          className={`robotlab-room${lastResult === "success" ? " robotlab-room-success" : ""}${
            lastResult === "error" ? " robotlab-room-error" : ""
          }`}
          style={{ "--game-accent": accent } as CSSProperties}
        >
          <div className="robotlab-room-space" aria-hidden="true">
            <span className="robotlab-space-stars" />
            <span className="robotlab-space-planet robotlab-space-planet-far" />
            <span className="robotlab-space-planet robotlab-space-planet-mid" />
            <span className="robotlab-space-planet robotlab-space-planet-near" />
          </div>
          <div className="robotlab-room-grid" aria-hidden="true" />

          {mission.id === "binary-gate" && mission.targetPattern && currentPattern && (
            <div className="robotlab-gate-strip" aria-hidden="true">
              <div className="robotlab-gate-strip-row">
                <span className="robotlab-gate-strip-label">Target</span>
                {mission.targetPattern.map((bit, index) => (
                  <span
                    key={`door-target-${index}`}
                    className={`robotlab-gate-bulb${bit ? " robotlab-gate-bulb-on" : ""}`}
                  />
                ))}
              </div>
              <div className="robotlab-gate-strip-row robotlab-gate-strip-row-live">
                <span className="robotlab-gate-strip-label">Live</span>
                {currentPattern.map((bit, index) => (
                  <span
                    key={`door-live-${index}`}
                    className={`robotlab-gate-bulb${bit ? " robotlab-gate-bulb-on" : ""}`}
                  />
                ))}
              </div>
            </div>
          )}

          {runtime.objects.map((object) => (
            <div
              key={object.id}
              className={`robotlab-object robotlab-object-${object.kind}${
                object.on ? " robotlab-object-on" : ""
              }${object.open ? " robotlab-object-open" : ""}${
                object.placedOn === "red-pad" ? " robotlab-object-correct" : ""
              }${object.id === runtime.carryingId ? " robotlab-object-carrying" : ""}`}
              style={getObjectPositionStyle(object, mission, runtime)}
            >
              {object.kind === "lamp" && (
                <>
                  <img className="robotlab-planet-art robotlab-planet-art-lamp" src={getObjectPlanet(object)} alt="" aria-hidden="true" />
                  <span className="robotlab-object-label">{object.label}</span>
                </>
              )}

              {object.kind === "switch" && (
                <>
                  <img className="robotlab-planet-art robotlab-planet-art-switch" src={getObjectPlanet(object)} alt="" aria-hidden="true" />
                  <span className="robotlab-object-label">{object.label}</span>
                </>
              )}

              {object.kind === "door" && (
                <>
                  <span className="robotlab-door-shell" />
                  <span className="robotlab-door-panel" />
                  <span className="robotlab-object-label">{object.open ? "Gate Open" : "Gate Closed"}</span>
                </>
              )}

              {object.kind === "cube" && (
                <>
                  <img className="robotlab-planet-art robotlab-planet-art-cargo" src={getObjectPlanet(object)} alt="" aria-hidden="true" />
                  <span className="robotlab-object-label">Cargo</span>
                </>
              )}

              {object.kind === "pad" && (
                <>
                  <img className="robotlab-planet-art robotlab-planet-art-pad" src={getObjectPlanet(object)} alt="" aria-hidden="true" />
                  <span className="robotlab-object-label">{object.label}</span>
                </>
              )}
            </div>
          ))}

          <div
          className={`robotlab-bot${phase === "running" ? " robotlab-bot-running" : ""}`}
          style={getRobotStyle(mission, runtime.robot)}
        >
          <span className="robotlab-bot-shell">
            <FbxAssetStage
              modelPath={shipAsset}
              accent={accent}
              title="Command rocket"
              variant="board"
              zoom={1.18}
              autoRotate={false}
              float={false}
              modelRotation={[0, Math.PI / 2, 0]}
              className="robotlab-bot-stage"
            />
          </span>
        </div>
      </div>

        <div className="robotlab-command-bay">
          <div className="robotlab-status-strip">
            <div className="robotlab-status-copy">
              <span className="robotlab-kicker">{phaseMessage}</span>
              <strong className="robotlab-status-text">{statusText}</strong>
            </div>
            {statusMeta.length > 0 && (
              <div className="robotlab-status-meta">
                {statusMeta.map((item) => (
                  <span key={item} className="robotlab-status-chip">
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="robotlab-console-grid">
            <div className="robotlab-card robotlab-card-program">
              <div className="robotlab-card-head">
                <span className="robotlab-kicker">Program</span>
                <span className={`robotlab-phase robotlab-phase-${phase}`}>{phaseLabel}</span>
              </div>

              <div
                className={`robotlab-editor-shell${phase !== "editing" ? " robotlab-editor-shell-run" : ""}`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDropSnippet}
              >
                {phase === "editing" ? (
                  <textarea
                    className="robotlab-editor"
                    value={program}
                    onChange={(event) => setProgram(event.target.value)}
                    placeholder={mission.example}
                    spellCheck={false}
                  />
                ) : (
                  <div className="robotlab-runview">
                    {displayLines.map((line, index) => (
                      <div
                        key={`${mission.id}-${index}-${line}`}
                        className={`robotlab-runline${activeLine === index ? " robotlab-runline-active" : ""}`}
                      >
                        <span className="robotlab-runline-index">{index + 1}</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="robotlab-editor-actions">
                <button className="robotlab-run-btn" onClick={executeProgram} disabled={phase !== "editing"} type="button">
                  Run
                </button>
                <button className="robotlab-secondary-btn" onClick={handleResetRoom} disabled={phase === "running"} type="button">
                  Reset
                </button>
                <button className="robotlab-secondary-btn" onClick={handleClearProgram} disabled={phase !== "editing"} type="button">
                  Clear
                </button>
              </div>
            </div>

            <div className="robotlab-console-side">
              <div className="robotlab-card">
                <div className="robotlab-card-head">
                  <span className="robotlab-kicker">Command bank</span>
                  <span className="robotlab-chip-hint">Click or drag into the program</span>
                </div>
                <div className="robotlab-chip-bank">
                  {mission.commandChips.map((snippet) => (
                    <button
                      key={`${mission.id}-${snippet}`}
                      className="robotlab-chip"
                      type="button"
                      disabled={phase !== "editing"}
                      draggable={phase === "editing"}
                      onClick={() => appendSnippet(snippet)}
                      onDragStart={(event) => {
                        dragSnippetRef.current = snippet;
                        event.dataTransfer.setData("text/plain", snippet);
                      }}
                    >
                      {formatChipLabel(snippet)}
                    </button>
                  ))}
                </div>
              </div>

              {mission.targetPattern && currentPattern && (
                <div className="robotlab-card robotlab-card-pattern">
                  <div className="robotlab-card-head">
                    <span className="robotlab-kicker">Gate lights</span>
                    <span className={`robotlab-result-pill${lastResult ? ` robotlab-result-pill-${lastResult}` : ""}`}>
                      {matchesPattern(currentPattern, mission.targetPattern) ? "Matched" : "Live"}
                    </span>
                  </div>
                  <div className="robotlab-pattern-card">
                    <div className="robotlab-pattern-row">
                      <span>Target</span>
                      <div className="robotlab-pattern-lights">
                        {mission.targetPattern.map((bit, index) => (
                          <span
                            key={`target-${mission.id}-${index}`}
                            className={`robotlab-pattern-light${bit ? " robotlab-pattern-light-on" : ""}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="robotlab-pattern-row">
                      <span>Live</span>
                      <div className="robotlab-pattern-lights">
                        {currentPattern.map((bit, index) => (
                          <span
                            key={`current-${mission.id}-${index}`}
                            className={`robotlab-pattern-light${bit ? " robotlab-pattern-light-on" : ""}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </GameScene>
  );
}

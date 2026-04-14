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

type Verdict = "code" | "not-code";

interface Suspect {
  id: string;
  label: string;
  icon: string;
  answer: Verdict;
  scanText: string;
  explanation: string;
  color: string;
  position: { x: number; y: number };
}

interface Mission {
  id: string;
  title: string;
  objective: string;
  introLine: string;
  successLine: string;
  objects: Suspect[];
}

const MISSIONS: Mission[] = [
  {
    id: "transit-bay",
    title: "Transit Bay Sweep",
    objective: "Scan the transport bay and tag which objects actually depend on software.",
    introLine: "Start the sweep. Scan each suspect, read the signal, then stamp the right verdict.",
    successLine: "Transit Bay mapped. You marked every coded system and cleared the rest.",
    objects: [
      {
        id: "traffic-light",
        label: "Traffic Light",
        icon: "🚦",
        answer: "code",
        scanText: "Timed logic and sensor control found.",
        explanation: "Traffic lights use embedded software to decide when signals change.",
        color: "#34d399",
        position: { x: 22, y: 30 },
      },
      {
        id: "calculator-app",
        label: "Calculator App",
        icon: "🔢",
        answer: "code",
        scanText: "Tap handlers and math routines detected.",
        explanation: "A calculator app is software. Code handles every tap and calculation.",
        color: "#38bdf8",
        position: { x: 78, y: 28 },
      },
      {
        id: "wooden-chair",
        label: "Wooden Chair",
        icon: "🪑",
        answer: "not-code",
        scanText: "No control signal. Only physical structure.",
        explanation: "A chair is just materials and shape. No program runs inside it.",
        color: "#f59e0b",
        position: { x: 26, y: 74 },
      },
      {
        id: "toolbox",
        label: "Toolbox",
        icon: "🧰",
        answer: "not-code",
        scanText: "No processor response. Pure storage.",
        explanation: "A toolbox holds tools, but the box itself does not need software.",
        color: "#f97316",
        position: { x: 74, y: 72 },
      },
    ],
  },
  {
    id: "home-hub",
    title: "Home Hub Sweep",
    objective: "Separate smart devices from plain physical objects in the home systems wing.",
    introLine: "Home hub is messy. Scan for devices that sense or respond using code.",
    successLine: "Home Hub restored. The coded devices are flagged and the plain objects are cleared.",
    objects: [
      {
        id: "thermostat",
        label: "Smart Thermostat",
        icon: "🌡️",
        answer: "code",
        scanText: "Sensors and decision rules are active.",
        explanation: "A thermostat uses software to read temperature and control the heating system.",
        color: "#22c55e",
        position: { x: 24, y: 32 },
      },
      {
        id: "game-console",
        label: "Game Console",
        icon: "🎮",
        answer: "code",
        scanText: "Menus, graphics, and game logic detected.",
        explanation: "A console runs programs, games, and system software.",
        color: "#a78bfa",
        position: { x: 78, y: 28 },
      },
      {
        id: "book",
        label: "Printed Book",
        icon: "📖",
        answer: "not-code",
        scanText: "Paper layers only. No software path found.",
        explanation: "A physical book is ink and paper. The book itself is not running code.",
        color: "#f59e0b",
        position: { x: 30, y: 74 },
      },
      {
        id: "skateboard",
        label: "Skateboard",
        icon: "🛹",
        answer: "not-code",
        scanText: "Mechanical parts only. No logic system found.",
        explanation: "A normal skateboard works with wheels and balance, not software.",
        color: "#fb7185",
        position: { x: 72, y: 72 },
      },
    ],
  },
  {
    id: "service-deck",
    title: "Service Deck Sweep",
    objective: "Finish the investigation by tagging the city systems that really run on code.",
    introLine: "Final sweep. Watch for systems that sense, decide, or react because of software.",
    successLine: "Service Deck solved. The detective visor now knows exactly where code lives.",
    objects: [
      {
        id: "elevator-panel",
        label: "Elevator Panel",
        icon: "🛗",
        answer: "code",
        scanText: "Button logic and route control online.",
        explanation: "Elevator controls use software to handle buttons, doors, and floor movement.",
        color: "#2dd4bf",
        position: { x: 22, y: 30 },
      },
      {
        id: "delivery-drone",
        label: "Delivery Drone",
        icon: "🚁",
        answer: "code",
        scanText: "Navigation and balancing code active.",
        explanation: "A drone needs software to stabilize, navigate, and react in flight.",
        color: "#60a5fa",
        position: { x: 77, y: 28 },
      },
      {
        id: "pencil",
        label: "Pencil",
        icon: "✏️",
        answer: "not-code",
        scanText: "Wood and graphite only. No software trace.",
        explanation: "A pencil is just a tool made of simple materials, not code.",
        color: "#f59e0b",
        position: { x: 28, y: 74 },
      },
      {
        id: "plant-pot",
        label: "Plant Pot",
        icon: "🪴",
        answer: "not-code",
        scanText: "Ceramic shell only. No control system.",
        explanation: "A plant pot does not sense or compute anything on its own.",
        color: "#84cc16",
        position: { x: 72, y: 72 },
      },
    ],
  },
];

const TOTAL_OBJECTS = MISSIONS.reduce((total, mission) => total + mission.objects.length, 0);

function includesId(ids: string[], id: string) {
  return ids.includes(id);
}

export default function CodeEverywhereQuiz({ onComplete, accent }: Props) {
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
  const { stability, combo, recordCorrect, recordWrong } = useGameMeta(TOTAL_OBJECTS);
  const comboRef = useRef(combo);
  const scanTimerRef = useRef<number | null>(null);
  const wrongTimerRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);

  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<"investigating" | "transition" | "complete">(
    "investigating"
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [scanTargetId, setScanTargetId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [resolvedTags, setResolvedTags] = useState<Record<string, Verdict>>({});
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState(MISSIONS[0].introLine);

  const mission = MISSIONS[round];
  const activeSuspect = mission.objects.find((suspect) => suspect.id === activeId) ?? null;
  const beamTarget =
    mission.objects.find((suspect) => suspect.id === (scanTargetId ?? activeId)) ?? null;
  const resolvedCount = Object.keys(resolvedTags).length;
  const codeFoundCount = Object.values(resolvedTags).filter(
    (verdict) => verdict === "code"
  ).length;
  const canTag =
    phase === "investigating" &&
    !scanTargetId &&
    !!activeSuspect &&
    includesId(revealedIds, activeSuspect.id) &&
    !resolvedTags[activeSuspect.id];

  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  useEffect(() => {
    const player = userName || "Engineer";
    byteSay(`${player}, sweep the bay and stamp what really runs on code.`, 3000);
    echoSay("Scan first. Then decide whether software is actually inside.", 2400);
  }, [byteSay, echoSay, round, userName]);

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) window.clearTimeout(scanTimerRef.current);
      if (wrongTimerRef.current) window.clearTimeout(wrongTimerRef.current);
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    };
  }, []);

  function burstAtSuspect(suspect: Suspect, color: string) {
    const container = containerRef.current;
    if (!container) return;

    burst({
      x: container.clientWidth * (suspect.position.x / 100),
      y: container.clientHeight * (suspect.position.y / 100),
      color,
      count: 18,
      spread: 88,
      size: 7,
    });
  }

  function beginScan(suspectId: string) {
    if (phase !== "investigating" || scanTargetId) return;

    const suspect = mission.objects.find((entry) => entry.id === suspectId);
    if (!suspect) return;

    if (resolvedTags[suspectId]) {
      setStatusText(`${suspect.label} is already logged in the evidence map.`);
      return;
    }

    if (scanTimerRef.current) window.clearTimeout(scanTimerRef.current);

    setActiveId(suspectId);
    setScanTargetId(suspectId);
    setWrongId(null);
    setStatusText(`Sweeping ${suspect.label} for hidden control signals...`);
    playTap();
    playPulse();

    scanTimerRef.current = window.setTimeout(() => {
      setScanTargetId(null);
      setRevealedIds((previous) =>
        previous.includes(suspectId) ? previous : [...previous, suspectId]
      );

      if (suspect.answer === "code") {
        setStatusText(`${suspect.label} is broadcasting a live software signal.`);
        byteSay("Signal spike. This one definitely reacts using code.", 2200);
        echoSay("Code often lives in systems that sense, decide, or control something.", 2400);
      } else {
        setStatusText(`${suspect.label} shows physical structure, but no software signal.`);
        byteSay("Clear shell. I don't see code inside that one.", 2200);
        echoSay("Some objects are purely physical and do not run software.", 2200);
      }
    }, 820);
  }

  function advanceMission() {
    if (round === MISSIONS.length - 1) {
      setPhase("complete");
      setStatusText(
        "Case files complete. The detective visor has mapped exactly where code lives in The Core."
      );
      byteCelebrate("Case closed. Every coded system is marked.");
      echoSay("Code is everywhere around us, but not inside every object.", 2600);
      return;
    }

    const nextRound = round + 1;
    const nextMission = MISSIONS[nextRound];
    setRound(nextRound);
    setPhase("investigating");
    setActiveId(null);
    setScanTargetId(null);
    setRevealedIds([]);
    setResolvedTags({});
    setWrongId(null);
    setStatusText(nextMission.introLine);
  }

  function stampVerdict(verdict: Verdict) {
    if (phase !== "investigating" || scanTargetId) return;

    if (!activeSuspect) {
      setStatusText("Pick a suspect in the bay and scan it first.");
      byteAlert("No suspect selected yet. Point the visor at something first.");
      return;
    }

    if (!includesId(revealedIds, activeSuspect.id)) {
      setStatusText("Scan the suspect before placing a verdict stamp.");
      byteAlert("We need a scan result before we can stamp the evidence.");
      return;
    }

    if (resolvedTags[activeSuspect.id]) {
      setStatusText(`${activeSuspect.label} is already marked.`);
      return;
    }

    const correct = verdict === activeSuspect.answer;
    if (!correct) {
      if (wrongTimerRef.current) window.clearTimeout(wrongTimerRef.current);

      setWrongId(activeSuspect.id);
      setStatusText(`Mismatch. ${activeSuspect.label} does not match that stamp.`);
      recordWrong();
      playWrong();
      byteAlert("That tag doesn't match the scan data.");
      echoSay("Check the scan result first, then choose the verdict.", 2200);

      wrongTimerRef.current = window.setTimeout(() => {
        setWrongId(null);
      }, 720);
      return;
    }

    const nextResolvedTags = { ...resolvedTags, [activeSuspect.id]: verdict };
    const nextResolvedCount = Object.keys(nextResolvedTags).length;
    const foundCode = verdict === "code";

    setResolvedTags(nextResolvedTags);
    setActiveId(null);
    setWrongId(null);
    setStatusText(
      foundCode
        ? `${activeSuspect.label} tagged as code. ${activeSuspect.explanation}`
        : `${activeSuspect.label} cleared. ${activeSuspect.explanation}`
    );
    recordCorrect();
    playCorrect();
    if (comboRef.current + 1 > 1) playCombo(comboRef.current + 1);

    if (foundCode) {
      byteCelebrate("Signal confirmed. Mark it and move to the next suspect.");
      echoSay("Software shows up when a device senses, computes, or controls.", 2400);
      burstAtSuspect(activeSuspect, activeSuspect.color);
    } else {
      byteCelebrate("Clean sweep. No software in that object.");
      echoSay("Not every object needs code. Some are just physical tools.", 2200);
      burstAtSuspect(activeSuspect, "#22c55e");
    }

    if (nextResolvedCount === mission.objects.length) {
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);

      setPhase("transition");
      setStatusText(mission.successLine);
      playComplete();
      byteCelebrate("Bay solved. Every suspect is accounted for.");
      echoSay("You learned where code lives by testing every object one at a time.", 2600);

      transitionTimerRef.current = window.setTimeout(() => {
        advanceMission();
      }, 1550);
    }
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
      header={{ room: "Code Detective Bay", step: `Case ${round + 1} of ${MISSIONS.length}` }}
      missionTitle="Code Detective"
      missionObjective={mission.objective}
      subtitle="Sweep the room, reveal what is inside each object, then stamp the evidence board."
      hint="Scan first, then tag. Live control signals mean code. Pure materials mean no code."
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
        <div className="detective-panel">
          <div className="detective-card detective-mission-card">
            <span className="detective-kicker">Case File</span>
            <strong>{mission.title}</strong>
            <p>{mission.objective}</p>
            <div className="detective-progress-row">
              <div className="detective-progress-bar" aria-hidden="true">
                <span
                  style={{
                    width: `${(resolvedCount / mission.objects.length) * 100}%`,
                    background: accent,
                  }}
                />
              </div>
              <span>{resolvedCount}/{mission.objects.length} suspects logged</span>
            </div>
          </div>

          <div className="detective-card detective-scanner-card">
            <span className="detective-kicker">Scanner Feed</span>
            {activeSuspect ? (
              <>
                <strong>{activeSuspect.label}</strong>
                <p>
                  {scanTargetId === activeSuspect.id
                    ? "Visor sweep in progress. Reading the internal signal now."
                    : resolvedTags[activeSuspect.id]
                    ? activeSuspect.explanation
                    : includesId(revealedIds, activeSuspect.id)
                    ? activeSuspect.scanText
                    : "Ready to scan. Click the suspect in the bay to sweep it."}
                </p>
                <span
                  className={`detective-feed-badge${
                    includesId(revealedIds, activeSuspect.id)
                      ? activeSuspect.answer === "code"
                        ? " detective-feed-badge-code"
                        : " detective-feed-badge-clear"
                      : ""
                  }`}
                >
                  {scanTargetId === activeSuspect.id
                    ? "Scanning"
                    : includesId(revealedIds, activeSuspect.id)
                    ? activeSuspect.answer === "code"
                      ? "Code Signal Found"
                      : "No Code Signal"
                    : "Awaiting Scan"}
                </span>
              </>
            ) : (
              <>
                <strong>No suspect selected</strong>
                <p>
                  Click a glowing object in the bay to send the visor through it and reveal the
                  hidden signal.
                </p>
                <span className="detective-feed-badge">Scanner Idle</span>
              </>
            )}
          </div>

          <div className="detective-card detective-tools-card">
            <span className="detective-kicker">Evidence Stamps</span>
            <div className="detective-tools-grid">
              <button
                className="detective-stamp detective-stamp-code"
                type="button"
                onClick={() => stampVerdict("code")}
                disabled={!canTag}
              >
                <strong>Stamp Code</strong>
                <small>Use when the scan reveals control signals, logic, or software reactions.</small>
              </button>
              <button
                className="detective-stamp detective-stamp-clear"
                type="button"
                onClick={() => stampVerdict("not-code")}
                disabled={!canTag}
              >
                <strong>Stamp No Code</strong>
                <small>Use when the scan shows only physical materials and no software signal.</small>
              </button>
            </div>
          </div>

          <div className="detective-card detective-evidence-card">
            <div className="detective-evidence-header">
              <span className="detective-kicker">Evidence Board</span>
              <span>{codeFoundCount} code systems found</span>
            </div>
            <div className="detective-evidence-list">
              {mission.objects.map((suspect) => {
                const verdict = resolvedTags[suspect.id];
                const revealed = includesId(revealedIds, suspect.id);

                return (
                  <div
                    key={suspect.id}
                    className={`detective-evidence-item${
                      verdict ? " detective-evidence-item-resolved" : ""
                    }`}
                  >
                    <span className="detective-evidence-icon">{suspect.icon}</span>
                    <span className="detective-evidence-copy">
                      <strong>{suspect.label}</strong>
                      <small>
                        {verdict
                          ? verdict === "code"
                            ? "Software traced"
                            : "Cleared as physical"
                          : revealed
                          ? "Scan complete"
                          : "Waiting for sweep"}
                      </small>
                    </span>
                    <span
                      className={`detective-evidence-state${
                        verdict === "code"
                          ? " detective-evidence-state-code"
                          : verdict === "not-code"
                          ? " detective-evidence-state-clear"
                          : revealed
                          ? " detective-evidence-state-scanned"
                          : ""
                      }`}
                    >
                      {verdict ? (verdict === "code" ? "Code" : "Clear") : revealed ? "Scanned" : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      }
      footer={footer}
    >
      <div ref={containerRef} className="detective-room">
        <div className="detective-room-grid" aria-hidden="true" />
        <div className="detective-room-badge">
          <span>Visor Sweep</span>
          <strong>{mission.title}</strong>
        </div>

        <svg className="detective-room-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {mission.objects
            .filter((suspect) => resolvedTags[suspect.id] === "code")
            .map((suspect) => (
              <line
                key={`resolved-${suspect.id}`}
                className="detective-room-beam detective-room-beam-resolved"
                style={{ stroke: suspect.color }}
                x1="50"
                y1="50"
                x2={suspect.position.x}
                y2={suspect.position.y}
              />
            ))}

          {beamTarget && (
            <>
              <line
                className={`detective-room-beam${scanTargetId ? " detective-room-beam-live" : ""}`}
                style={{ stroke: beamTarget.color }}
                x1="50"
                y1="50"
                x2={beamTarget.position.x}
                y2={beamTarget.position.y}
              />
              <circle
                className="detective-room-beam-node"
                style={{ fill: beamTarget.color }}
                cx={beamTarget.position.x}
                cy={beamTarget.position.y}
                r="1.7"
              />
            </>
          )}
        </svg>

        <div className="detective-scanner-hub" aria-hidden="true">
          <div className={`detective-scanner-core${scanTargetId ? " detective-scanner-core-live" : ""}`} />
          <div className="detective-scanner-ring detective-scanner-ring-one" />
          <div className="detective-scanner-ring detective-scanner-ring-two" />
          <span className="detective-scanner-label">Visor Hub</span>
        </div>

        {mission.objects.map((suspect) => {
          const resolvedVerdict = resolvedTags[suspect.id];
          const revealed = includesId(revealedIds, suspect.id) || Boolean(resolvedVerdict);
          const scanning = scanTargetId === suspect.id;
          const active = activeId === suspect.id;
          const codeResolved = resolvedVerdict === "code";
          const clearResolved = resolvedVerdict === "not-code";

          return (
            <button
              key={suspect.id}
              className={`detective-object${active ? " detective-object-active" : ""}${
                scanning ? " detective-object-scanning" : ""
              }${revealed ? " detective-object-revealed" : ""}${
                codeResolved ? " detective-object-code" : ""
              }${clearResolved ? " detective-object-clear" : ""}${
                wrongId === suspect.id ? " detective-object-wrong" : ""
              }`}
              onClick={() => beginScan(suspect.id)}
              type="button"
              disabled={phase !== "investigating" || Boolean(scanTargetId) || Boolean(resolvedVerdict)}
              aria-pressed={active}
              aria-label={`Scan ${suspect.label}`}
              style={
                {
                  left: `${suspect.position.x}%`,
                  top: `${suspect.position.y}%`,
                  "--detective-tone": suspect.color,
                } as CSSProperties
              }
            >
              <span className="detective-object-platform" aria-hidden="true" />
              <span className="detective-object-halo" aria-hidden="true" />
              <span className="detective-object-status">
                {resolvedVerdict ? (codeResolved ? "Tagged" : "Cleared") : revealed ? "Scanned" : "Scan"}
              </span>
              <span className="detective-object-core" aria-hidden="true">
                {suspect.icon}
              </span>
              <span className="detective-object-name">{suspect.label}</span>

              {scanning && (
                <span className="scanner-overlay">
                  <span className="scanner-line" />
                </span>
              )}

              {revealed && (
                <span className="detective-object-reveal">
                  <span
                    className={`detective-object-signal${
                      suspect.answer === "code"
                        ? " detective-object-signal-code"
                        : " detective-object-signal-clear"
                    }`}
                  >
                    {suspect.answer === "code" ? "CODE SIGNAL" : "NO SIGNAL"}
                  </span>
                  <span
                    className={`detective-object-bars${
                      suspect.answer === "code" ? "" : " detective-object-bars-clear"
                    }`}
                    aria-hidden="true"
                  >
                    <span />
                    <span />
                    <span />
                  </span>
                  <span className="detective-object-detail">{suspect.scanText}</span>
                </span>
              )}

              {resolvedVerdict && (
                <span
                  className={`detective-object-stamp${
                    codeResolved ? " detective-object-stamp-code" : " detective-object-stamp-clear"
                  }`}
                >
                  {codeResolved ? "CODE FOUND" : "CLEAR"}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </GameScene>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import GameScene from "@/components/game/GameScene";
import { useCompanion } from "@/lib/game/use-companion";
import { useDrag } from "@/lib/game/use-drag";
import { useGameMeta } from "@/lib/game/use-game-meta";
import { useParticles } from "@/lib/game/use-particles";
import { useSound } from "@/lib/game/use-sound";
import { useUser } from "@/lib/store";

interface Props {
  onComplete: () => void;
  accent: string;
}

type SlotId = "input" | "cpu" | "ram" | "storage" | "output";

interface PartSpec {
  id: SlotId;
  name: string;
  glyph: string;
  color: string;
  shortLabel: string;
  description: string;
  successLine: string;
  bootLine: string;
}

const PARTS: PartSpec[] = [
  {
    id: "input",
    name: "Input Port",
    glyph: "IN",
    color: "#38bdf8",
    shortLabel: "Signals enter here",
    description: "Lets clicks, keys, and sensors enter the machine.",
    successLine: "Input port online. That's how signals get into the system.",
    bootLine: "Input tools ready. The machine can now receive commands.",
  },
  {
    id: "cpu",
    name: "CPU Core",
    glyph: "CPU",
    color: "#f59e0b",
    shortLabel: "Runs instructions",
    description: "The main processor that does the machine's thinking.",
    successLine: "CPU core locked in. It runs the instructions step by step.",
    bootLine: "CPU online. Instructions can finally be processed.",
  },
  {
    id: "ram",
    name: "RAM Deck",
    glyph: "RAM",
    color: "#34d399",
    shortLabel: "Keeps active work ready",
    description: "Stores the data the machine is using right now.",
    successLine: "RAM deck installed. It keeps active work ready to use.",
    bootLine: "RAM humming. Live data has a fast place to stay.",
  },
  {
    id: "storage",
    name: "Storage Vault",
    glyph: "DRV",
    color: "#a78bfa",
    shortLabel: "Keeps files for later",
    description: "Saves files so they still exist after power is gone.",
    successLine: "Storage vault secured. That's where saved files live.",
    bootLine: "Storage mounted. Saved files are safe for later.",
  },
  {
    id: "output",
    name: "Output Screen",
    glyph: "OUT",
    color: "#fb7185",
    shortLabel: "Shows the result",
    description: "Displays or plays what the machine produces.",
    successLine: "Output screen snapped in. That's where results show up.",
    bootLine: "Output screen online. The machine can show the result now.",
  },
];

const SLOT_LAYOUT: { id: SlotId; title: string; hint: string }[] = [
  { id: "input", title: "Input Bay", hint: "Commands and signals enter here" },
  { id: "cpu", title: "CPU Socket", hint: "Machine brain" },
  { id: "ram", title: "RAM Rail", hint: "Fast active memory" },
  { id: "storage", title: "Storage Dock", hint: "Saved files vault" },
  { id: "output", title: "Output Screen", hint: "Where results appear" },
];

const BURST_POSITIONS: Record<SlotId, { x: number; y: number }> = {
  input: { x: 0.17, y: 0.34 },
  cpu: { x: 0.5, y: 0.28 },
  ram: { x: 0.76, y: 0.22 },
  storage: { x: 0.76, y: 0.7 },
  output: { x: 0.18, y: 0.72 },
};

export default function ComponentMatchGame({ onComplete, accent }: Props) {
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
  const { playCorrect, playWrong, playCombo, playDrop, playComplete, playPulse } = useSound();
  const { containerRef, burst } = useParticles();
  const { stability, combo, recordCorrect, recordWrong } = useGameMeta(PARTS.length);

  const [placedParts, setPlacedParts] = useState<Partial<Record<SlotId, PartSpec>>>({});
  const [statusText, setStatusText] = useState(
    "Drag each missing part into the right slot to rebuild the workstation."
  );
  const [wrongZone, setWrongZone] = useState<SlotId | null>(null);
  const [bootStep, setBootStep] = useState(0);
  const [phase, setPhase] = useState<"building" | "booting" | "complete">("building");

  const remainingParts = useMemo(
    () => PARTS.filter((part) => !placedParts[part.id]),
    [placedParts]
  );

  useEffect(() => {
    const player = userName || "Engineer";
    byteSay(`${player}, rebuild this workstation and we'll bring the bay back online.`, 2800);
    echoSay("Each computer part has a different job in the system.", 2600);
  }, [byteSay, echoSay, userName]);

  useEffect(() => {
    if (phase !== "booting") return;

    const timers = PARTS.map((part, index) =>
      window.setTimeout(() => {
        setBootStep(index + 1);
        setStatusText(part.bootLine);
        echoSay(part.bootLine, 1800);
        playPulse();
      }, 320 + index * 420)
    );

    const finishTimer = window.setTimeout(() => {
      const player = userName || "Engineer";
      setPhase("complete");
      setStatusText("Boot successful. The workstation is alive and every part is doing its job.");
      byteCelebrate(`${player}, the whole system is online!`);
      echoSay("A computer works because all its parts do different jobs together.", 2800);
      playComplete();

      const container = containerRef.current;
      if (container) {
        burst({
          x: container.clientWidth / 2,
          y: container.clientHeight / 2,
          count: 22,
          spread: 120,
          color: accent,
          size: 8,
        });
      }
    }, 320 + PARTS.length * 420 + 240);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(finishTimer);
    };
  }, [accent, burst, byteCelebrate, containerRef, echoSay, phase, playComplete, playPulse, userName]);

  function placePart(part: PartSpec, destination: SlotId) {
    if (phase !== "building") return;
    if (placedParts[part.id]) return;

    if (destination !== part.id) {
      setWrongZone(destination);
      setStatusText(`Not that slot. ${part.name} doesn't belong there.`);
      recordWrong();
      playWrong();
      byteAlert("Spark pop. That slot needs a different part.");
      echoSay(part.description, 2000);
      window.setTimeout(() => setWrongZone(null), 320);
      return;
    }

    setPlacedParts((prev) => ({ ...prev, [part.id]: part }));
    setStatusText(part.successLine);
    recordCorrect();
    playDrop();
    playCorrect();
    if (combo + 1 > 1) playCombo(combo + 1);
    byteCelebrate(`${part.name} installed.`);
    echoSay(part.successLine, 2200);

    const container = containerRef.current;
    const position = BURST_POSITIONS[part.id];
    if (container) {
      burst({
        x: container.clientWidth * position.x,
        y: container.clientHeight * position.y,
        color: part.color,
        count: 12,
        spread: 54,
      });
    }
  }

  function handleBootTest() {
    if (remainingParts.length > 0 || phase !== "building") return;

    setPhase("booting");
    setBootStep(0);
    setStatusText("Power test started. Watch the workstation wake up part by part.");
    byteSay("Moment of truth. Let's see if the bay comes alive.", 2200);
    echoSay("When the parts are connected correctly, the system can boot.", 2200);
    playPulse();
  }

  const drag = useDrag({
    items: remainingParts,
    onDropInZone: (item, _itemIndex, zoneId) => {
      if (zoneId === "input" || zoneId === "cpu" || zoneId === "ram" || zoneId === "storage" || zoneId === "output") {
        placePart(item, zoneId);
      }
    },
  });

  const footer =
    phase === "complete" ? (
      <button className="game-btn" style={{ background: accent }} onClick={onComplete} type="button">
        Open Next Room
      </button>
    ) : null;

  return (
    <GameScene
      accent={accent}
      header={{ room: "Parts Bay", step: `${Object.keys(placedParts).length} of ${PARTS.length} parts installed` }}
      missionTitle="Computer Builder"
      missionObjective="Place the right hardware on the board, then run a power test."
      subtitle="Each part wakes a different system inside the machine."
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
        <div className="computer-builder-panel">
          <div className="computer-builder-panel-header">
            <span>Parts Tray</span>
            <span>{remainingParts.length > 0 ? "Drag parts into the chassis" : "Ready for power test"}</span>
          </div>

          <div className="computer-builder-tray">
            {remainingParts.map((part, index) => {
              const dragHandlers = drag.getDragHandlers(index);

              return (
                <div key={part.id} className="computer-part-card">
                  <div className="computer-part-card-drag drag-item" {...dragHandlers}>
                    <div className="computer-part-chip" style={{ "--part-color": part.color } as React.CSSProperties}>
                      {part.glyph}
                    </div>
                    <div className="computer-part-copy">
                      <strong>{part.name}</strong>
                      <span>{part.shortLabel}</span>
                    </div>
                  </div>

                  <button
                    className="computer-part-install"
                    onClick={() => placePart(part, part.id)}
                    type="button"
                    disabled={phase !== "building"}
                  >
                    Install
                  </button>
                </div>
              );
            })}

            {remainingParts.length === 0 && (
              <div className="computer-builder-ready">
                All parts are in. Run the power test and watch the system wake up.
              </div>
            )}
          </div>

          <div className="computer-builder-checklist">
            {PARTS.map((part) => {
              const online = Boolean(placedParts[part.id]);
              const activated = bootStep >= PARTS.findIndex((entry) => entry.id === part.id) + 1;

              return (
                <div key={part.id} className={`computer-builder-check${online ? " computer-builder-check-on" : ""}`}>
                  <span className="computer-builder-check-name">{part.name}</span>
                  <span className="computer-builder-check-state">
                    {activated ? "Active" : online ? "Installed" : "Missing"}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            className={`game-btn computer-builder-boot-btn${
              remainingParts.length === 0 ? " computer-builder-boot-btn-ready" : ""
            }`}
            style={{ background: remainingParts.length === 0 ? accent : undefined }}
            onClick={handleBootTest}
            type="button"
            disabled={remainingParts.length > 0 || phase !== "building"}
          >
            Power Test
          </button>
        </div>
      }
      footer={footer}
    >
      <div ref={containerRef} className={`computer-builder-stage${phase === "complete" ? " computer-builder-stage-live" : ""}`}>
        <div className={`motherboard-shell${phase !== "building" ? " motherboard-shell-booting" : ""}`}>
          <div className="motherboard-grid" aria-hidden="true" />

          <div className={`motherboard-trace trace-input${placedParts.input ? " motherboard-trace-on" : ""}`} />
          <div className={`motherboard-trace trace-cpu-ram${placedParts.ram ? " motherboard-trace-on" : ""}`} />
          <div className={`motherboard-trace trace-cpu-storage${placedParts.storage ? " motherboard-trace-on" : ""}`} />
          <div className={`motherboard-trace trace-output${placedParts.output ? " motherboard-trace-on" : ""}`} />

          {SLOT_LAYOUT.map((slot) => {
            const part = placedParts[slot.id];
            const isWrong = wrongZone === slot.id;
            const isActive =
              part &&
              (phase === "complete" ||
                bootStep >= PARTS.findIndex((entry) => entry.id === slot.id) + 1);

            return (
              <div
                key={slot.id}
                ref={drag.registerDropZone(slot.id)}
                className={`drop-zone motherboard-slot motherboard-slot-${slot.id}${
                  part ? " motherboard-slot-filled" : ""
                }${isWrong ? " game-shake" : ""}${isActive ? " motherboard-slot-active" : ""}`}
                style={part ? ({ "--part-color": part.color } as React.CSSProperties) : undefined}
              >
                {!part ? (
                  <>
                    <span className="motherboard-slot-title">{slot.title}</span>
                    <span className="motherboard-slot-hint">{slot.hint}</span>
                  </>
                ) : (
                  <div className="motherboard-installed-part">
                    <div className="computer-part-chip motherboard-installed-chip">{part.glyph}</div>
                    <div className="motherboard-installed-copy">
                      <strong>{part.name}</strong>
                      <span>{isActive ? "Online" : "Locked in"}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className={`motherboard-monitor${placedParts.output ? " motherboard-monitor-mounted" : ""}`}>
            <div className={`motherboard-monitor-screen${bootStep >= 5 ? " motherboard-monitor-screen-on" : ""}`}>
              {bootStep >= 5 ? "SYSTEM READY" : "OFFLINE"}
            </div>
          </div>

          <div className={`motherboard-fan${bootStep >= 2 ? " motherboard-fan-spin" : ""}`} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </GameScene>
  );
}

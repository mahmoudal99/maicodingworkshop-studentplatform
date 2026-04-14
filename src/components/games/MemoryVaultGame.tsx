"use client";

import { useEffect, useState } from "react";
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

type MemoryHome = "ram" | "storage";

interface MemoryItem {
  id: string;
  icon: string;
  label: string;
  home: MemoryHome;
  reason: string;
}

const MEMORY_ITEMS: MemoryItem[] = [
  {
    id: "level-state",
    icon: "🎮",
    label: "The level you're playing right now",
    home: "ram",
    reason: "RAM keeps active work ready while the machine is using it.",
  },
  {
    id: "photo-library",
    icon: "📸",
    label: "A photo saved for later",
    home: "storage",
    reason: "Storage keeps saved files even after the machine powers off.",
  },
  {
    id: "music-stream",
    icon: "🎵",
    label: "A song currently playing",
    home: "ram",
    reason: "Playing now means the machine needs it in fast working memory.",
  },
  {
    id: "homework-file",
    icon: "📝",
    label: "Homework saved yesterday",
    home: "storage",
    reason: "Saved work belongs in storage until you open it again.",
  },
  {
    id: "map-cache",
    icon: "🧭",
    label: "The map open on screen right now",
    home: "ram",
    reason: "Open right now means the machine keeps it in RAM for quick access.",
  },
  {
    id: "video-archive",
    icon: "🎞️",
    label: "A video kept on the device",
    home: "storage",
    reason: "Kept for later means it stays in storage.",
  },
];

export default function MemoryVaultGame({ onComplete, accent }: Props) {
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
  const { playCorrect, playWrong, playCombo, playDrop, playPulse } = useSound();
  const { containerRef, burst } = useParticles();
  const { stability, combo, recordCorrect, recordWrong } = useGameMeta(MEMORY_ITEMS.length);

  const [queue, setQueue] = useState(MEMORY_ITEMS);
  const [ramItems, setRamItems] = useState<MemoryItem[]>([]);
  const [storageItems, setStorageItems] = useState<MemoryItem[]>([]);
  const [statusText, setStatusText] = useState(
    "Sort each file into Active Memory or Storage Vault before the machine powers down."
  );
  const [wrongZone, setWrongZone] = useState<MemoryHome | null>(null);
  const [phase, setPhase] = useState<"sorting" | "shutdown" | "reveal">("sorting");
  const powerOff = phase !== "sorting";

  useEffect(() => {
    const player = userName || "Engineer";
    byteSay(`${player}, sort the files before the Glitches cut the power.`, 2600);
    echoSay("RAM is for now. Storage is for later.", 2600);
  }, [byteSay, echoSay, userName]);

  useEffect(() => {
    if (phase !== "shutdown") return;

    const container = containerRef.current;
    const timers = [
      window.setTimeout(() => {
        playPulse();
        setStatusText("Power is off. RAM emptied, but the storage vault kept every saved file.");
        if (container) {
          burst({
            x: container.clientWidth * 0.73,
            y: 150,
            color: accent,
            count: 14,
            spread: 70,
          });
        }
      }, 900),
      window.setTimeout(() => {
        setPhase("reveal");
        byteCelebrate("The saved files survived the shutdown!");
        echoSay("Storage keeps data even after power is gone.", 2800);
      }, 1500),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [accent, burst, byteAlert, byteCelebrate, containerRef, echoSay, phase, playPulse]);

  function handlePowerLever() {
    if (queue.length > 0 || phase !== "sorting") return;

    setPhase("shutdown");
    setStatusText("Powering down. Watch what the machine can keep and what it loses.");
    byteAlert("Power dropping in three... two... one...");
    echoSay("RAM clears when the machine turns off.", 2400);
    playPulse();
  }

  function sortItem(item: MemoryItem, destination: MemoryHome) {
    if (phase !== "sorting") return;

    if (item.home !== destination) {
      setWrongZone(destination);
      setStatusText(`Not that one. ${item.reason}`);
      recordWrong();
      playWrong();
      byteAlert("Close, but that file lives in the other system.");
      echoSay("Active items go to RAM. Saved items go to storage.", 2200);
      window.setTimeout(() => setWrongZone(null), 360);
      return;
    }

    setQueue((prev) => prev.filter((entry) => entry.id !== item.id));
    if (destination === "ram") {
      setRamItems((prev) => [...prev, item]);
    } else {
      setStorageItems((prev) => [...prev, item]);
    }

    recordCorrect();
    playDrop();
    playCorrect();
    if (combo + 1 > 1) playCombo(combo + 1);
    setStatusText(item.reason);
    echoSay(item.reason, 2400);

    if (destination === "ram") {
      byteCelebrate("Fast lane. That file is needed right now.");
    } else {
      byteCelebrate("Vault locked. That one is safe for later.");
    }

    const container = containerRef.current;
    if (container) {
      burst({
        x: destination === "ram" ? container.clientWidth * 0.27 : container.clientWidth * 0.73,
        y: 160,
        color: accent,
        count: 10,
        spread: 50,
      });
    }
  }

  const drag = useDrag({
    items: queue,
    onDropInZone: (item, _itemIndex, zoneId) => {
      if (zoneId === "ram" || zoneId === "storage") {
        sortItem(item, zoneId);
      }
    },
  });

  const footer =
    phase === "reveal" ? (
      <button className="game-btn" style={{ background: accent }} onClick={onComplete} type="button">
        Open Next Room
      </button>
    ) : null;

  return (
    <GameScene
      accent={accent}
      header={{ room: "Memory Vault", step: `${ramItems.length + storageItems.length} of ${MEMORY_ITEMS.length} files sorted` }}
      missionTitle="Memory Sorting Vault"
      missionObjective="Sort live files into active memory or storage, then cut power to see what survives."
      subtitle="Power-off is the lesson: RAM clears while storage stays."
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
        <div className="memory-queue-panel">
          <div className="memory-queue-header">
            <span>Incoming Files</span>
            <span>{queue.length === 0 ? "Ready to power down" : "Drag or quick-sort each file"}</span>
          </div>

          <div className="memory-queue-list">
            {queue.map((item, index) => {
              const dragHandlers = drag.getDragHandlers(index);

              return (
                <div key={item.id} className="memory-queue-card">
                  <div className="memory-queue-drag drag-item" {...dragHandlers}>
                    <span className="memory-queue-icon">{item.icon}</span>
                    <div className="memory-queue-copy">
                      <strong>{item.label}</strong>
                      <span>Drag me into the right system</span>
                    </div>
                  </div>

                  <div className="memory-queue-actions">
                    <button
                      className="memory-queue-action"
                      onClick={() => sortItem(item, "ram")}
                      type="button"
                      disabled={phase !== "sorting"}
                    >
                      RAM
                    </button>
                    <button
                      className="memory-queue-action"
                      onClick={() => sortItem(item, "storage")}
                      type="button"
                      disabled={phase !== "sorting"}
                    >
                      Storage
                    </button>
                  </div>
                </div>
              );
            })}

            {queue.length === 0 && (
              <div className="memory-queue-empty">
                All files are sorted. Pull the power lever to test what persists.
              </div>
            )}
          </div>

          <button
            className={`game-btn memory-power-btn${queue.length === 0 ? " memory-power-btn-ready" : ""}`}
            style={{ background: queue.length === 0 ? accent : undefined }}
            onClick={handlePowerLever}
            type="button"
            disabled={queue.length > 0 || phase !== "sorting"}
          >
            Pull Power Lever
          </button>
        </div>
      }
      footer={footer}
    >
      <div ref={containerRef} className={`memory-vault-room${powerOff ? " memory-vault-room-poweroff" : ""}`}>
        <div className={`memory-zone${wrongZone === "ram" ? " game-shake" : ""}`}>
          <div
            ref={drag.registerDropZone("ram")}
            className={`drop-zone memory-zone-shell memory-zone-shell-ram${
              powerOff ? " memory-zone-shell-off" : ""
            }`}
          >
            <div className="memory-zone-header-text">
              <strong>Active Memory</strong>
              <span>Fast. Hot. Right now.</span>
            </div>

            <div className="memory-zone-files">
              {ramItems.map((item) => (
                <div
                  key={item.id}
                  className={`memory-file memory-file-ram${
                    phase === "reveal" ? " memory-file-volatile" : ""
                  }`}
                >
                  <span>{item.icon}</span>
                  <small>{item.label}</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`memory-core${powerOff ? " memory-core-off" : ""}`}>
          <div className="memory-core-ring" />
          <div className="memory-core-label">{powerOff ? "Power Off" : "Core Power"}</div>
        </div>

        <div className={`memory-zone${wrongZone === "storage" ? " game-shake" : ""}`}>
          <div ref={drag.registerDropZone("storage")} className="drop-zone memory-zone-shell memory-zone-shell-storage">
            <div className="memory-zone-header-text">
              <strong>Storage Vault</strong>
              <span>Saved. Safe. For later.</span>
            </div>

            <div className="memory-zone-files">
              {storageItems.map((item) => (
                <div key={item.id} className="memory-file memory-file-storage">
                  <span>{item.icon}</span>
                  <small>{item.label}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GameScene>
  );
}

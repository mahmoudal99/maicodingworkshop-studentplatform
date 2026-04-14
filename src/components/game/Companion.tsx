"use client";

import type { CompanionMood } from "@/lib/game/use-companion";

interface CompanionProps {
  character: "byte" | "echo";
  dialogue: string | null;
  mood: CompanionMood;
  accent: string;
  position?: "top-right" | "bottom-left" | "inline";
}

/* ── Byte: playful hovering drone ── */
function ByteAvatar({ mood, accent }: { mood: CompanionMood; accent: string }) {
  const eyeColor =
    mood === "happy" ? accent : mood === "alert" ? "#f87171" : mood === "thinking" ? "#facc15" : "#94a3b8";
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      className={`companion-avatar companion-avatar-byte companion-mood-${mood}`}
    >
      {/* Body */}
      <rect x="8" y="14" width="28" height="20" rx="6" fill="#1e293b" stroke={accent} strokeWidth="1.5" />
      {/* Antenna */}
      <line x1="22" y1="14" x2="22" y2="6" stroke="#475569" strokeWidth="1.5" />
      <circle cx="22" cy="5" r="2.5" fill={eyeColor} className="companion-antenna-light" />
      {/* Eyes */}
      <circle cx="16" cy="23" r="3" fill={eyeColor} className="companion-eye" />
      <circle cx="28" cy="23" r="3" fill={eyeColor} className="companion-eye" />
      {/* Mouth (changes with mood) */}
      {mood === "happy" ? (
        <path d="M16 29 Q22 33 28 29" stroke={eyeColor} strokeWidth="1.5" fill="none" />
      ) : mood === "alert" ? (
        <circle cx="22" cy="30" r="2" fill={eyeColor} />
      ) : (
        <line x1="17" y1="30" x2="27" y2="30" stroke="#475569" strokeWidth="1.5" />
      )}
      {/* Hover jets */}
      <rect x="12" y="34" width="4" height="3" rx="1" fill="#334155" />
      <rect x="28" y="34" width="4" height="3" rx="1" fill="#334155" />
    </svg>
  );
}

/* ── Echo: calm AI visor ── */
function EchoAvatar({ mood, accent }: { mood: CompanionMood; accent: string }) {
  const glowColor =
    mood === "happy" ? accent : mood === "alert" ? "#f87171" : mood === "thinking" ? "#facc15" : "#64748b";
  return (
    <svg
      width="44"
      height="32"
      viewBox="0 0 44 32"
      className={`companion-avatar companion-avatar-echo companion-mood-${mood}`}
    >
      {/* Visor shape */}
      <path
        d="M4 16 Q4 4 22 4 Q40 4 40 16 Q40 28 22 28 Q4 28 4 16Z"
        fill="#0f172a"
        stroke={glowColor}
        strokeWidth="1.5"
      />
      {/* Scan line */}
      <line x1="10" y1="16" x2="34" y2="16" stroke={glowColor} strokeWidth="0.8" opacity="0.4" />
      {/* Eye dots */}
      <circle cx="16" cy="15" r="2" fill={glowColor} className="companion-eye" />
      <circle cx="28" cy="15" r="2" fill={glowColor} className="companion-eye" />
      {/* Data readout bar */}
      <rect x="14" y="21" width="16" height="2" rx="1" fill={glowColor} opacity="0.3" />
    </svg>
  );
}

export default function Companion({ character, dialogue, mood, accent, position = "top-right" }: CompanionProps) {
  return (
    <div className={`companion companion-${position}`}>
      <div className="companion-character">
        {character === "byte" ? (
          <ByteAvatar mood={mood} accent={accent} />
        ) : (
          <EchoAvatar mood={mood} accent={accent} />
        )}
      </div>
      {dialogue && (
        <div className="companion-bubble" style={{ borderColor: `${accent}40` }}>
          <span className="companion-name" style={{ color: accent }}>
            {character === "byte" ? "Byte" : "Echo"}
          </span>
          <p className="companion-text">{dialogue}</p>
        </div>
      )}
    </div>
  );
}

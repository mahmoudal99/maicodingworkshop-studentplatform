"use client";

import { memo, type CSSProperties } from "react";

type TrophyVariant = "bronze" | "silver" | "gold" | "orbital" | "nova" | "core";
type TrophySize = "hero" | "podium";

interface TrophyStageProps {
  variant: TrophyVariant;
  size?: TrophySize;
  className?: string;
  title?: string;
  autoRotate?: boolean;
  float?: boolean;
}

interface TrophyPalette {
  body: string;
  edge: string;
  core: string;
  glow: string;
  emblem: "star" | "bolt" | "diamond";
  form: "shield" | "crystal";
}

const TROPHY_PALETTES: Record<TrophyVariant, TrophyPalette> = {
  bronze: {
    body: "#D8A675",
    edge: "#B67845",
    core: "#F6D6B7",
    glow: "#FFB36B",
    emblem: "diamond",
    form: "shield",
  },
  silver: {
    body: "#D9E5F2",
    edge: "#A9BCD1",
    core: "#F8FBFF",
    glow: "#8FD2FF",
    emblem: "star",
    form: "shield",
  },
  gold: {
    body: "#FFD854",
    edge: "#F1B418",
    core: "#FFF3A2",
    glow: "#FFD96F",
    emblem: "star",
    form: "shield",
  },
  orbital: {
    body: "#43C7FF",
    edge: "#157FDC",
    core: "#E2F8FF",
    glow: "#78E6FF",
    emblem: "bolt",
    form: "crystal",
  },
  nova: {
    body: "#5CE0BD",
    edge: "#20A97F",
    core: "#E9FFF8",
    glow: "#84F4D2",
    emblem: "star",
    form: "crystal",
  },
  core: {
    body: "#5FA8FF",
    edge: "#365FE8",
    core: "#EEF5FF",
    glow: "#9BC1FF",
    emblem: "star",
    form: "crystal",
  },
};

function emblemPath(emblem: TrophyPalette["emblem"]) {
  if (emblem === "bolt") {
    return "M130 76 111 110h18l-16 34 39-45h-18l14-23z";
  }

  if (emblem === "diamond") {
    return "M120 74 148 102 120 132 92 102Z";
  }

  return "M120 70 130 91 154 94 136 109 141 133 120 121 99 133 104 109 86 94 110 91Z";
}

function ShieldTrophy({ palette, idPrefix }: { palette: TrophyPalette; idPrefix: string }) {
  return (
    <svg viewBox="0 0 240 280" className="trophy-stage-svg" aria-hidden="true">
      <defs>
        <linearGradient id={`${idPrefix}-edge`} x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor={palette.core} />
          <stop offset="42%" stopColor={palette.edge} />
          <stop offset="100%" stopColor={palette.body} />
        </linearGradient>
        <linearGradient id={`${idPrefix}-body`} x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor={palette.core} />
          <stop offset="46%" stopColor={palette.body} />
          <stop offset="100%" stopColor={palette.edge} />
        </linearGradient>
        <filter id={`${idPrefix}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="120" cy="238" rx="54" ry="16" fill={palette.glow} opacity="0.18" />
      <rect x="104" y="22" width="32" height="22" rx="10" fill={palette.edge} opacity="0.92" />
      <path
        d="M120 34c48 0 68 37 63 84-5 45-31 91-63 114-32-23-58-69-63-114-5-47 15-84 63-84Z"
        fill={`url(#${idPrefix}-edge)`}
        stroke={palette.core}
        strokeOpacity="0.38"
        strokeWidth="5"
        filter={`url(#${idPrefix}-glow)`}
      />
      <path
        d="M120 54c34 0 49 26 45 59-4 33-23 68-45 85-22-17-41-52-45-85-4-33 11-59 45-59Z"
        fill={`url(#${idPrefix}-body)`}
        stroke={palette.core}
        strokeOpacity="0.24"
        strokeWidth="3"
      />
      <path
        d="M120 72c23 0 33 17 31 39-3 22-15 45-31 56-16-11-28-34-31-56-2-22 8-39 31-39Z"
        fill={palette.core}
        opacity="0.92"
      />
      <path d={emblemPath(palette.emblem)} fill={palette.edge} />
      <path
        d="M76 74c18-16 70-17 88-3"
        fill="none"
        stroke={palette.core}
        strokeOpacity="0.45"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CrystalTrophy({ palette, idPrefix }: { palette: TrophyPalette; idPrefix: string }) {
  return (
    <svg viewBox="0 0 240 280" className="trophy-stage-svg" aria-hidden="true">
      <defs>
        <linearGradient id={`${idPrefix}-crystal`} x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor={palette.core} />
          <stop offset="44%" stopColor={palette.body} />
          <stop offset="100%" stopColor={palette.edge} />
        </linearGradient>
        <linearGradient id={`${idPrefix}-core`} x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor={palette.core} />
        </linearGradient>
        <filter id={`${idPrefix}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="120" cy="238" rx="58" ry="16" fill={palette.glow} opacity="0.16" />
      <ellipse
        cx="120"
        cy="106"
        rx="76"
        ry="28"
        fill="none"
        stroke={palette.core}
        strokeOpacity="0.66"
        strokeWidth="8"
        transform="rotate(-14 120 106)"
      />
      <path
        d="M120 34 176 68v68l-56 34-56-34V68l56-34Z"
        fill={palette.edge}
        opacity="0.82"
        filter={`url(#${idPrefix}-glow)`}
      />
      <path
        d="M120 48 164 74v56l-44 26-44-26V74l44-26Z"
        fill={`url(#${idPrefix}-crystal)`}
        stroke={palette.core}
        strokeOpacity="0.42"
        strokeWidth="4"
      />
      <path
        d="M120 68 150 86v34l-30 18-30-18V86l30-18Z"
        fill={`url(#${idPrefix}-core)`}
        opacity="0.95"
      />
      <path d={emblemPath(palette.emblem)} fill={palette.edge} />
      <path
        d="M92 66 120 48l28 18M92 134l28 16 28-16"
        fill="none"
        stroke={palette.core}
        strokeOpacity="0.3"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrophyStage({
  variant,
  size = "hero",
  className,
  title,
  autoRotate = size === "hero",
  float = true,
}: TrophyStageProps) {
  const palette = TROPHY_PALETTES[variant];
  const idPrefix = `trophy-${variant}-${size}`;
  const content =
    palette.form === "shield" ? (
      <ShieldTrophy palette={palette} idPrefix={idPrefix} />
    ) : (
      <CrystalTrophy palette={palette} idPrefix={idPrefix} />
    );

  return (
    <div
      className={`trophy-stage trophy-stage-${size}${className ? ` ${className}` : ""}`}
      aria-label={title || "Trophy display"}
      data-float={float}
      data-rotate={autoRotate}
      data-variant={variant}
      role="img"
      style={
        {
          "--trophy-body": palette.body,
          "--trophy-edge": palette.edge,
          "--trophy-core": palette.core,
          "--trophy-glow": palette.glow,
        } as CSSProperties
      }
    >
      <div className="trophy-stage-aura" aria-hidden="true" />
      <div className="trophy-stage-shell">{content}</div>
    </div>
  );
}

const MemoizedTrophyStage = memo(TrophyStage);
MemoizedTrophyStage.displayName = "TrophyStage";

export default MemoizedTrophyStage;

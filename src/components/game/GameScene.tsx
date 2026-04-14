"use client";

import { type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Companion from "./Companion";
import StabilityBar from "./StabilityBar";
import type { CompanionMood } from "@/lib/game/use-companion";

export interface GameSceneCompanion {
  character: "byte" | "echo";
  dialogue: string | null;
  mood: CompanionMood;
}

interface GameSceneProps {
  layout?: "panel" | "split" | "birdseye";
  accent: string;
  header: { room: string; step: string };
  missionTitle: string;
  missionObjective: string;
  subtitle?: string;
  hint?: string;
  companions?: GameSceneCompanion[];
  stability?: { stability: number; combo: number };
  statusText: string;
  statusColor?: string;
  controls?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export default function GameScene({
  layout = "panel",
  accent,
  header,
  missionTitle,
  missionObjective,
  subtitle,
  hint,
  companions = [],
  stability,
  statusText,
  statusColor,
  controls,
  footer,
  children,
}: GameSceneProps) {
  return (
    <section
      className={`game-scene game-scene-${layout}${footer ? " game-scene-complete" : ""}`}
      style={{ "--game-accent": accent } as CSSProperties}
    >
      <div className="lab-panel mission-panel">
        <div className="lab-panel-header mission-header">
          <span className="lab-room">{header.room}</span>
          <span className="lab-step">{header.step}</span>
        </div>

        {stability && (
          <StabilityBar stability={stability.stability} combo={stability.combo} accent={accent} />
        )}

        <div className="mission-copy-row">
          <div className="mission-copy-stack">
            <span className="mission-kicker">Repair Mission</span>
            <h2 className="lab-title">{missionTitle}</h2>
            <p className="lab-copy mission-objective">{missionObjective}</p>
          </div>

          {companions.length > 0 && (
            <div className="mission-companions" aria-label="Companions">
              {companions.map((companion) => (
                <Companion
                  key={companion.character}
                  character={companion.character}
                  dialogue={companion.dialogue}
                  mood={companion.mood}
                  accent={accent}
                  position="inline"
                />
              ))}
            </div>
          )}
        </div>

        {subtitle && <p className="mission-subtitle">{subtitle}</p>}

        <div
          className={`mission-stage mission-stage-${layout}${
            controls ? " mission-stage-with-controls" : ""
          }`}
        >
          <div className="mission-stage-main">
            {children}
            {footer && (
              <div className="game-celebration mission-stage-celebration" aria-hidden="true">
                <div className="mission-stage-celebration-core" />
                <div className="mission-stage-celebration-ring" />
              </div>
            )}
          </div>
          {controls && <aside className="mission-stage-controls">{controls}</aside>}
        </div>

        <div className={`mission-status-group${footer ? " mission-status-group-complete" : ""}`}>
          {footer && <div className="mission-complete-pill">Mission Complete</div>}
          <div
            className="lab-status"
            style={{ color: statusColor || (footer ? accent : undefined) }}
          >
            {statusText}
          </div>
          {hint && !footer && <div className="mission-hint">Hint: {hint}</div>}
        </div>

      </div>

      {/* Portal the bottom bar to document.body so it's truly fixed, not clipped by .lesson-page overflow */}
      {footer && typeof document !== "undefined" && createPortal(
        <div className="mission-bottom-bar" aria-live="polite" style={{ "--game-accent": accent } as CSSProperties}>
          <div className="mission-bottom-bar-inner">
            <div className="mission-bottom-bar-status">
              <div className="mission-bottom-bar-icon mission-bottom-bar-icon-success">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="mission-bottom-bar-label">Amazing!</span>
            </div>
            <div className="mission-bottom-bar-action">{footer}</div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}

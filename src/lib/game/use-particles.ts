"use client";

import { useRef, useCallback } from "react";

export interface ParticleConfig {
  x: number;
  y: number;
  count?: number;
  color?: string;
  spread?: number;
  gravity?: number;
  lifetime?: number;
  size?: number;
}

/**
 * DOM-based particle burst system.
 * Creates absolutely-positioned spans with CSS animations.
 * Attach containerRef to the game's root element.
 */
export function useParticles() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const burst = useCallback((config: ParticleConfig) => {
    const el = containerRef.current;
    if (!el) return;

    const {
      x,
      y,
      count = 12,
      color = "#4ade80",
      spread = 60,
      gravity = 0.5,
      lifetime = 600,
      size = 6,
    } = config;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("span");
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const dist = spread * (0.5 + Math.random() * 0.5);
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist - gravity * 30;

      particle.style.cssText = `
        position:absolute;
        left:${x}px;
        top:${y}px;
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:${color};
        pointer-events:none;
        z-index:100;
        opacity:1;
        transform:translate(0,0) scale(1);
        transition:transform ${lifetime}ms cubic-bezier(.2,.8,.3,1),opacity ${lifetime}ms ease-out;
      `;

      el.appendChild(particle);

      // Force reflow then animate
      particle.getBoundingClientRect();
      particle.style.transform = `translate(${tx}px, ${ty}px) scale(0.2)`;
      particle.style.opacity = "0";

      setTimeout(() => particle.remove(), lifetime + 50);
    }
  }, []);

  return { containerRef, burst };
}

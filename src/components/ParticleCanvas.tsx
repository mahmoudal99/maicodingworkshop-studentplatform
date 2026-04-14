"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  opacity: number;
  twinkle: number;
  phase: number;
  color: string;
  cross: boolean;
}

const PARTICLE_COUNT = 118;
const STAR_COLORS = [
  "255,255,255",
  "160,220,255",
  "122,252,214",
  "255,215,140",
];

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas!.width = window.innerWidth * ratio;
      canvas!.height = window.innerHeight * ratio;
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function createParticle(): Particle {
      const radius = Math.random() < 0.22 ? Math.random() * 1.5 + 1.7 : Math.random() * 1.25 + 0.45;
      const velocity = radius > 1.7 ? 0.14 : 0.05;
      const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];

      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * velocity,
        vy: (Math.random() - 0.5) * velocity,
        r: radius,
        opacity: Math.random() * 0.34 + 0.12,
        twinkle: Math.random() * 0.015 + 0.004,
        phase: Math.random() * Math.PI * 2,
        color,
        cross: radius > 1.8 && Math.random() > 0.35,
      };
    }

    function init() {
      resize();
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle());
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += p.twinkle;

        if (p.x < -24) p.x = window.innerWidth + 24;
        if (p.x > window.innerWidth + 24) p.x = -24;
        if (p.y < -24) p.y = window.innerHeight + 24;
        if (p.y > window.innerHeight + 24) p.y = -24;

        const alpha = p.opacity * (0.72 + Math.sin(p.phase) * 0.28);

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${p.color}, ${alpha})`;
        ctx!.fill();

        if (p.cross) {
          ctx!.strokeStyle = `rgba(${p.color}, ${alpha * 0.65})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(p.x - p.r * 2.2, p.y);
          ctx!.lineTo(p.x + p.r * 2.2, p.y);
          ctx!.moveTo(p.x, p.y - p.r * 2.2);
          ctx!.lineTo(p.x, p.y + p.r * 2.2);
          ctx!.stroke();
        }
      }
      animId = requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resize);
    init();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} id="particle-canvas" />;
}

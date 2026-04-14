"use client";

import { useRef, useCallback } from "react";

/**
 * Synthesized game sounds using Web Audio API.
 * Zero dependencies, zero audio files.
 * AudioContext is lazily created on first user interaction.
 */
export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }, []);

  const playTone = useCallback(
    (freq: number, duration: number, type: OscillatorType = "sine", volume = 0.15) => {
      try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
      } catch {
        // Silently fail if audio isn't available
      }
    },
    [getCtx]
  );

  const playTap = useCallback(() => {
    playTone(800, 0.06, "sine", 0.08);
  }, [playTone]);

  const playCorrect = useCallback(() => {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.12, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.25);
      });
    } catch {}
  }, [getCtx]);

  const playWrong = useCallback(() => {
    playTone(200, 0.2, "sawtooth", 0.08);
  }, [playTone]);

  const playCombo = useCallback(
    (streak: number) => {
      const baseFreq = 440 + streak * 60;
      playTone(baseFreq, 0.12, "triangle", 0.1);
    },
    [playTone]
  );

  const playComplete = useCallback(() => {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0.15, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.4);
      });
    } catch {}
  }, [getCtx]);

  const playDrag = useCallback(() => {
    playTone(300, 0.05, "sine", 0.05);
  }, [playTone]);

  const playDrop = useCallback(() => {
    playTone(150, 0.1, "triangle", 0.1);
  }, [playTone]);

  const playPulse = useCallback(() => {
    playTone(600, 0.15, "sine", 0.06);
  }, [playTone]);

  return { playTap, playCorrect, playWrong, playCombo, playComplete, playDrag, playDrop, playPulse };
}

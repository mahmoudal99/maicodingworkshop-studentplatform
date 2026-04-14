"use client";

import { useState, useCallback } from "react";

/**
 * Combo streak + stability bar + scoring for microgames.
 */
export function useGameMeta(totalSteps: number) {
  const [stability, setStability] = useState(75);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const recordCorrect = useCallback(() => {
    setCombo((prev) => {
      const next = prev + 1;
      setMaxCombo((m) => Math.max(m, next));
      return next;
    });
    setStability((prev) => Math.min(100, prev + 8));
    setCorrectCount((c) => c + 1);
  }, []);

  const recordWrong = useCallback(() => {
    setCombo(0);
    setStability((prev) => Math.max(0, prev - 12));
    setWrongCount((c) => c + 1);
  }, []);

  // Score: base 100 per step, +50% for max combo, +25% for high stability
  const baseScore = correctCount * 100;
  const comboBonus = Math.round(maxCombo * 50);
  const stabilityBonus = stability > 60 ? Math.round((stability / 100) * 25 * totalSteps) : 0;
  const score = baseScore + comboBonus + stabilityBonus;

  // Star rating: 3 if no mistakes + combo >= 3, 2 if <=1 mistake, 1 otherwise
  const stars =
    wrongCount === 0 && maxCombo >= 3
      ? 3
      : wrongCount <= 1
      ? 2
      : 1;

  return {
    stability,
    combo,
    maxCombo,
    correctCount,
    wrongCount,
    score,
    stars,
    recordCorrect,
    recordWrong,
    isUnstable: stability <= 0,
  };
}

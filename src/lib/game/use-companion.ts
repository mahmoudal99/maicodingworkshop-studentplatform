"use client";

import { useState, useCallback } from "react";

export type CompanionMood = "neutral" | "happy" | "alert" | "thinking";

export function useCompanion(character: "byte" | "echo" = "byte") {
  const [dialogue, setDialogue] = useState<string | null>(null);
  const [mood, setMood] = useState<CompanionMood>("neutral");

  const say = useCallback((text: string, _duration = 3000) => {
    setDialogue(text);
  }, []);

  const celebrate = useCallback(
    (text?: string) => {
      setMood("happy");
      if (text) say(text, 2500);
      setTimeout(() => setMood("neutral"), 2500);
    },
    [say]
  );

  const alert = useCallback(
    (text?: string) => {
      setMood("alert");
      if (text) say(text, 3000);
      setTimeout(() => setMood("neutral"), 3000);
    },
    [say]
  );

  return { character, dialogue, mood, say, setMood, celebrate, alert };
}

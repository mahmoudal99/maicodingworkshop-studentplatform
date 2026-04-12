"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { WEEKS_A, WEEKS_B } from "./data";

interface ProgressState {
  completed: Record<string, boolean>;
  xp: number;
  toggle: (key: string) => void;
  isCompleted: (key: string) => boolean;
  getWeekProgress: (
    versionKey: string,
    weekIndex: number
  ) => { done: number; total: number; percent: number };
  getOverallProgress: (versionKey: string) => {
    done: number;
    total: number;
    percent: number;
    currentWeek: number;
  };
}

const ProgressContext = createContext<ProgressState>({
  completed: {},
  xp: 0,
  toggle: () => {},
  isCompleted: () => false,
  getWeekProgress: () => ({ done: 0, total: 0, percent: 0 }),
  getOverallProgress: () => ({ done: 0, total: 0, percent: 0, currentWeek: 1 }),
});

const STORAGE_KEY = "tlp-progress";

function computeXp(completed: Record<string, boolean>): number {
  let xp = 0;
  for (const key of Object.keys(completed)) {
    if (!completed[key]) continue;
    if (key.includes("-outcome-")) {
      xp += 5;
    } else {
      xp += 10;
    }
  }
  return xp;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [xp, setXp] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, boolean>;
        setCompleted(parsed);
        setXp(computeXp(parsed));
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  // Save to localStorage on every change (after initial load)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    } catch {
      // ignore
    }
  }, [completed, loaded]);

  const toggle = useCallback((key: string) => {
    setCompleted((prev) => {
      const next = { ...prev };
      const wasCompleted = !!next[key];
      if (wasCompleted) {
        delete next[key];
      } else {
        next[key] = true;
      }
      setXp(computeXp(next));
      return next;
    });
  }, []);

  const isCompleted = useCallback(
    (key: string) => !!completed[key],
    [completed]
  );

  const getWeekProgress = useCallback(
    (versionKey: string, weekIndex: number) => {
      const weeks = versionKey === "A" ? WEEKS_A : WEEKS_B;
      const week = weeks[weekIndex];
      if (!week) return { done: 0, total: 0, percent: 0 };

      let total = 0;
      let done = 0;
      week.sections.forEach((s, sIdx) => {
        s.items.forEach((_, iIdx) => {
          total++;
          const key = `${versionKey}-${weekIndex}-${sIdx}-${iIdx}`;
          if (completed[key]) done++;
        });
      });

      return {
        done,
        total,
        percent: total === 0 ? 0 : Math.round((done / total) * 100),
      };
    },
    [completed]
  );

  const getOverallProgress = useCallback(
    (versionKey: string) => {
      const weeks = versionKey === "A" ? WEEKS_A : WEEKS_B;
      let total = 0;
      let done = 0;
      let currentWeek = 1;
      let foundIncomplete = false;

      weeks.forEach((week, wIdx) => {
        let weekTotal = 0;
        let weekDone = 0;
        week.sections.forEach((s, sIdx) => {
          s.items.forEach((_, iIdx) => {
            total++;
            weekTotal++;
            const key = `${versionKey}-${wIdx}-${sIdx}-${iIdx}`;
            if (completed[key]) {
              done++;
              weekDone++;
            }
          });
        });
        if (!foundIncomplete && weekTotal > 0 && weekDone < weekTotal) {
          currentWeek = wIdx + 1;
          foundIncomplete = true;
        }
      });

      if (!foundIncomplete && total > 0 && done === total) {
        currentWeek = weeks.length;
      }

      return {
        done,
        total,
        percent: total === 0 ? 0 : Math.round((done / total) * 100),
        currentWeek,
      };
    },
    [completed]
  );

  return (
    <ProgressContext.Provider
      value={{
        completed,
        xp,
        toggle,
        isCompleted,
        getWeekProgress,
        getOverallProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  return useContext(ProgressContext);
}

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
import { useUser } from "./store";

interface ProgressState {
  completed: Record<string, boolean>;
  xp: number;
  progressLoaded: boolean;
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
  progressLoaded: false,
  toggle: () => {},
  isCompleted: () => false,
  getWeekProgress: () => ({ done: 0, total: 0, percent: 0 }),
  getOverallProgress: () => ({ done: 0, total: 0, percent: 0, currentWeek: 1 }),
});

export const LEGACY_PROGRESS_STORAGE_KEY = "tlp-progress";

export function getProgressStorageKey(userId: string) {
  return `tlp-progress:${userId}`;
}

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
  const { userId, loaded: userLoaded } = useUser();
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [xp, setXp] = useState(0);
  const [loadedUserId, setLoadedUserId] = useState("");
  const progressLoaded = Boolean(userId) && loadedUserId === userId;

  useEffect(() => {
    if (!userLoaded || !userId) return;

    setLoadedUserId("");
    setCompleted({});
    setXp(0);

    try {
      const storageKey = getProgressStorageKey(userId);
      const raw =
        localStorage.getItem(storageKey) ??
        localStorage.getItem(LEGACY_PROGRESS_STORAGE_KEY);

      if (typeof raw === "string") {
        const parsed = JSON.parse(raw) as Record<string, boolean>;
        setCompleted(parsed);
        setXp(computeXp(parsed));

        if (!localStorage.getItem(storageKey)) {
          localStorage.setItem(storageKey, JSON.stringify(parsed));
        }
      }
    } catch {
      // ignore
    }
    setLoadedUserId(userId);
  }, [userId, userLoaded]);

  useEffect(() => {
    if (!progressLoaded || !userId) return;
    try {
      localStorage.setItem(
        getProgressStorageKey(userId),
        JSON.stringify(completed)
      );
    } catch {
      // ignore
    }
  }, [completed, progressLoaded, userId]);

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
        progressLoaded,
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

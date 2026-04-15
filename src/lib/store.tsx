"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface UserState {
  userId: string;
  userName: string;
  versionKey: "A" | "B";
  loaded: boolean;
  setUser: (name: string, version: "A" | "B") => void;
}

const UserContext = createContext<UserState>({
  userId: "",
  userName: "",
  versionKey: "A",
  loaded: false,
  setUser: () => {},
});

const USER_STORAGE_KEY = "tlp-user";
const LEGACY_PROGRESS_STORAGE_KEY = "tlp-progress";
const LEGACY_STREAK_STORAGE_KEY = "tlp-streak-dates";

function normalizeStudentName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function createUserId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `user-${Math.random().toString(36).slice(2, 10)}`;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [versionKey, setVersionKey] = useState<"A" | "B">("A");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.userId) {
          setUserId(parsed.userId);
        } else {
          setUserId(createUserId());
        }
        if (parsed.userName) setUserName(parsed.userName);
        if (parsed.versionKey === "A" || parsed.versionKey === "B") setVersionKey(parsed.versionKey);
      } else {
        setUserId(createUserId());
      }
    } catch {
      setUserId(createUserId());
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || !userId) return;
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ userId, userName, versionKey }));
    } catch {}
  }, [userId, userName, versionKey, loaded]);

  const setUser = useCallback((name: string, version: "A" | "B") => {
    const nextName = name.trim();
    const nextNormalized = normalizeStudentName(nextName);
    const currentNormalized = normalizeStudentName(userName);

    if (
      typeof window !== "undefined" &&
      userName &&
      currentNormalized !== nextNormalized
    ) {
      window.localStorage.removeItem(LEGACY_PROGRESS_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_STREAK_STORAGE_KEY);
    }

    setUserId((current) => {
      if (current && currentNormalized === nextNormalized) {
        return current;
      }
      return createUserId();
    });
    setUserName(nextName);
    setVersionKey(version);
  }, [userName]);

  return (
    <UserContext.Provider value={{ userId, userName, versionKey, loaded, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

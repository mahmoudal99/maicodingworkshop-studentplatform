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
    setUserId((current) => current || createUserId());
    setUserName(name);
    setVersionKey(version);
  }, []);

  return (
    <UserContext.Provider value={{ userId, userName, versionKey, loaded, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

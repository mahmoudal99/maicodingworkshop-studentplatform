"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface UserState {
  userName: string;
  versionKey: "A" | "B";
  loaded: boolean;
  setUser: (name: string, version: "A" | "B") => void;
}

const UserContext = createContext<UserState>({
  userName: "",
  versionKey: "A",
  loaded: false,
  setUser: () => {},
});

const USER_STORAGE_KEY = "tlp-user";

export function UserProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState("");
  const [versionKey, setVersionKey] = useState<"A" | "B">("A");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.userName) setUserName(parsed.userName);
        if (parsed.versionKey === "A" || parsed.versionKey === "B") setVersionKey(parsed.versionKey);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ userName, versionKey }));
    } catch {}
  }, [userName, versionKey, loaded]);

  const setUser = useCallback((name: string, version: "A" | "B") => {
    setUserName(name);
    setVersionKey(version);
  }, []);

  return (
    <UserContext.Provider value={{ userName, versionKey, loaded, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

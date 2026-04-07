"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface UserState {
  userName: string;
  versionKey: "A" | "B";
  setUser: (name: string, version: "A" | "B") => void;
}

const UserContext = createContext<UserState>({
  userName: "",
  versionKey: "A",
  setUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState("");
  const [versionKey, setVersionKey] = useState<"A" | "B">("A");

  const setUser = useCallback((name: string, version: "A" | "B") => {
    setUserName(name);
    setVersionKey(version);
  }, []);

  return (
    <UserContext.Provider value={{ userName, versionKey, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

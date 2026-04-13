"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface ResourceLink {
  label: string;
  url: string;
  icon: string;
}

interface GlobalResource {
  icon: string;
  title: string;
  desc: string;
  tag: string;
  url: string;
}

interface AdminUnlockState {
  unlockedWeeks: number[];
  adminLoaded: boolean;
  isWeekAdminUnlocked: (weekNum: number) => boolean;
  weekLinks: Record<string, ResourceLink[]>;
  globalResources: GlobalResource[];
}

const AdminUnlockContext = createContext<AdminUnlockState>({
  unlockedWeeks: [],
  adminLoaded: false,
  isWeekAdminUnlocked: () => false,
  weekLinks: {},
  globalResources: [],
});

export function AdminUnlockProvider({ children }: { children: ReactNode }) {
  const [unlockedWeeks, setUnlockedWeeks] = useState<number[]>([]);
  const [weekLinks, setWeekLinks] = useState<Record<string, ResourceLink[]>>({});
  const [globalResources, setGlobalResources] = useState<GlobalResource[]>([]);
  const [adminLoaded, setAdminLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.unlockedWeeks)) {
          setUnlockedWeeks(data.unlockedWeeks);
        } else {
          setUnlockedWeeks([1, 2, 3, 4, 5, 6]);
        }
        if (data.weekLinks && typeof data.weekLinks === "object") {
          setWeekLinks(data.weekLinks);
        }
        if (Array.isArray(data.globalResources)) {
          setGlobalResources(data.globalResources);
        }
      })
      .catch(() => {
        setUnlockedWeeks([1, 2, 3, 4, 5, 6]);
      })
      .finally(() => setAdminLoaded(true));
  }, []);

  const isWeekAdminUnlocked = (weekNum: number) =>
    unlockedWeeks.includes(weekNum);

  return (
    <AdminUnlockContext.Provider value={{ unlockedWeeks, adminLoaded, isWeekAdminUnlocked, weekLinks, globalResources }}>
      {children}
    </AdminUnlockContext.Provider>
  );
}

export function useAdminUnlock() {
  return useContext(AdminUnlockContext);
}

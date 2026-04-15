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
  resourcesUnlocked: boolean;
}

const AdminUnlockContext = createContext<AdminUnlockState>({
  unlockedWeeks: [],
  adminLoaded: false,
  isWeekAdminUnlocked: () => false,
  weekLinks: {},
  globalResources: [],
  resourcesUnlocked: false,
});

export function AdminUnlockProvider({ children }: { children: ReactNode }) {
  const [unlockedWeeks, setUnlockedWeeks] = useState<number[]>([]);
  const [weekLinks, setWeekLinks] = useState<Record<string, ResourceLink[]>>({});
  const [globalResources, setGlobalResources] = useState<GlobalResource[]>([]);
  const [resourcesUnlocked, setResourcesUnlocked] = useState(false);
  const [adminLoaded, setAdminLoaded] = useState(false);

  const safeUnlockedWeeks = [1];

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.unlockedWeeks)) {
          setUnlockedWeeks(data.unlockedWeeks);
        } else {
          setUnlockedWeeks(safeUnlockedWeeks);
        }
        if (data.weekLinks && typeof data.weekLinks === "object") {
          setWeekLinks(data.weekLinks);
        }
        if (Array.isArray(data.globalResources)) {
          setGlobalResources(data.globalResources);
        }
        if (typeof data.resourcesUnlocked === "boolean") {
          setResourcesUnlocked(data.resourcesUnlocked);
        }
      })
      .catch(() => {
        setUnlockedWeeks(safeUnlockedWeeks);
        setWeekLinks({});
        setGlobalResources([]);
        setResourcesUnlocked(false);
      })
      .finally(() => setAdminLoaded(true));
  }, []);

  const isWeekAdminUnlocked = (weekNum: number) =>
    unlockedWeeks.includes(weekNum);

  return (
    <AdminUnlockContext.Provider value={{ unlockedWeeks, adminLoaded, isWeekAdminUnlocked, weekLinks, globalResources, resourcesUnlocked }}>
      {children}
    </AdminUnlockContext.Provider>
  );
}

export function useAdminUnlock() {
  return useContext(AdminUnlockContext);
}

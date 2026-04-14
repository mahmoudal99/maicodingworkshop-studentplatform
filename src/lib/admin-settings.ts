import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const DEFAULT_UNLOCKED = [1];
const LOCAL_FILE = join(process.cwd(), ".dev-settings.json");

export interface ResourceLink {
  label: string;
  url: string;
  icon: string;
}

export interface GlobalResource {
  icon: string;
  title: string;
  desc: string;
  tag: string;
  url: string;
}

interface Settings {
  unlockedWeeks: number[];
  weekLinks?: Record<string, ResourceLink[]>;   // keyed by week number "1"-"6"
  globalResources?: GlobalResource[];
  resourcesUnlocked?: boolean;
}

// ── Netlify Blobs backend ──
async function getBlobStore() {
  try {
    const { getStore } = await import("@netlify/blobs");
    return getStore({ name: "workshop-settings", consistency: "strong" });
  } catch {
    return null;
  }
}

// ── Local file fallback for `next dev` ──
function readLocal(): Settings {
  try {
    if (existsSync(LOCAL_FILE)) {
      return JSON.parse(readFileSync(LOCAL_FILE, "utf-8"));
    }
  } catch {}
  return { unlockedWeeks: DEFAULT_UNLOCKED };
}

function writeLocal(settings: Settings) {
  writeFileSync(LOCAL_FILE, JSON.stringify(settings, null, 2));
}

// ── Public API ──

export async function getUnlockedWeeks(): Promise<number[]> {
  const store = await getBlobStore();
  if (store) {
    try {
      const data = await store.get("unlocked-weeks", { type: "json" }) as number[] | null;
      return data ?? DEFAULT_UNLOCKED;
    } catch {
      return DEFAULT_UNLOCKED;
    }
  }
  return readLocal().unlockedWeeks;
}

export async function setUnlockedWeeks(weeks: number[]): Promise<void> {
  const store = await getBlobStore();
  if (store) {
    await store.setJSON("unlocked-weeks", weeks);
    return;
  }
  const current = readLocal();
  writeLocal({ ...current, unlockedWeeks: weeks });
}

// ── Week Links ──

export async function getWeekLinks(): Promise<Record<string, ResourceLink[]>> {
  const store = await getBlobStore();
  if (store) {
    try {
      const data = await store.get("week-links", { type: "json" }) as Record<string, ResourceLink[]> | null;
      return data ?? {};
    } catch {
      return {};
    }
  }
  return readLocal().weekLinks ?? {};
}

export async function setWeekLinks(links: Record<string, ResourceLink[]>): Promise<void> {
  const store = await getBlobStore();
  if (store) {
    await store.setJSON("week-links", links);
    return;
  }
  const current = readLocal();
  writeLocal({ ...current, weekLinks: links });
}

// ── Global Resources ──

export async function getGlobalResources(): Promise<GlobalResource[]> {
  const store = await getBlobStore();
  if (store) {
    try {
      const data = await store.get("global-resources", { type: "json" }) as GlobalResource[] | null;
      return data ?? [];
    } catch {
      return [];
    }
  }
  return readLocal().globalResources ?? [];
}

export async function setGlobalResources(resources: GlobalResource[]): Promise<void> {
  const store = await getBlobStore();
  if (store) {
    await store.setJSON("global-resources", resources);
    return;
  }
  const current = readLocal();
  writeLocal({ ...current, globalResources: resources });
}

// ── Resources Unlock ──

export async function getResourcesUnlocked(): Promise<boolean> {
  const store = await getBlobStore();
  if (store) {
    try {
      const data = await store.get("resources-unlocked", { type: "json" }) as boolean | null;
      return data ?? false;
    } catch {
      return false;
    }
  }
  return readLocal().resourcesUnlocked ?? false;
}

export async function setResourcesUnlocked(unlocked: boolean): Promise<void> {
  const store = await getBlobStore();
  if (store) {
    await store.setJSON("resources-unlocked", unlocked);
    return;
  }
  const current = readLocal();
  writeLocal({ ...current, resourcesUnlocked: unlocked });
}

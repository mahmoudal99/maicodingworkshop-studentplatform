import { NextResponse } from "next/server";
import {
  getUnlockedWeeks,
  setUnlockedWeeks,
  getWeekLinks,
  setWeekLinks,
  getGlobalResources,
  setGlobalResources,
  type ResourceLink,
  type GlobalResource,
} from "@/lib/admin-settings";

export async function GET() {
  const [unlockedWeeks, weekLinks, globalResources] = await Promise.all([
    getUnlockedWeeks(),
    getWeekLinks(),
    getGlobalResources(),
  ]);
  return NextResponse.json({ unlockedWeeks, weekLinks, globalResources });
}

export async function POST(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
  }

  let body: {
    password?: string;
    unlockedWeeks?: number[];
    weekLinks?: Record<string, ResourceLink[]>;
    globalResources?: GlobalResource[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.password !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Handle week unlocks
  if (body.unlockedWeeks !== undefined) {
    if (
      !Array.isArray(body.unlockedWeeks) ||
      !body.unlockedWeeks.every((w) => typeof w === "number" && w >= 1 && w <= 6)
    ) {
      return NextResponse.json({ error: "Invalid weeks array" }, { status: 400 });
    }
    const weeks = Array.from(new Set([1, ...body.unlockedWeeks])).sort();
    await setUnlockedWeeks(weeks);
  }

  // Handle week links
  if (body.weekLinks !== undefined) {
    await setWeekLinks(body.weekLinks);
  }

  // Handle global resources
  if (body.globalResources !== undefined) {
    await setGlobalResources(body.globalResources);
  }

  // Return updated state
  const [unlockedWeeks, weekLinks, globalResources] = await Promise.all([
    getUnlockedWeeks(),
    getWeekLinks(),
    getGlobalResources(),
  ]);

  return NextResponse.json({ success: true, unlockedWeeks, weekLinks, globalResources });
}

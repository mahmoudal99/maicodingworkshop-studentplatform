export type GameId = "binary-counting" | "component-match" | "wireframe-builder";

const GAME_MAP: Record<string, GameId> = {
  "A-0-0-0": "binary-counting",
  "A-0-0-1": "component-match",
  "A-0-0-2": "wireframe-builder",
};

export function getGameId(
  versionKey: string,
  weekIndex: number,
  sectionIndex: number,
  itemIndex: number
): GameId | null {
  return GAME_MAP[`${versionKey}-${weekIndex}-${sectionIndex}-${itemIndex}`] ?? null;
}

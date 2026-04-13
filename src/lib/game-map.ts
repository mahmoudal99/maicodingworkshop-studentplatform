export type GameId = "binary-counting" | "component-match" | "code-sorting" | "code-execution-chain" | "code-everywhere-quiz";

const GAME_MAP: Record<string, GameId> = {
  "A-0-0-0": "binary-counting",
  "A-0-0-1": "component-match",
  "A-0-0-2": "code-sorting",
  "A-0-0-3": "code-execution-chain",
  "A-0-0-4": "code-everywhere-quiz",
};

export function getGameId(
  versionKey: string,
  weekIndex: number,
  sectionIndex: number,
  itemIndex: number
): GameId | null {
  return GAME_MAP[`${versionKey}-${weekIndex}-${sectionIndex}-${itemIndex}`] ?? null;
}

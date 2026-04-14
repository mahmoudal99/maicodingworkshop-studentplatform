export type GameId =
  | "binary-counting"
  | "component-match"
  | "code-sorting"
  | "code-execution-chain"
  | "byte-forge"
  | "signal-tunnel"
  | "memory-vault"
  | "literal-bot-test"
  | "launch-the-lab";

const GAME_MAP: Record<string, GameId> = {
  "A-0-0-0": "binary-counting",
  "A-0-0-1": "component-match",
  "A-0-0-2": "code-sorting",
  "A-0-0-3": "code-execution-chain",
  "A-0-0-4": "code-execution-chain",
  "A-0-1-0": "byte-forge",
  "A-0-1-1": "signal-tunnel",
  "A-0-1-2": "memory-vault",
  "A-0-1-3": "literal-bot-test",
  "A-0-1-4": "launch-the-lab",
};

export function getGameId(
  versionKey: string,
  weekIndex: number,
  sectionIndex: number,
  itemIndex: number
): GameId | null {
  return GAME_MAP[`${versionKey}-${weekIndex}-${sectionIndex}-${itemIndex}`] ?? null;
}

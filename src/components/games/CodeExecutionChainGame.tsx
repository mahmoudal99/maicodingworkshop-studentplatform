"use client";

import { type CSSProperties, type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import GameScene from "@/components/game/GameScene";
import { useGameMeta } from "@/lib/game/use-game-meta";
import { useParticles } from "@/lib/game/use-particles";
import { useSound } from "@/lib/game/use-sound";

interface Props {
  onComplete: () => void;
  accent: string;
}

interface TerminalMission {
  id: string;
  title: string;
  objective: string;
  targetOutput: string;
  introLine: string;
  successLine: string;
  example: string;
}

type TokenKind = "keyword" | "string" | "number" | "identifier" | "operator" | "punctuation";

interface LiveToken {
  value: string;
  kind: TokenKind;
  color: string;
}

interface BinaryPacket {
  bits: string;
  color: string;
  kind: TokenKind;
}

interface Analysis {
  tokens: LiveToken[];
  binaryPackets: BinaryPacket[];
  output: string;
  status: string;
  error: string | null;
  isMatch: boolean;
  sourceReady: boolean;
  tokenReady: boolean;
  binaryReady: boolean;
  cpuReady: boolean;
  outputReady: boolean;
}

interface RunSnapshot extends Analysis {
  source: string;
  executionOutput: string;
}

interface KeyboardKey {
  label: string;
  value: string;
  width?: "wide" | "xl";
  accent?: "source" | "tokens" | "binary" | "cpu" | "output";
}

const CORE_MISSIONS: TerminalMission[] = [
  {
    id: "hello-visor",
    title: "Wake the visor",
    objective: "Type code that prints HELLO into the visor.",
    targetOutput: "HELLO",
    introLine: "Type code to send HELLO through the ship display.",
    successLine: "Visor online.",
    example: 'Try print("HELLO")',
  },
  {
    id: "reactor-counter",
    title: "Fix the reactor counter",
    objective: "Type code that makes the reactor display 5.",
    targetOutput: "5",
    introLine: "Type code that lands on the value 5.",
    successLine: "Counter repaired.",
    example: "Try score = 4 + 1 then print(score)",
  },
  {
    id: "launch-display",
    title: "Trigger the launch wall",
    objective: "Type code that sends GO! to the launch wall.",
    targetOutput: "GO!",
    introLine: "Type code that prints GO! to the launch wall.",
    successLine: "Launch wall online.",
    example: 'Try print("GO!")',
  },
];

const ADVANCED_MISSIONS: TerminalMission[] = [
  {
    id: "status-banner",
    title: "Restore the banner",
    objective: "Type code that prints READY NOW into the banner.",
    targetOutput: "READY NOW",
    introLine: "Build one string that prints READY NOW.",
    successLine: "Banner online.",
    example: 'print("READY" + " NOW")',
  },
  {
    id: "signal-cache",
    title: "Patch the signal cache",
    objective: "Store 7, then print it into the cache monitor.",
    targetOutput: "7",
    introLine: "Use memory first, then print the saved value.",
    successLine: "Cache monitor repaired.",
    example: "signal = 3 + 4 then print(signal)",
  },
  {
    id: "dock-greenlight",
    title: "Open the dock lights",
    objective: "Type code that sends GO GO to the dock lights.",
    targetOutput: "GO GO",
    introLine: "Combine two strings and print the final launch phrase.",
    successLine: "Dock lights online.",
    example: 'print("GO" + " GO")',
  },
];

const TOKEN_COLORS: Record<TokenKind, string> = {
  keyword: "#dff6ff",
  string: "#46d9ff",
  number: "#5fa8ff",
  identifier: "#98b9ff",
  operator: "#a78bfa",
  punctuation: "#7dd3fc",
};

const COCKPIT_STARS = [
  { x: "8%", y: "18%", size: 1.4, opacity: 0.52, delay: "0s", duration: "22s", depth: "far" },
  { x: "15%", y: "34%", size: 2.2, opacity: 0.68, delay: "1.3s", duration: "18s", depth: "mid" },
  { x: "22%", y: "12%", size: 1.1, opacity: 0.38, delay: "0.8s", duration: "28s", depth: "far" },
  { x: "29%", y: "48%", size: 1.8, opacity: 0.58, delay: "2.1s", duration: "24s", depth: "mid" },
  { x: "36%", y: "20%", size: 2.8, opacity: 0.72, delay: "1.9s", duration: "17s", depth: "near" },
  { x: "44%", y: "40%", size: 1.3, opacity: 0.46, delay: "1.1s", duration: "25s", depth: "far" },
  { x: "52%", y: "15%", size: 1.7, opacity: 0.52, delay: "2.6s", duration: "20s", depth: "mid" },
  { x: "58%", y: "57%", size: 1.2, opacity: 0.32, delay: "0.4s", duration: "26s", depth: "far" },
  { x: "64%", y: "28%", size: 2.4, opacity: 0.7, delay: "1.5s", duration: "18s", depth: "near" },
  { x: "71%", y: "46%", size: 1.6, opacity: 0.48, delay: "2.8s", duration: "21s", depth: "mid" },
  { x: "78%", y: "18%", size: 1.1, opacity: 0.34, delay: "0.7s", duration: "29s", depth: "far" },
  { x: "84%", y: "34%", size: 2.1, opacity: 0.62, delay: "1.7s", duration: "19s", depth: "mid" },
  { x: "12%", y: "62%", size: 1.5, opacity: 0.48, delay: "2.2s", duration: "23s", depth: "far" },
  { x: "19%", y: "76%", size: 2.6, opacity: 0.68, delay: "0.5s", duration: "16s", depth: "near" },
  { x: "34%", y: "70%", size: 1.2, opacity: 0.33, delay: "2.9s", duration: "30s", depth: "far" },
  { x: "47%", y: "82%", size: 1.9, opacity: 0.56, delay: "1.4s", duration: "22s", depth: "mid" },
  { x: "63%", y: "74%", size: 1.4, opacity: 0.45, delay: "2.4s", duration: "24s", depth: "far" },
  { x: "76%", y: "68%", size: 2.3, opacity: 0.72, delay: "0.9s", duration: "18s", depth: "near" },
  { x: "87%", y: "80%", size: 1.7, opacity: 0.55, delay: "2s", duration: "20s", depth: "mid" },
  { x: "93%", y: "58%", size: 1.1, opacity: 0.3, delay: "1.6s", duration: "31s", depth: "far" },
] as const;

const COCKPIT_SIGNALS = [
  { x: "17%", y: "28%", size: 42, delay: "0s", color: "#5fa8ff" },
  { x: "76%", y: "24%", size: 50, delay: "0.45s", color: "#46d9ff" },
  { x: "68%", y: "72%", size: 38, delay: "0.9s", color: "#3be67f" },
] as const;

const VIRTUAL_KEYBOARD: KeyboardKey[][] = [
  [
    { label: "1", value: "1", accent: "binary" },
    { label: "2", value: "2", accent: "binary" },
    { label: "3", value: "3", accent: "binary" },
    { label: "4", value: "4", accent: "binary" },
    { label: "5", value: "5", accent: "binary" },
    { label: "+", value: "+", accent: "cpu" },
    { label: "=", value: "=", accent: "cpu" },
    { label: "(", value: "(", accent: "source" },
    { label: ")", value: ")", accent: "source" },
    { label: '"', value: '"', accent: "tokens" },
  ],
  [
    { label: "q", value: "q" },
    { label: "w", value: "w" },
    { label: "e", value: "e" },
    { label: "r", value: "r" },
    { label: "t", value: "t" },
    { label: "y", value: "y" },
    { label: "u", value: "u" },
    { label: "i", value: "i" },
    { label: "o", value: "o" },
    { label: "p", value: "p", accent: "source" },
  ],
  [
    { label: "a", value: "a" },
    { label: "s", value: "s" },
    { label: "d", value: "d" },
    { label: "f", value: "f" },
    { label: "g", value: "g" },
    { label: "h", value: "h" },
    { label: "j", value: "j" },
    { label: "k", value: "k" },
    { label: "l", value: "l" },
    { label: "_", value: "_" },
  ],
  [
    { label: "z", value: "z" },
    { label: "x", value: "x" },
    { label: "c", value: "c" },
    { label: "v", value: "v" },
    { label: "b", value: "b" },
    { label: "n", value: "n" },
    { label: "m", value: "m" },
    { label: ".", value: "." },
    { label: "'", value: "'" },
    { label: ",", value: "," },
  ],
  [
    { label: "Tab", value: "TAB", width: "wide", accent: "source" },
    { label: "Space", value: "SPACE", width: "xl", accent: "source" },
    { label: "Line", value: "LINE", width: "wide", accent: "binary" },
    { label: "⌫", value: "BACKSPACE", width: "wide", accent: "cpu" },
    { label: "Enter", value: "ENTER", width: "wide", accent: "output" },
  ],
];

function tokenizeCode(code: string): LiveToken[] {
  const pattern =
    /"(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?|[A-Za-z_]\w*|\d+|==|!=|<=|>=|[=+*/(),.]/g;
  const keywords = new Set(["print", "let", "const", "var"]);

  return Array.from(code.matchAll(pattern), (match) => {
    const value = match[0];
    let kind: TokenKind = "identifier";

    if (keywords.has(value)) kind = "keyword";
    else if (/^['"]/.test(value)) kind = "string";
    else if (/^\d+$/.test(value)) kind = "number";
    else if (/^[=+*/]+$/.test(value)) kind = "operator";
    else if (/^[(),.]$/.test(value)) kind = "punctuation";

    return {
      value,
      kind,
      color: TOKEN_COLORS[kind],
    };
  });
}

function toBinaryPackets(tokens: LiveToken[]): BinaryPacket[] {
  const packets: BinaryPacket[] = [];

  for (const token of tokens.slice(0, 8)) {
    for (const character of Array.from(token.value).slice(0, token.kind === "string" ? 2 : 1)) {
      packets.push({
        bits: character.charCodeAt(0).toString(2).padStart(8, "0"),
        color: token.color,
        kind: token.kind,
      });

      if (packets.length >= 12) return packets;
    }
  }

  return packets;
}

function splitExpressionParts(expression: string) {
  const parts: string[] = [];
  let current = "";
  let quote: '"' | "'" | null = null;

  for (const character of expression) {
    if (quote) {
      current += character;
      if (character === quote) quote = null;
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      current += character;
      continue;
    }

    if (character === "+") {
      parts.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
}

function evaluateTerm(
  term: string,
  scope: Record<string, string | number>,
  allowPartial = false,
) {
  const trimmed = term.trim();

  if (!trimmed) {
    return { value: null as string | number | null, valid: false, pending: true };
  }

  if (
    (trimmed.startsWith('"') && !trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && !trimmed.endsWith("'"))
  ) {
    return allowPartial
      ? { value: trimmed.slice(1), valid: false, pending: true }
      : { value: null, valid: false, pending: true };
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return { value: trimmed.slice(1, -1), valid: true, pending: false };
  }

  if (/^\d+$/.test(trimmed)) {
    return { value: Number(trimmed), valid: true, pending: false };
  }

  if (/^[A-Za-z_]\w*$/.test(trimmed)) {
    if (trimmed in scope) {
      return { value: scope[trimmed], valid: true, pending: false };
    }

    return allowPartial
      ? { value: null, valid: false, pending: true }
      : { value: null, valid: false, pending: false };
  }

  return { value: null, valid: false, pending: false };
}

function evaluateExpression(
  expression: string,
  scope: Record<string, string | number>,
  allowPartial = false,
) {
  const trimmed = expression.trim();

  if (!trimmed) {
    return { value: null as string | number | null, valid: false, pending: true };
  }

  const parts = splitExpressionParts(trimmed);
  if (parts.length === 0) {
    return { value: null as string | number | null, valid: false, pending: true };
  }

  const values: Array<string | number> = [];
  let hasString = false;

  for (const part of parts) {
    const evaluated = evaluateTerm(part, scope, allowPartial);
    if (!evaluated.valid) {
      return {
        value: evaluated.value,
        valid: false,
        pending: evaluated.pending,
      };
    }

    if (evaluated.value === null) {
      return {
        value: null,
        valid: false,
        pending: true,
      };
    }

    if (typeof evaluated.value === "string") hasString = true;
    values.push(evaluated.value);
  }

  if (hasString) {
    return {
      value: values.map((value) => String(value)).join(""),
      valid: true,
      pending: false,
    };
  }

  return {
    value: values.reduce<number>((total, value) => total + Number(value), 0),
    valid: true,
    pending: false,
  };
}

function analyzeCode(code: string, targetOutput: string): Analysis {
  const tokens = tokenizeCode(code);
  const binaryPackets = toBinaryPackets(tokens);
  const scope: Record<string, string | number> = {};
  const outputs: string[] = [];
  let error: string | null = null;
  let status = "Start typing to wake the ship systems.";

  const lines = code.split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("//")) continue;

    const assignmentMatch = line.match(/^(?:(?:let|const|var)\s+)?([A-Za-z_]\w*)\s*=\s*(.+)$/);
    if (assignmentMatch) {
      const [, identifier, expression] = assignmentMatch;
      const result = evaluateExpression(expression, scope);

      if (result.pending) {
        status = `${identifier} is still forming.`;
        continue;
      }

      if (!result.valid) {
        error = "That assignment does not resolve yet.";
        break;
      }

      scope[identifier] = result.value ?? "";
      status = `${identifier} is locked into memory.`;
      continue;
    }

    const completePrintMatch = line.match(/^print\s*\((.*)\)\s*$/);
    if (completePrintMatch) {
      const result = evaluateExpression(completePrintMatch[1], scope);

      if (result.pending) {
        status = "The print signal is still opening.";
        continue;
      }

      if (!result.valid) {
        error = "The print line cannot run yet.";
        break;
      }

      outputs.push(String(result.value ?? ""));
      status = "Output channel is receiving data.";
      continue;
    }

    const livePrintMatch = line.match(/^print\s*\((.*)$/);
    if (livePrintMatch) {
      const result = evaluateExpression(livePrintMatch[1], scope, true);

      if (result.value !== null && result.value !== undefined && String(result.value).length > 0) {
        outputs.push(String(result.value));
        status = "Live output is forming.";
      } else {
        status = "Print signal is waiting for more code.";
      }
      continue;
    }

    if (/^[A-Za-z_]\w*$/.test(line) || /^[A-Za-z_]\w*\s*=/.test(line) || /^[\w\s"'()+.=]*$/.test(line)) {
      status = "Parser is tracing your code live.";
      continue;
    }

    error = "That command is outside this ship console.";
    break;
  }

  const output = outputs.at(-1) ?? "";
  const isMatch = output === targetOutput;

  if (error) status = error;
  else if (!code.trim()) status = "Start typing to wake the ship systems.";
  else if (isMatch) status = `Target lock acquired. Press Enter to fire ${targetOutput}.`;
  else if (output) status = `Live output: ${output}`;
  else if (tokens.length) status = "Code is flowing through the ship.";

  return {
    tokens,
    binaryPackets,
    output,
    status,
    error,
    isMatch,
    sourceReady: code.trim().length > 0,
    tokenReady: tokens.length > 0,
    binaryReady: binaryPackets.length > 0,
    cpuReady: tokens.length > 0,
    outputReady: output.length > 0 || Boolean(error),
  };
}

export default function CodeExecutionChainGame({ onComplete, accent }: Props) {
  const params = useParams<{ lessonIndex?: string }>();
  const { playTap, playCorrect, playWrong, playCombo, playComplete, playPulse } = useSound();
  const { containerRef, burst } = useParticles();
  const lessonIndex = Number(params.lessonIndex ?? 0);
  const missions = useMemo(
    () => (lessonIndex >= 4 ? ADVANCED_MISSIONS : CORE_MISSIONS),
    [lessonIndex],
  );
  const { stability, combo, recordCorrect, recordWrong } = useGameMeta(missions.length);
  const comboRef = useRef(combo);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const [round, setRound] = useState(0);
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<"select" | "executing" | "complete">("select");
  const [executionStage, setExecutionStage] = useState(-1);
  const [statusText, setStatusText] = useState(missions[0].introLine);
  const [typedSource, setTypedSource] = useState("");
  const [typedOutput, setTypedOutput] = useState("");
  const [typingPulse, setTypingPulse] = useState(0);
  const [typingActive, setTypingActive] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [lastRunCorrect, setLastRunCorrect] = useState<boolean | null>(null);
  const [spaceEvent, setSpaceEvent] = useState<"warp" | "success" | "error" | null>(null);
  const [spaceEventKey, setSpaceEventKey] = useState(0);
  const [runSnapshot, setRunSnapshot] = useState<RunSnapshot | null>(null);

  const mission = missions[round];
  const analysis = analyzeCode(code, mission.targetOutput);
  const displayState = phase === "executing" && runSnapshot ? runSnapshot : analysis;
  const liveOutputText = analysis.error ? "ERROR" : analysis.output || "STANDBY";
  const executionOutputText =
    runSnapshot?.executionOutput || (runSnapshot?.error ? "ERROR" : "NO OUTPUT");
  const leftLanePackets = displayState.binaryPackets.filter((_, index) => index % 2 === 0).slice(0, 5);
  const rightLanePackets = displayState.binaryPackets.filter((_, index) => index % 2 === 1).slice(0, 5);
  const pulseLanePackets =
    rightLanePackets.length > 0 ? rightLanePackets : leftLanePackets.slice(1, Math.min(leftLanePackets.length, 4));
  const outputDisplay =
    phase === "executing"
      ? executionStage >= 4
        ? typedOutput || executionOutputText
        : "LOCKED"
      : liveOutputText;
  const runReady = phase === "select" && analysis.isMatch && !analysis.error && code.trim().length > 0;

  const sourceActive = phase === "executing" ? executionStage === 0 : typingActive && analysis.sourceReady;
  const tokensActive = phase === "executing" ? executionStage === 1 : typingActive && analysis.tokenReady;
  const binaryActive = phase === "executing" ? executionStage === 2 : typingActive && analysis.binaryReady;
  const cpuActive = phase === "executing" ? executionStage === 3 : typingActive && analysis.cpuReady;
  const outputActive = phase === "executing" ? executionStage === 4 : typingActive && analysis.outputReady;
  const cockpitState =
    lastRunCorrect === true
      ? "success"
      : lastRunCorrect === false
      ? "error"
      : phase === "executing" && executionStage === 0
      ? "typing"
      : phase === "executing"
      ? "executing"
      : typingActive
      ? "typing"
      : code.trim()
      ? "armed"
      : "idle";

  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [round, phase]);

  useEffect(() => {
    setStatusText(mission.introLine);
  }, [mission.introLine]);

  useEffect(() => {
    if (phase !== "select") return;

    setStatusText(code.trim() ? analysis.status : mission.introLine);
  }, [analysis.status, code, mission.introLine, phase]);

  useEffect(() => {
    if (phase !== "executing" || !runSnapshot || executionStage !== 0) return;

    setTypedSource("");
    let index = 0;
    const timer = window.setInterval(() => {
      index = Math.min(runSnapshot.source.length, index + 2);
      setTypedSource(runSnapshot.source.slice(0, index));
      if (index >= runSnapshot.source.length) {
        window.clearInterval(timer);
      }
    }, 18);

    return () => {
      window.clearInterval(timer);
    };
  }, [executionStage, phase, runSnapshot]);

  useEffect(() => {
    if (phase !== "executing" || executionStage !== 4) return;

    setTypedOutput("");
    let index = 0;
    const timer = window.setInterval(() => {
      index = Math.min(executionOutputText.length, index + 1);
      setTypedOutput(executionOutputText.slice(0, index));
      if (index >= executionOutputText.length) {
        window.clearInterval(timer);
      }
    }, 44);

    return () => {
      window.clearInterval(timer);
    };
  }, [executionOutputText, executionStage, phase]);

  useEffect(() => {
    if (phase !== "executing" || !runSnapshot) return;

    const stageTimers = [
      window.setTimeout(() => {
        setExecutionStage(0);
        setStatusText("Source feed locked into the console.");
        playPulse();
      }, 140),
      window.setTimeout(() => {
        setExecutionStage(1);
        setStatusText("Tokens are breaking out of the source stream.");
        playPulse();
      }, 760),
      window.setTimeout(() => {
        setExecutionStage(2);
        setStatusText("Binary packets are racing through the ship.");
        playPulse();
      }, 1340),
      window.setTimeout(() => {
        setExecutionStage(3);
        setStatusText("CPU core is processing the instruction.");
        playPulse();
      }, 1980),
      window.setTimeout(() => {
        setExecutionStage(4);
        setStatusText("Output screen is resolving the result.");
        playPulse();
      }, 2620),
    ];

    const resolutionTimer = window.setTimeout(() => {
      const isCorrect = runSnapshot.isMatch && !runSnapshot.error;
      setLastRunCorrect(isCorrect);

      if (isCorrect) {
        recordCorrect();
        playCorrect();
        if (comboRef.current + 1 > 1) playCombo(comboRef.current + 1);
        playComplete();
        setStatusText(mission.successLine);
        setSpaceEvent("success");
        setSpaceEventKey((current) => current + 1);

        const container = containerRef.current;
        if (container) {
          burst({
            x: container.clientWidth * 0.72,
            y: container.clientHeight * 0.28,
            count: 26,
            spread: 120,
            color: accent,
            size: 8,
          });
        }

        window.setTimeout(() => {
          if (round === missions.length - 1) {
            setPhase("complete");
            setStatusText("Cockpit command loop restored.");
            return;
          }

          const nextRound = round + 1;
          const nextMission = missions[nextRound];
          setRound(nextRound);
          setCode("");
          setRunSnapshot(null);
          setExecutionStage(-1);
          setPhase("select");
          setTypedSource("");
          setTypedOutput("");
          setLastRunCorrect(null);
          setSpaceEvent(null);
          setStatusText(nextMission.introLine);
        }, 1400);

        return;
      }

      recordWrong();
      playWrong();
      setPhase("select");
      setExecutionStage(-1);
      setSpaceEvent("error");
      setSpaceEventKey((current) => current + 1);
      setStatusText(
        runSnapshot.error
          ? runSnapshot.error
          : `Output ${runSnapshot.output || "NONE"} missed the target ${mission.targetOutput}.`,
      );
      setRunSnapshot(null);
    }, 3580);

    return () => {
      stageTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(resolutionTimer);
    };
  }, [
    accent,
    burst,
    containerRef,
    mission.successLine,
    mission.targetOutput,
    missions,
    phase,
    playCombo,
    playComplete,
    playCorrect,
    playPulse,
    playWrong,
    recordCorrect,
    recordWrong,
    round,
    runSnapshot,
  ]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  function triggerTypingFeedback() {
    setTypingPulse((current) => current + 1);
    setTypingActive(true);
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = window.setTimeout(() => {
      setTypingActive(false);
    }, 180);
  }

  function focusTerminal() {
    textareaRef.current?.focus();
  }

  function setCodeValue(nextCode: string, nextCursor?: number) {
    setCode(nextCode);
    setLastRunCorrect(null);
    if (spaceEvent === "error") {
      setSpaceEvent(null);
    }
    triggerTypingFeedback();

    if (typeof nextCursor === "number") {
      window.requestAnimationFrame(() => {
        focusTerminal();
        textareaRef.current?.setSelectionRange(nextCursor, nextCursor);
      });
    }
  }

  function insertTextAtCursor(text: string) {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? code.length;
    const end = textarea?.selectionEnd ?? code.length;
    const nextCode = `${code.slice(0, start)}${text}${code.slice(end)}`;
    setCodeValue(nextCode, start + text.length);
  }

  function deleteAtCursor() {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? code.length;
    const end = textarea?.selectionEnd ?? code.length;

    if (start === 0 && end === 0) return;

    if (start !== end) {
      const nextCode = `${code.slice(0, start)}${code.slice(end)}`;
      setCodeValue(nextCode, start);
      return;
    }

    const nextCode = `${code.slice(0, start - 1)}${code.slice(end)}`;
    setCodeValue(nextCode, start - 1);
  }

  function flashKey(label: string) {
    setActiveKey(label);
    window.setTimeout(() => {
      setActiveKey((current) => (current === label ? null : current));
    }, 120);
  }

  function handleVirtualKey(key: KeyboardKey) {
    if (phase !== "select") return;

    flashKey(key.label);
    playTap();
    focusTerminal();

    if (key.value === "ENTER") {
      handleExecute();
      return;
    }

    if (key.value === "BACKSPACE") {
      deleteAtCursor();
      return;
    }

    if (key.value === "SPACE") {
      insertTextAtCursor(" ");
      return;
    }

    if (key.value === "LINE") {
      insertTextAtCursor("\n");
      return;
    }

    if (key.value === "TAB") {
      insertTextAtCursor("  ");
      return;
    }

    insertTextAtCursor(key.value);
  }

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (phase !== "select") {
      event.preventDefault();
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      flashKey("Tab");
      insertTextAtCursor("  ");
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      flashKey("Enter");
      handleExecute();
      return;
    }

    if (event.key === "Backspace") {
      flashKey("⌫");
      return;
    }

    if (event.key === " ") {
      flashKey("Space");
      return;
    }

    if (event.key.length === 1) {
      flashKey(event.key);
    }
  }

  function handleExecute() {
    if (phase !== "select" || !code.trim()) return;

    const snapshot: RunSnapshot = {
      ...analysis,
      source: code,
      executionOutput: analysis.error ? "ERROR" : analysis.output || "NO OUTPUT",
    };

    setRunSnapshot(snapshot);
    setPhase("executing");
    setExecutionStage(-1);
    setTypedSource("");
    setTypedOutput("");
    setLastRunCorrect(null);
    setSpaceEvent("warp");
    setSpaceEventKey((current) => current + 1);
    setStatusText("Execution burst engaged.");
    playPulse();
  }

  const footer =
    phase === "complete" ? (
      <button className="game-btn" style={{ background: accent }} onClick={onComplete} type="button">
        Open Next Room
      </button>
    ) : null;

  return (
    <GameScene
      accent={accent}
      header={{ room: "Terminal Tower", step: `Script ${round + 1} of ${missions.length}` }}
      missionTitle="Code Terminal"
      missionObjective={mission.objective}
      stability={{ stability, combo }}
      footer={footer}
    >
      <div
        ref={containerRef}
        className={`terminal-room terminal-room-cockpit-mode terminal-room-${cockpitState}${
          phase === "executing" ? " terminal-room-executing" : ""
        }${lastRunCorrect === true ? " terminal-room-success" : lastRunCorrect === false ? " terminal-room-error" : ""}`}
      >
        <div className="terminal-cockpit-backdrop" aria-hidden="true">
          <div className="terminal-cockpit-space">
            <div className="terminal-cockpit-nebula terminal-cockpit-nebula-a" />
            <div className="terminal-cockpit-nebula terminal-cockpit-nebula-b" />
            <div className="terminal-cockpit-nebula terminal-cockpit-nebula-c" />

            <div className="terminal-cockpit-planets">
              <div className="terminal-cockpit-planet terminal-cockpit-planet-far" />
              <div className="terminal-cockpit-planet terminal-cockpit-planet-mid" />
              <div className="terminal-cockpit-planet terminal-cockpit-planet-near" />
            </div>

            <div className="terminal-cockpit-stars">
              {COCKPIT_STARS.map((star, index) => (
                <span
                  key={`terminal-star-${index}`}
                  className={`terminal-cockpit-star terminal-cockpit-star-${star.depth}`}
                  style={
                    {
                      left: star.x,
                      top: star.y,
                      "--star-size": `${star.size}px`,
                      "--star-opacity": star.opacity,
                      "--star-delay": star.delay,
                      "--star-duration": star.duration,
                    } as CSSProperties
                  }
                />
              ))}
            </div>

            <div className="terminal-cockpit-signals">
              {COCKPIT_SIGNALS.map((signal, index) => (
                <span
                  key={`terminal-signal-${index}`}
                  className="terminal-cockpit-signal"
                  style={
                    {
                      left: signal.x,
                      top: signal.y,
                      "--signal-size": `${signal.size}px`,
                      "--signal-delay": signal.delay,
                      "--signal-color": signal.color,
                    } as CSSProperties
                  }
                />
              ))}
            </div>

            {spaceEvent && (
              <div
                key={`${spaceEvent}-${spaceEventKey}`}
                className={`terminal-cockpit-burst terminal-cockpit-burst-${spaceEvent}`}
              />
            )}
          </div>

          <div className="terminal-cockpit-frame">
            <div className="terminal-cockpit-trim terminal-cockpit-trim-top" />
            <div className="terminal-cockpit-trim terminal-cockpit-trim-bottom" />
            <div className="terminal-cockpit-trim terminal-cockpit-trim-left" />
            <div className="terminal-cockpit-trim terminal-cockpit-trim-right" />
            <div className="terminal-cockpit-glass terminal-cockpit-glass-left" />
            <div className="terminal-cockpit-glass terminal-cockpit-glass-right" />
            <span className="terminal-cockpit-label terminal-cockpit-label-left">NAV LINK</span>
            <span className="terminal-cockpit-label terminal-cockpit-label-right">CORE FEED</span>
            <span className="terminal-cockpit-label terminal-cockpit-label-bottom">COCKPIT WINDOW</span>
          </div>
        </div>

        <div className="terminal-cockpit-scene">
          <div className="terminal-live-hud">
            <div className="terminal-live-hud-prompt">
              <span className="terminal-live-hud-kicker">Try this pattern</span>
              <code className="terminal-live-example">{mission.example.replace(/^Try\s+/i, "")}</code>
            </div>

            <div className="terminal-live-hud-chips">
              <span className="terminal-live-chip terminal-live-chip-target">Target {mission.targetOutput}</span>
              <span
                className={`terminal-live-chip ${
                  runReady
                    ? "terminal-live-chip-match"
                    : analysis.error
                    ? "terminal-live-chip-error"
                    : "terminal-live-chip-neutral"
                }`}
              >
                {runReady
                  ? "Correct code. Press Enter."
                  : analysis.error
                  ? "Fix the code"
                  : `Output ${analysis.output || "..."}`}
              </span>
              <span className="terminal-live-chip terminal-live-chip-keyhint">Shift+Enter for new line</span>
            </div>
          </div>

          <div className="terminal-live-deck">
            <div className="terminal-token-orbit">
              <span className="terminal-system-label terminal-system-label-tokens">Tokens</span>
              <div className="terminal-token-cluster">
                {displayState.tokens.length > 0 ? (
                  displayState.tokens.slice(0, 10).map((token, index) => (
                    <span
                      key={`${token.value}-${index}-${phase === "select" ? typingPulse : executionStage}`}
                      className={`terminal-token-chip terminal-token-chip-${token.kind}${
                        tokensActive ? " terminal-token-chip-live" : ""
                      }`}
                      style={
                        {
                          "--token-color": token.color,
                          animationDelay: `${index * 70}ms`,
                        } as CSSProperties
                      }
                    >
                      {token.value}
                    </span>
                  ))
                ) : (
                  <span className="terminal-token-chip terminal-token-chip-placeholder">Tokens wake as you type.</span>
                )}
              </div>
            </div>

            <div className="terminal-binary-stream terminal-binary-stream-left">
              <span className="terminal-system-label terminal-system-label-binary">Binary</span>
              <div className="terminal-binary-lane">
                  {leftLanePackets.map((packet, index) => (
                    <span
                      key={`${packet.bits}-${index}-${phase === "select" ? typingPulse : executionStage}`}
                    className={`terminal-binary-cell${binaryActive ? " terminal-binary-cell-live" : ""}`}
                    style={
                      {
                        "--binary-color": packet.color,
                        animationDelay: `${index * 90}ms`,
                      } as CSSProperties
                    }
                  >
                    {packet.bits}
                  </span>
                ))}
              </div>
            </div>

            <div className="terminal-center-stack">
              <div className="terminal-terminal-shell">
                <div className="terminal-terminal-topbar">
                  <span>Ship Terminal</span>
                  <span>{phase === "executing" ? "Execution lock" : runReady ? "Ready to run" : "Live parse"}</span>
                </div>
                <div className={`terminal-terminal-core${sourceActive ? " terminal-terminal-core-live" : ""}`}>
                  {phase === "select" && (
                    <div
                      className={`terminal-terminal-lock${
                        runReady
                          ? " terminal-terminal-lock-ready"
                          : analysis.error
                          ? " terminal-terminal-lock-error"
                          : ""
                      }`}
                    >
                      {runReady ? "Target matched" : analysis.error ? "Parser unstable" : statusText}
                    </div>
                  )}
                  <textarea
                    ref={textareaRef}
                    className="terminal-terminal-input"
                    value={phase === "executing" ? typedSource : code}
                    onChange={(event) => {
                      if (phase !== "select") return;
                      setCodeValue(event.target.value);
                    }}
                    onKeyDown={handleTextareaKeyDown}
                    placeholder={`// ${mission.example}`}
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="none"
                    readOnly={phase !== "select"}
                    aria-label="Ship coding terminal"
                  />
                  {phase === "executing" && executionStage === 0 && typedSource.length < (runSnapshot?.source.length ?? 0) && (
                    <span className="terminal-terminal-cursor">▌</span>
                  )}
                </div>
                <div className="terminal-terminal-footer">
                  <span>Parser {analysis.error ? "unstable" : "synced"}</span>
                  <span>{displayState.tokens.length} tokens</span>
                </div>
              </div>

              <div className="terminal-output-console">
                <div className="terminal-output-console-head">
                  <span className="terminal-system-label terminal-system-label-output">Output</span>
                  <span>
                    {analysis.error
                      ? "Signal fault"
                      : runReady
                      ? "Target matched"
                      : outputDisplay === "STANDBY"
                      ? "Waiting"
                      : "Live"}
                  </span>
                </div>
                <div
                  className={`terminal-output-console-screen${analysis.error ? " terminal-output-console-screen-error" : ""}${
                    outputActive ? " terminal-output-console-screen-live" : ""
                  }${runReady ? " terminal-output-console-screen-match" : ""}`}
                >
                  <div className="terminal-output-console-scanlines" />
                  <span className="terminal-output-console-text">{outputDisplay}</span>
                </div>
              </div>
            </div>

            <div className="terminal-right-stack">
              <div className="terminal-binary-stream terminal-binary-stream-right">
                <span className="terminal-system-label terminal-system-label-binary">Pulse lane</span>
                <div className="terminal-binary-lane terminal-binary-lane-right">
                  {pulseLanePackets.length > 0 ? pulseLanePackets.map((packet, index) => (
                    <span
                      key={`${packet.bits}-right-${index}-${phase === "select" ? typingPulse : executionStage}`}
                      className={`terminal-binary-cell${binaryActive ? " terminal-binary-cell-live" : ""}`}
                      style={
                        {
                          "--binary-color": packet.color,
                          animationDelay: `${(index + 1) * 90}ms`,
                        } as CSSProperties
                      }
                    >
                      {packet.bits}
                    </span>
                  )) : (
                    <span className="terminal-binary-cell terminal-binary-cell-placeholder">More pulses appear as code grows.</span>
                  )}
                </div>
              </div>

              <div className="terminal-live-cpu">
                <span className="terminal-system-label terminal-system-label-cpu">CPU Core</span>
                <div className={`terminal-live-cpu-shell${cpuActive ? " terminal-live-cpu-shell-live" : ""}`}>
                  <div className="terminal-live-cpu-ring terminal-live-cpu-ring-outer" />
                  <div className="terminal-live-cpu-ring terminal-live-cpu-ring-mid" />
                  <div className="terminal-live-cpu-ring terminal-live-cpu-ring-inner" />
                  <div className="terminal-live-cpu-core">
                    <span>CPU</span>
                  </div>
                </div>
                <div className="terminal-live-cpu-status">
                  {analysis.error ? "Instability detected" : phase === "executing" ? "Processing burst" : "Listening to source"}
                </div>
              </div>
            </div>
          </div>

          <div className={`terminal-virtual-keyboard${phase === "executing" ? " terminal-virtual-keyboard-locked" : ""}`}>
            {VIRTUAL_KEYBOARD.map((row, rowIndex) => (
              <div key={`vk-row-${rowIndex}`} className="terminal-keyboard-row">
                {row.map((key) => (
                  <button
                    key={key.label}
                    type="button"
                    className={`terminal-key terminal-key-${key.width ?? "normal"}${
                      activeKey === key.label ? " terminal-key-active" : ""
                    }${key.accent ? ` terminal-key-${key.accent}` : ""}${
                      key.value === "ENTER" && runReady ? " terminal-key-ready" : ""
                    }`}
                    onClick={() => handleVirtualKey(key)}
                    disabled={phase !== "select"}
                  >
                    <span>{key.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </GameScene>
  );
}

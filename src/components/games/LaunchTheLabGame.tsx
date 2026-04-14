"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import GameScene from "@/components/game/GameScene";
import { useGameMeta } from "@/lib/game/use-game-meta";
import { useParticles } from "@/lib/game/use-particles";
import { useSound } from "@/lib/game/use-sound";
import { useUser } from "@/lib/store";

interface Props {
  onComplete: () => void;
  accent: string;
}

interface QuizQuestion {
  id: string;
  concept: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  successLine: string;
  clue: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "byte-size",
    concept: "Byte",
    prompt: "How many bits make one byte?",
    options: ["2 bits", "4 bits", "8 bits", "16 bits"],
    correctIndex: 2,
    successLine: "Right. One byte is 8 bits working together.",
    clue: "A byte is a full pack of 8 bit slots.",
  },
  {
    id: "cpu-role",
    concept: "CPU",
    prompt: "Which part of the computer runs instructions?",
    options: ["CPU", "Storage vault", "Speaker", "Keyboard"],
    correctIndex: 0,
    successLine: "Yes. The CPU is the part that processes instructions.",
    clue: "Think: the brain that follows the code.",
  },
  {
    id: "ram-role",
    concept: "RAM",
    prompt: "Where should live data go while the machine is running?",
    options: ["Storage", "RAM", "Screen", "Mouse"],
    correctIndex: 1,
    successLine: "Correct. RAM is for what the computer is using right now.",
    clue: "This memory is fast and temporary.",
  },
  {
    id: "storage-role",
    concept: "Storage",
    prompt: "What keeps files after the power turns off?",
    options: ["RAM", "CPU", "Storage", "Output"],
    correctIndex: 2,
    successLine: "Exactly. Storage keeps data for later.",
    clue: "It stays even when the machine shuts down.",
  },
  {
    id: "binary-language",
    concept: "Binary",
    prompt: "Which number system uses only 0 and 1?",
    options: ["Decimal", "Binary", "Alphabetic", "Pixel"],
    correctIndex: 1,
    successLine: "Right. Binary is built from only 0 and 1.",
    clue: "Computers love simple on and off signals.",
  },
  {
    id: "ipo-order",
    concept: "Input -> Process -> Output",
    prompt: "What is the correct computer flow?",
    options: [
      "Process -> Output -> Input",
      "Input -> Process -> Output",
      "Output -> Input -> Process",
      "Input -> Output -> Process",
    ],
    correctIndex: 1,
    successLine: "Perfect. Input comes first, then processing, then output.",
    clue: "The computer gets something, works on it, then shows a result.",
  },
  {
    id: "precision",
    concept: "Precision",
    prompt: "Why do programs need precise instructions?",
    options: [
      "Computers guess the missing parts",
      "Computers follow instructions exactly",
      "Computers only read pictures",
      "Computers ignore small details",
    ],
    correctIndex: 1,
    successLine: "Yes. Computers do exactly what the code says.",
    clue: "Literal machines are not great at guessing.",
  },
  {
    id: "output-example",
    concept: "Output",
    prompt: "Which choice is an output?",
    options: ["Typing on a keyboard", "Clicking a mouse", "A message showing on screen", "Saving to RAM"],
    correctIndex: 2,
    successLine: "Correct. Output is the result the user can notice.",
    clue: "Think about what the computer shows back to you.",
  },
  {
    id: "code-run",
    concept: "Code Execution",
    prompt: 'What does `print("HELLO")` do?',
    options: [
      "Stores HELLO forever",
      "Deletes the text",
      "Shows HELLO as output",
      "Turns HELLO into RAM",
    ],
    correctIndex: 2,
    successLine: "Exactly. It sends HELLO to the output channel.",
    clue: "The command is about showing something, not storing it.",
  },
];

export default function LaunchTheLabGame({ onComplete, accent }: Props) {
  const { userName } = useUser();
  const { playTap, playCorrect, playWrong, playCombo, playComplete } = useSound();
  const { containerRef, burst } = useParticles();
  const { stability, combo, recordCorrect, recordWrong } = useGameMeta(QUIZ_QUESTIONS.length);
  const comboRef = useRef(combo);
  const timersRef = useRef<number[]>([]);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<"playing" | "transition" | "complete">("playing");
  const [statusText, setStatusText] = useState("Answer each recap card to reboot the lab from memory.");
  const [score, setScore] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [lastResult, setLastResult] = useState<"correct" | "wrong" | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const question = QUIZ_QUESTIONS[questionIndex];
  const progressPercent = ((questionIndex + (phase === "complete" ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100;
  const playerName = userName || "Engineer";
  const mastery = useMemo(() => Math.round((score / QUIZ_QUESTIONS.length) * 100), [score]);

  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  function clearTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }

  function celebrateQuestion() {
    const container = containerRef.current;
    if (!container) return;

    burst({
      x: container.clientWidth * 0.5,
      y: container.clientHeight * 0.28,
      color: accent,
      count: 22,
      spread: 130,
      size: 8,
    });
  }

  function moveToNextQuestion() {
    clearTimers();

    if (questionIndex === QUIZ_QUESTIONS.length - 1) {
      setPhase("complete");
      setStatusText(`Recap complete. ${playerName} rebooted the lab from memory.`);
      return;
    }

    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);
    setSelectedIndex(null);
    setDisabledOptions([]);
    setLastResult(null);
    setPhase("playing");
    setStatusText(QUIZ_QUESTIONS[nextIndex].clue);
  }

  function handleOptionSelect(optionIndex: number) {
    if (phase !== "playing" || disabledOptions.includes(optionIndex)) return;

    playTap();
    setSelectedIndex(optionIndex);

    if (optionIndex === question.correctIndex) {
      setLastResult("correct");
      setPhase("transition");
      setScore((current) => current + 1);
      setCompletedIds((current) => [...current, question.id]);
      setStatusText(question.successLine);
      recordCorrect();
      playCorrect();
      if (comboRef.current + 1 > 1) playCombo(comboRef.current + 1);
      if (questionIndex === QUIZ_QUESTIONS.length - 1) {
        playComplete();
      }
      celebrateQuestion();

      timersRef.current.push(window.setTimeout(moveToNextQuestion, 1050));
      return;
    }

    setLastResult("wrong");
    setDisabledOptions((current) => [...current, optionIndex]);
    setStatusText(question.clue);
    recordWrong();
    playWrong();
  }

  const footer =
    phase === "complete" ? (
      <button className="game-btn" style={{ background: accent }} onClick={onComplete} type="button">
        Finish Week Room
      </button>
    ) : null;

  return (
    <GameScene
      layout="birdseye"
      accent={accent}
      header={{ room: "The Core", step: `Recap ${Math.min(questionIndex + 1, QUIZ_QUESTIONS.length)} of ${QUIZ_QUESTIONS.length}` }}
      missionTitle="Launch the Lab"
      missionObjective="Answer the Week 1 recap cards and prove you remember how the machine works."
      subtitle="A fast Duolingo-style check on bits, bytes, CPU, RAM, storage, binary, flow, and precision."
      stability={{ stability, combo }}
      controls={
        <div className="recap-panel">
          <div className="recap-card">
            <span className="recap-kicker">Mission Score</span>
            <strong>{score} / {QUIZ_QUESTIONS.length}</strong>
            <p>{phase === "complete" ? "Week 1 recap fully cleared." : "Each correct card reboots another concept in the lab."}</p>
            <div className="recap-progress-row">
              <div className="recap-progress-bar" aria-hidden="true">
                <span style={{ width: `${progressPercent}%`, background: accent }} />
              </div>
              <span>{questionIndex + (phase === "complete" ? 1 : 0)} / {QUIZ_QUESTIONS.length} cards cleared</span>
            </div>
          </div>

          <div className="recap-card">
            <div className="recap-status-header">
              <span className="recap-kicker">Concept Grid</span>
              <span>{mastery}% mastery</span>
            </div>
            <div className="recap-topic-list">
              {QUIZ_QUESTIONS.map((item, index) => {
                const complete = completedIds.includes(item.id);
                const active = phase !== "complete" && index === questionIndex;

                return (
                  <div
                    key={item.id}
                    className={`recap-topic-item${complete ? " recap-topic-item-complete" : ""}${
                      active ? " recap-topic-item-active" : ""
                    }`}
                  >
                    <span className="recap-topic-index">{index + 1}</span>
                    <span className="recap-topic-copy">
                      <strong>{item.concept}</strong>
                      <small>{complete ? "Locked in" : active ? "Current card" : "Queued"}</small>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="recap-card">
            <span className="recap-kicker">Live Readout</span>
            <strong>{lastResult === "correct" ? "Correct" : lastResult === "wrong" ? "Try again" : "Pick an answer"}</strong>
            <p>{statusText}</p>
          </div>
        </div>
      }
      footer={footer}
    >
      <div
        ref={containerRef}
        className={`recap-lab${lastResult === "correct" ? " recap-lab-correct" : ""}${
          lastResult === "wrong" ? " recap-lab-wrong" : ""
        }${phase === "complete" ? " recap-lab-complete" : ""}`}
        style={{ "--game-accent": accent } as CSSProperties}
      >
        <div className="recap-lab-grid" aria-hidden="true" />
        <div className="recap-orbit recap-orbit-one" aria-hidden="true" />
        <div className="recap-orbit recap-orbit-two" aria-hidden="true" />
        <div className="recap-core" aria-hidden="true">
          <div className="recap-core-ring recap-core-ring-outer" />
          <div className="recap-core-ring recap-core-ring-inner" />
          <div className="recap-core-heart">
            <span>W1</span>
            <small>{phase === "complete" ? "ONLINE" : "RECAP"}</small>
          </div>
        </div>

        <section className="recap-question-card">
          <div className="recap-question-head">
            <span className="recap-question-kicker">{question.concept}</span>
            <span className={`recap-question-state${
              lastResult === "correct"
                ? " recap-question-state-correct"
                : lastResult === "wrong"
                ? " recap-question-state-wrong"
                : ""
            }`}>
              {phase === "complete"
                ? "Week complete"
                : lastResult === "correct"
                ? "Correct"
                : lastResult === "wrong"
                ? "Check the clue"
                : `Card ${questionIndex + 1}`}
            </span>
          </div>

          <h3>{phase === "complete" ? `${playerName}, the lab is online.` : question.prompt}</h3>
          <p className="recap-question-copy">
            {phase === "complete"
              ? `You cleared ${score} out of ${QUIZ_QUESTIONS.length} recap cards and rebooted the whole week.`
              : statusText}
          </p>

          {phase !== "complete" && (
            <div className="recap-options-grid">
              {question.options.map((option, index) => {
                const isSelected = selectedIndex === index;
                const isCorrect = index === question.correctIndex;
                const isDisabled = disabledOptions.includes(index) || phase === "transition";

                return (
                  <button
                    key={`${question.id}-${option}`}
                    type="button"
                    className={`recap-option${
                      isSelected ? " recap-option-selected" : ""
                    }${lastResult === "correct" && isCorrect ? " recap-option-correct" : ""}${
                      lastResult === "wrong" && isSelected ? " recap-option-wrong" : ""
                    }`}
                    onClick={() => handleOptionSelect(index)}
                    disabled={isDisabled}
                  >
                    <span className="recap-option-index">{String.fromCharCode(65 + index)}</span>
                    <span className="recap-option-text">{option}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="recap-footer-strip">
            <span>{phase === "complete" ? "Mastery check complete" : question.clue}</span>
            <span>{combo} combo</span>
          </div>
        </section>
      </div>
    </GameScene>
  );
}

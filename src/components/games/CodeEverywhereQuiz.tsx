"use client";

import { useState, useMemo, useCallback } from "react";

interface Props {
  onComplete: () => void;
  accent: string;
}

interface Question {
  item: string;
  icon: string;
  answer: "code" | "not-code";
  explanation: string;
}

const QUESTIONS: Question[] = [
  { item: "Instagram", icon: "📷", answer: "code", explanation: "Instagram is an app built by thousands of developers writing code in Python, Java, Swift, and more." },
  { item: "A calculator app", icon: "🔢", answer: "code", explanation: "Even a simple calculator is a program — someone wrote code to handle every button press and calculation." },
  { item: "A wooden chair", icon: "🪑", answer: "not-code", explanation: "A chair is a physical object. No code involved — just wood, screws, and craftsmanship." },
  { item: "Google Search", icon: "🔍", answer: "code", explanation: "Google Search runs on millions of lines of code that crawl the web, index pages, and rank results." },
  { item: "A printed book", icon: "📖", answer: "not-code", explanation: "A physical book is ink on paper. But the software used to design and print it? That was code!" },
  { item: "Minecraft", icon: "🎮", answer: "code", explanation: "Minecraft is written in Java (and C++ for Bedrock). Every block, mob, and crafting recipe is defined in code." },
  { item: "A traffic light", icon: "🚦", answer: "code", explanation: "Modern traffic lights are controlled by embedded software that decides when to change based on timing or sensors." },
  { item: "A pencil", icon: "✏️", answer: "not-code", explanation: "A pencil is just graphite and wood. No computer needed!" },
  { item: "Spotify", icon: "🎵", answer: "code", explanation: "Spotify's apps, recommendation engine, and streaming servers are all built with code." },
  { item: "Your operating system", icon: "💻", answer: "code", explanation: "Windows, macOS, Linux — they're all giant programs. macOS alone has tens of millions of lines of code." },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CodeEverywhereQuiz({ onComplete, accent }: Props) {
  const questions = useMemo(() => shuffle(QUESTIONS).slice(0, 7), []);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [done, setDone] = useState(false);

  const q = questions[current];

  const handleAnswer = useCallback(
    (answer: "code" | "not-code") => {
      if (feedback) return; // prevent double-tap
      const correct = answer === q.answer;
      if (correct) setScore((s) => s + 1);
      setFeedback({ correct, explanation: q.explanation });

      setTimeout(() => {
        setFeedback(null);
        if (current + 1 < questions.length) {
          setCurrent((c) => c + 1);
        } else {
          setDone(true);
        }
      }, 2200);
    },
    [feedback, q, current, questions.length]
  );

  if (done) {
    return (
      <div className="game-container">
        <div className="ceq-done">
          <div className="ceq-score-display">
            {score}/{questions.length}
          </div>
          <h3>Code is everywhere!</h3>
          <p>
            Every app, website, and game was built by someone writing code. The
            CPU runs it, the browser displays it, and now you understand the
            connection between coding and computers.
          </p>
          <button
            className="ceq-finish-btn"
            style={{ background: accent }}
            onClick={onComplete}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <p className="game-instruction">
        Question {current + 1} of {questions.length}
      </p>
      <p className="ceq-prompt">IS THIS MADE WITH CODE?</p>

      <div className="ceq-item-card">
        <span className="ceq-item-icon">{q.icon}</span>
        <span className="ceq-item-name">{q.item}</span>
      </div>

      {feedback && (
        <div className={`ceq-feedback ${feedback.correct ? "ceq-correct" : "ceq-wrong"}`}>
          <strong>{feedback.correct ? "✓ Correct!" : "✗ Not quite!"}</strong>
          <p>{feedback.explanation}</p>
        </div>
      )}

      {!feedback && (
        <div className="ceq-buttons">
          <button
            className="ceq-btn ceq-btn-yes"
            style={{ borderColor: accent }}
            onClick={() => handleAnswer("code")}
          >
            💻 Yes, it&apos;s code
          </button>
          <button
            className="ceq-btn ceq-btn-no"
            onClick={() => handleAnswer("not-code")}
          >
            🚫 No code involved
          </button>
        </div>
      )}

      <div className="ceq-score-bar">
        Score: <strong>{score}</strong>
      </div>
    </div>
  );
}

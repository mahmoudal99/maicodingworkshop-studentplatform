"use client";

import Link from "next/link";
import type { WeekData } from "@/lib/data";
import { useUser } from "@/lib/store";
import { useProgress } from "@/lib/progress";

interface Props {
  week: WeekData;
  index: number;
}

function ProgressRing({
  percent,
  accent,
}: {
  percent: number;
  accent: string;
}) {
  const radius = 14;
  const stroke = 3;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const isComplete = percent === 100;

  return (
    <div className="progress-ring">
      <svg width="36" height="36" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 18 18)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        {isComplete ? (
          <text
            x="18"
            y="19"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={accent}
            fontSize="14"
          >
            {"\u2713"}
          </text>
        ) : (
          <text
            x="18"
            y="19"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--muted2)"
            fontSize="9"
            fontFamily="var(--mono)"
            fontWeight="700"
          >
            {percent}%
          </text>
        )}
      </svg>
    </div>
  );
}

export default function WeekCard({ week, index }: Props) {
  const { versionKey } = useUser();
  const { getWeekProgress } = useProgress();
  const { percent } = getWeekProgress(versionKey, index);

  return (
    <Link
      href={`/week/${index}`}
      className="week-card"
      style={
        {
          "--card-accent": week.accent,
        } as React.CSSProperties
      }
    >
      <ProgressRing percent={percent} accent={week.accent} />
      <div className="week-num" style={{ color: week.accent }}>
        {week.label}
      </div>
      <h3>{week.title}</h3>
      <p>{week.sub}</p>
      <div className="week-tags">
        {week.tags.map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>
    </Link>
  );
}

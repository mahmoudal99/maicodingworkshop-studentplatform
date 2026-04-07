import Link from "next/link";
import type { WeekData } from "@/lib/data";

interface Props {
  week: WeekData;
  index: number;
}

export default function WeekCard({ week, index }: Props) {
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

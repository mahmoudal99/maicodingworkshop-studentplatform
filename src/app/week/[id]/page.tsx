"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/lib/store";
import { useProgress } from "@/lib/progress";
import { WEEKS_A, WEEKS_B, GLOSSARY } from "@/lib/data";
import type { GlossaryEntry } from "@/lib/data";
import Navbar from "@/components/Navbar";
import Accordion from "@/components/Accordion";
import BinaryWidget from "@/components/BinaryWidget";
import GlossaryModal from "@/components/GlossaryModal";
import WeekSvg from "@/components/WeekSvg";
import RevealOnScroll from "@/components/RevealOnScroll";

function XpPopup({ show }: { show: boolean }) {
  if (!show) return null;
  return <span className="xp-popup">+10 XP</span>;
}

function ActivityItem({
  item,
  itemKey,
}: {
  item: string;
  itemKey: string;
}) {
  const { toggle, isCompleted } = useProgress();
  const checked = isCompleted(itemKey);
  const [showXp, setShowXp] = useState(false);

  const handleClick = useCallback(() => {
    if (!checked) {
      setShowXp(true);
      setTimeout(() => setShowXp(false), 800);
    }
    toggle(itemKey);
  }, [checked, itemKey, toggle]);

  return (
    <li className={`activity-item${checked ? " completed" : ""}`}>
      <button
        className={`activity-check${checked ? " checked" : ""}`}
        onClick={handleClick}
        aria-label={checked ? `Unmark: ${item}` : `Complete: ${item}`}
        type="button"
      >
        {checked ? "\u2713" : ""}
      </button>
      <span className="activity-item-text">{item}</span>
      <XpPopup show={showXp} />
    </li>
  );
}

function OutcomeItem({
  outcome,
  itemKey,
}: {
  outcome: string;
  itemKey: string;
}) {
  const { toggle, isCompleted } = useProgress();
  const checked = isCompleted(itemKey);
  const [showXp, setShowXp] = useState(false);

  const handleClick = useCallback(() => {
    if (!checked) {
      setShowXp(true);
      setTimeout(() => setShowXp(false), 800);
    }
    toggle(itemKey);
  }, [checked, itemKey, toggle]);

  return (
    <li className={`outcome-item${checked ? " completed" : ""}`}>
      <button
        className={`outcome-check${checked ? " checked" : ""}`}
        onClick={handleClick}
        aria-label={
          checked
            ? `Unmark outcome: ${outcome}`
            : `Mark outcome done: ${outcome}`
        }
        type="button"
      >
        {checked ? "\u2713" : ""}
      </button>
      <span>{outcome}</span>
      {showXp && <span className="xp-popup">+5 XP</span>}
    </li>
  );
}

function SectionProgress({
  versionKey,
  weekIndex,
  sectionIndex,
  total,
}: {
  versionKey: string;
  weekIndex: number;
  sectionIndex: number;
  total: number;
}) {
  const { completed } = useProgress();
  let done = 0;
  for (let i = 0; i < total; i++) {
    const key = `${versionKey}-${weekIndex}-${sectionIndex}-${i}`;
    if (completed[key]) done++;
  }
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="section-progress">
      <span className="section-progress-text">
        {done}/{total} completed
      </span>
      <div className="section-progress-track">
        <div
          className="section-progress-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function WeekDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { userName, versionKey } = useUser();
  const { getWeekProgress } = useProgress();
  const [modalTerm, setModalTerm] = useState<GlossaryEntry | null>(null);

  const id = Number(params.id);
  const weeks = versionKey === "A" ? WEEKS_A : WEEKS_B;
  const week = weeks[id];

  useEffect(() => {
    if (!userName) {
      router.replace("/");
    }
  }, [userName, router]);

  if (!userName || !week) return null;

  const weekProgress = getWeekProgress(versionKey, id);
  const isWeekComplete = weekProgress.total > 0 && weekProgress.percent === 100;

  const hasBinary =
    week.title.includes("How Computers Think") ||
    (week.keywords && week.keywords.includes("Binary"));

  const openModal = (term: string) => {
    const entry = GLOSSARY.find((g) => g.term === term);
    if (entry) setModalTerm(entry);
  };

  return (
    <>
      <Navbar />
      <div className="main-content page-enter">
        <Link href="/dashboard" className="back-btn">
          {"\u2190 Back to dashboard"}
        </Link>

        {/* Hero */}
        <div className="week-hero" data-week={week.num}>
          <div className="week-hero-text">
            <div className="week-hero-tag" style={{ color: week.accent }}>
              {week.label} {"\u2014"} Think Like a Programmer
            </div>
            <h2>{week.title}</h2>
            <p className="week-hero-sub">{week.sub}</p>
            <div className="milestone-bar">
              <strong>Milestone:</strong> {week.milestone}
            </div>

            {/* Week progress */}
            <div className="week-hero-progress">
              <div className="week-hero-progress-info">
                <span>
                  {weekProgress.done} of {weekProgress.total} activities
                  completed
                </span>
                {isWeekComplete && (
                  <span className="week-complete-badge">
                    {"\u2728"} Week Complete!
                  </span>
                )}
              </div>
              <div className="week-hero-progress-track">
                <div
                  className="week-hero-progress-fill"
                  style={{
                    width: `${weekProgress.percent}%`,
                    background: week.accent,
                  }}
                />
              </div>
            </div>
          </div>
          <WeekSvg
            weekNum={week.num}
            accent={week.accent}
            versionKey={versionKey}
          />
        </div>

        {/* Detail grid */}
        <div className="detail-grid">
          <div>
            {/* Overview accordion */}
            <RevealOnScroll>
              <Accordion title="Overview" icon={"\uD83D\uDCCC"} defaultOpen>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--muted2)",
                    paddingTop: "1rem",
                    lineHeight: "1.7",
                  }}
                >
                  {week.overview}
                </p>
              </Accordion>
            </RevealOnScroll>

            {/* Section accordions */}
            {week.sections.map((s, idx) => (
              <RevealOnScroll key={idx} delay={idx * 0.08}>
                <Accordion
                  title={s.title}
                  icon={s.icon}
                  defaultOpen
                  headerExtra={
                    <SectionProgress
                      versionKey={versionKey}
                      weekIndex={id}
                      sectionIndex={idx}
                      total={s.items.length}
                    />
                  }
                >
                  <ul className="activity-list">
                    {s.items.map((item, j) => (
                      <ActivityItem
                        key={j}
                        item={item}
                        itemKey={`${versionKey}-${id}-${idx}-${j}`}
                      />
                    ))}
                  </ul>
                </Accordion>
              </RevealOnScroll>
            ))}

            {/* Binary widget */}
            {hasBinary && (
              <RevealOnScroll>
                <BinaryWidget />
              </RevealOnScroll>
            )}

            {/* Pacing accordion */}
            <RevealOnScroll>
              <Accordion title="Pacing & differentiation" icon={"\u2696\uFE0F"}>
                <div className="diff-grid">
                  <div className="diff-col ahead">
                    <h5>{"If you're ahead"}</h5>
                    <ul>
                      {week.diff.ahead.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="diff-col behind">
                    <h5>If you need more time</h5>
                    <ul>
                      {week.diff.behind.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Accordion>
            </RevealOnScroll>

            {/* Note box */}
            {week.note && (
              <RevealOnScroll>
                <div className="note-box" style={{ marginTop: "1rem" }}>
                  {week.note}
                </div>
              </RevealOnScroll>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <RevealOnScroll>
              <div className="sidebar-card">
                <h4>By end of this week</h4>
                <ul className="outcomes-list">
                  {week.outcomes.map((o, i) => (
                    <OutcomeItem
                      key={i}
                      outcome={o}
                      itemKey={`${versionKey}-${id}-outcome-${i}`}
                    />
                  ))}
                </ul>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.1}>
              <div className="sidebar-card">
                <h4>{"Key concepts \u2014 click to define"}</h4>
                {week.keywords.map((k) => (
                  <span
                    key={k}
                    className="keyword-pill"
                    onClick={() => openModal(k)}
                    title="Click for definition"
                  >
                    # {k}
                  </span>
                ))}
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.2}>
              <div className="sidebar-card">
                <h4>Links for this week</h4>
                <ul className="links-list">
                  {week.links.map((l, i) => (
                    <li key={i}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer">
                        <span className="link-icon">{l.icon}</span>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>

      <GlossaryModal
        term={modalTerm}
        onClose={() => setModalTerm(null)}
      />
    </>
  );
}

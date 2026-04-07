"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/lib/store";
import { WEEKS_A, WEEKS_B, GLOSSARY } from "@/lib/data";
import type { GlossaryEntry } from "@/lib/data";
import Navbar from "@/components/Navbar";
import Accordion from "@/components/Accordion";
import BinaryWidget from "@/components/BinaryWidget";
import GlossaryModal from "@/components/GlossaryModal";
import WeekSvg from "@/components/WeekSvg";
import RevealOnScroll from "@/components/RevealOnScroll";

export default function WeekDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { userName, versionKey } = useUser();
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
                <Accordion title={s.title} icon={s.icon} defaultOpen>
                  <ul className="activity-list">
                    {s.items.map((item, j) => (
                      <li key={j}>
                        <span className="activity-arrow">{"\u2192"}</span>
                        <span>{item}</span>
                      </li>
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
                    <li key={i}>{o}</li>
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

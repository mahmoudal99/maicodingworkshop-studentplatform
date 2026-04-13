"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/lib/store";
import { useProgress } from "@/lib/progress";
import { useAdminUnlock } from "@/lib/admin-unlock";
import { WEEKS_A, WEEKS_B } from "@/lib/data";
import Navbar from "@/components/Navbar";
import WeekCard from "@/components/WeekCard";
import RevealOnScroll from "@/components/RevealOnScroll";

export default function DashboardPage() {
  const router = useRouter();
  const { userName, versionKey, loaded } = useUser();
  const { xp, getOverallProgress, getWeekProgress } = useProgress();
  const { isWeekAdminUnlocked, adminLoaded } = useAdminUnlock();
  const [typedName, setTypedName] = useState("");
  const [progressWidth, setProgressWidth] = useState("0%");
  const typingDone = useRef(false);

  const weeks = versionKey === "A" ? WEEKS_A : WEEKS_B;
  const overall = getOverallProgress(versionKey);
  const versionLabel =
    versionKey === "A"
      ? "Version A \u2014 foundations path"
      : "Version B \u2014 fast-start path";

  useEffect(() => {
    if (!loaded) return;
    if (!userName) {
      router.replace("/");
      return;
    }

    // Typing effect
    if (typingDone.current) {
      setTypedName(userName);
    } else {
      let i = 0;
      const timer = setInterval(() => {
        if (i < userName.length) {
          setTypedName(userName.slice(0, i + 1));
          i++;
        } else {
          clearInterval(timer);
          typingDone.current = true;
        }
      }, 70);
      return () => clearInterval(timer);
    }
  }, [userName, loaded, router]);

  // Animate progress bar
  useEffect(() => {
    const t = setTimeout(() => setProgressWidth(`${overall.percent}%`), 200);
    return () => clearTimeout(t);
  }, [overall.percent]);

  if (!loaded || !adminLoaded || !userName) return null;

  return (
    <>
      <Navbar />
      <div className="main-content page-enter">
        <div className="welcome-block">
          <div className="welcome-tag">{"// Welcome back"}</div>
          <h1 className="welcome-heading">
            Ready to build,{" "}
            <span className="name-highlight">{typedName}</span>
            <span className="cursor" />
          </h1>
          <p className="welcome-sub">
            Six weeks. One website. We{"'"}ll build it step by step.
          </p>
          <div className="version-badge">
            <span className="dot" />
            <span>{versionLabel}</span>
          </div>
          <div className="stats-row">
            <span className="stats-xp">{xp} XP earned</span>
            <span className="stats-sep">{"\u00B7"}</span>
            <span>{overall.done}/{overall.total} activities completed</span>
          </div>
          <div className="progress-container">
            <div className="progress-label">
              {`// Course progress \u2014 Week ${overall.currentWeek} of ${weeks.length}`}
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: progressWidth }}
              />
            </div>
          </div>
        </div>

        <div className="section-label">{"// Your weeks"}</div>
        <div className="week-grid">
          {weeks.map((w, i) => {
            const isLocked =
              !isWeekAdminUnlocked(i + 1) ||
              (i > 0 && getWeekProgress(versionKey, i - 1).percent < 100);
            return (
              <RevealOnScroll key={i} delay={i * 0.07}>
                <WeekCard week={w} index={i} locked={isLocked} />
              </RevealOnScroll>
            );
          })}
        </div>

        <div className="section-label">{"// Quick links"}</div>
        <div
          className="week-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          }}
        >
          <RevealOnScroll>
            <Link
              href="/glossary"
              className="week-card"
              style={{ "--card-accent": "var(--purple)" } as React.CSSProperties}
            >
              <div className="week-num" style={{ color: "var(--purple)" }}>
                {"// Glossary"}
              </div>
              <h3>Key Concepts</h3>
              <p>
                Definitions for every important term across all six weeks.
              </p>
            </Link>
          </RevealOnScroll>
          <RevealOnScroll delay={0.07}>
            <Link
              href="/resources"
              className="week-card"
              style={{ "--card-accent": "var(--blue)" } as React.CSSProperties}
            >
              <div className="week-num" style={{ color: "var(--blue)" }}>
                {"// After the course"}
              </div>
              <h3>What to Do Next</h3>
              <p>Free resources to help you keep learning after the course.</p>
            </Link>
          </RevealOnScroll>
        </div>
      </div>
    </>
  );
}

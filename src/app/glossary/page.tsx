"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/lib/store";
import { GLOSSARY } from "@/lib/data";
import type { GlossaryEntry } from "@/lib/data";
import Navbar from "@/components/Navbar";
import GlossaryModal from "@/components/GlossaryModal";
import RevealOnScroll from "@/components/RevealOnScroll";

const WEEK_FILTERS = ["All", "W1", "W2", "W3", "W4", "W5", "W6"];

export default function GlossaryPage() {
  const router = useRouter();
  const { userName } = useUser();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [modalTerm, setModalTerm] = useState<GlossaryEntry | null>(null);

  useEffect(() => {
    if (!userName) router.replace("/");
  }, [userName, router]);

  const filtered = useMemo(() => {
    return GLOSSARY.filter((g) => {
      const matchWeek =
        activeFilter === "All" || g.week.includes(activeFilter);
      const matchSearch =
        !search ||
        g.term.toLowerCase().includes(search.toLowerCase()) ||
        g.def.toLowerCase().includes(search.toLowerCase());
      return matchWeek && matchSearch;
    });
  }, [search, activeFilter]);

  if (!userName) return null;

  return (
    <>
      <Navbar />
      <div className="main-content page-enter">
        <Link href="/dashboard" className="back-btn">
          {"\u2190 Back to dashboard"}
        </Link>
        <div className="page-title">Glossary</div>
        <p className="page-sub">
          Every key concept from the course. Click any term for a full
          definition.
        </p>

        <div className="glossary-search">
          <span className="search-icon">{"\u2315"}</span>
          <input
            type="text"
            placeholder="Search terms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="glossary-filter">
          {WEEK_FILTERS.map((w) => (
            <button
              key={w}
              className={`filter-btn ${activeFilter === w ? "active" : ""}`}
              onClick={() => setActiveFilter(w)}
            >
              {w === "All" ? "All terms" : w}
            </button>
          ))}
        </div>

        <div className="glossary-grid">
          {filtered.length ? (
            filtered.map((g, i) => (
              <RevealOnScroll key={g.term} delay={(i % 6) * 0.05}>
                <div
                  className="glossary-item"
                  onClick={() => setModalTerm(g)}
                >
                  <div className="glossary-term">{g.term}</div>
                  <div className="glossary-week-tag">{g.week}</div>
                  <div className="glossary-def">
                    {g.def.length > 100
                      ? g.def.substring(0, 100) + "\u2026"
                      : g.def}
                  </div>
                </div>
              </RevealOnScroll>
            ))
          ) : (
            <p style={{ color: "var(--muted2)", fontSize: "14px" }}>
              No terms match your search.
            </p>
          )}
        </div>
      </div>

      <GlossaryModal
        term={modalTerm}
        onClose={() => setModalTerm(null)}
      />
    </>
  );
}

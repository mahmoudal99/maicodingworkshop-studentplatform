"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/lib/store";
import { RESOURCES } from "@/lib/data";
import Navbar from "@/components/Navbar";
import RevealOnScroll from "@/components/RevealOnScroll";

export default function ResourcesPage() {
  const router = useRouter();
  const { userName } = useUser();

  useEffect(() => {
    if (!userName) router.replace("/");
  }, [userName, router]);

  if (!userName) return null;

  return (
    <>
      <Navbar />
      <div className="main-content page-enter">
        <Link href="/dashboard" className="back-btn">
          {"\u2190 Back to dashboard"}
        </Link>
        <div className="page-title">Keep Learning</div>
        <p className="page-sub">
          {"You've shipped a website. Here's how to keep going. All free to start."}
        </p>

        <div className="resources-grid">
          {RESOURCES.map((r, i) => (
            <RevealOnScroll key={r.title} delay={i * 0.07}>
              <a
                className="resource-card"
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="resource-icon">{r.icon}</div>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
                <span className="resource-tag">{r.tag}</span>
              </a>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </>
  );
}

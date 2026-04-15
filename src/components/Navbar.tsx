"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/store";
import { getCurrentStreak } from "@/lib/streak";

export default function Navbar() {
  const pathname = usePathname();
  const { userId, userName } = useUser();
  const [streak, setStreak] = useState(0);

  // Don't render on the onboarding page
  if (pathname === "/") return null;

  useEffect(() => {
    const syncStreak = () => setStreak(getCurrentStreak(userId));

    syncStreak();
    window.addEventListener("focus", syncStreak);
    document.addEventListener("visibilitychange", syncStreak);

    return () => {
      window.removeEventListener("focus", syncStreak);
      document.removeEventListener("visibilitychange", syncStreak);
    };
  }, [pathname, userId]);

  return (
    <nav className="site-nav">
      <Link href="/dashboard" className="nav-logo">
        TLP_
      </Link>
      <div className="nav-greeting">
        <span className="nav-greeting-copy">
          Hey, <span className="nav-greeting-name">{userName}</span>
        </span>
        <div className="nav-streak" aria-label={`${streak} day streak`}>
          <span className="nav-streak-emoji" aria-hidden="true">
            🔥
          </span>
          <span className="nav-streak-count">{streak}</span>
          <span className="nav-streak-label">day streak</span>
        </div>
      </div>
      <ul className="nav-links">
        <li>
          <Link
            href="/dashboard"
            className={pathname === "/dashboard" ? "active" : ""}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/leaderboard"
            className={pathname === "/leaderboard" ? "active" : ""}
          >
            Leaderboard
          </Link>
        </li>
        <li>
          <Link
            href="/glossary"
            className={pathname === "/glossary" ? "active" : ""}
          >
            Glossary
          </Link>
        </li>
        <li>
          <Link
            href="/resources"
            className={pathname === "/resources" ? "active" : ""}
          >
            Resources
          </Link>
        </li>
      </ul>
    </nav>
  );
}

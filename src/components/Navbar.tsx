"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/store";

export default function Navbar() {
  const pathname = usePathname();
  const { userName } = useUser();

  // Don't render on the onboarding page
  if (pathname === "/") return null;

  return (
    <nav className="site-nav">
      <Link href="/dashboard" className="nav-logo">
        TLP_
      </Link>
      <div className="nav-greeting">
        Hey, <span>{userName}</span>
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

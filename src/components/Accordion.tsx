"use client";

import { useState, type ReactNode } from "react";

interface Props {
  title: string;
  icon: string;
  children: ReactNode;
  defaultOpen?: boolean;
  headerExtra?: ReactNode;
}

export default function Accordion({
  title,
  icon,
  children,
  defaultOpen = false,
  headerExtra,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`accordion ${open ? "open" : ""}`}>
      <div className="accordion-header" onClick={() => setOpen(!open)}>
        <div className="accordion-header-left">
          <div className="accordion-icon">{icon}</div>
          <span className="accordion-title">{title}</span>
          {headerExtra && (
            <div
              className="accordion-header-extra"
              onClick={(e) => e.stopPropagation()}
            >
              {headerExtra}
            </div>
          )}
        </div>
        <span className="accordion-chevron">{"\u25BC"}</span>
      </div>
      <div className="accordion-body">{children}</div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { GlossaryEntry } from "@/lib/data";

interface Props {
  term: GlossaryEntry | null;
  onClose: () => void;
}

export default function GlossaryModal({ term, onClose }: Props) {
  const [closing, setClosing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 250);
  };

  useEffect(() => {
    if (!term) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  if (!term) return null;

  return (
    <div
      ref={overlayRef}
      className={`modal-overlay ${closing ? "closing" : "open"}`}
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose();
      }}
    >
      <div className="modal">
        <div className="modal-term">{term.term}</div>
        <div className="modal-week">Introduced: {term.week}</div>
        <div className="modal-def">{term.def}</div>
        <div className="modal-example">{term.example}</div>
        <button className="modal-close" onClick={handleClose}>
          Close {"\u2715"}
        </button>
      </div>
    </div>
  );
}

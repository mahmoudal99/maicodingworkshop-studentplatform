"use client";

import { useState } from "react";

const POWERS = [128, 64, 32, 16, 8, 4, 2, 1];

export default function BinaryWidget() {
  const [bits, setBits] = useState<boolean[]>(new Array(8).fill(false));

  const toggle = (index: number) => {
    setBits((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const binaryString = bits.map((b) => (b ? "1" : "0")).join("");
  const decimalValue = bits.reduce(
    (sum, b, i) => sum + (b ? POWERS[i] : 0),
    0
  );

  return (
    <div className="binary-widget">
      <div className="binary-widget-label">
        {"// Try it: Toggle bits to see binary \u2192 decimal conversion"}
      </div>
      <div className="binary-bits">
        {POWERS.map((power, i) => (
          <div className="bit-col" key={i}>
            <button
              className={`bit-btn ${bits[i] ? "active" : ""}`}
              onClick={() => toggle(i)}
            >
              {bits[i] ? "1" : "0"}
            </button>
            <div className="bit-label">{power}</div>
          </div>
        ))}
      </div>
      <div className="binary-result">
        Binary:{" "}
        <span style={{ color: "var(--purple)" }}>{binaryString}</span>
        <br />
        Decimal: <span className="decimal-val">{decimalValue}</span>
      </div>
    </div>
  );
}

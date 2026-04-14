"use client";

interface StabilityBarProps {
  stability: number;
  combo: number;
  accent: string;
}

export default function StabilityBar({ stability, combo, accent }: StabilityBarProps) {
  const barColor =
    stability > 60 ? accent : stability > 30 ? "#eab308" : "#ef4444";
  const comboCharge = Math.min(combo / 4, 1) * 100;
  const comboLabel = combo > 0 ? `x${combo} combo` : "Momentum building";

  return (
    <div className="stability-bar-wrap">
      <div className="stability-bar-track">
        <div
          className="stability-bar-fill"
          style={{
            width: `${stability}%`,
            background: barColor,
          }}
        />
      </div>
      <div className="stability-bar-labels">
        <span className="stability-bar-label" style={{ color: barColor }}>
          ⚡ {Math.round(stability)}%
        </span>
        <div className="stability-combo-wrap">
          <span className="stability-combo-label">Momentum</span>
          <div className="stability-combo-track" aria-hidden="true">
            <div
              className="stability-combo-fill"
              style={{
                width: `${comboCharge}%`,
                background: accent,
              }}
            />
          </div>
          <span className="stability-combo" style={{ color: accent }}>
            {comboLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

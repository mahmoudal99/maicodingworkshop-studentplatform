"use client";

interface StabilityBarProps {
  stability: number;
  combo: number;
  accent: string;
}

export default function StabilityBar({ stability, combo, accent }: StabilityBarProps) {
  const barColor =
    stability > 60
      ? "linear-gradient(90deg, var(--data-500), var(--energy-500))"
      : stability > 30
      ? "linear-gradient(90deg, color-mix(in srgb, var(--reward-500) 62%, white), var(--reward-500))"
      : "linear-gradient(90deg, color-mix(in srgb, var(--error-500) 68%, white), var(--error-500))";
  const labelColor =
    stability > 60 ? "var(--energy-500)" : stability > 30 ? "var(--reward-500)" : "var(--error-500)";
  const comboFill = combo > 0 ? `linear-gradient(90deg, var(--reward-500), ${accent})` : "var(--disabled-500)";
  const comboColor = combo > 0 ? accent : "var(--text-secondary)";
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
        <span className="stability-bar-label" style={{ color: labelColor }}>
          ⚡ {Math.round(stability)}%
        </span>
        <div className="stability-combo-wrap">
          <span className="stability-combo-label">Momentum</span>
          <div className="stability-combo-track" aria-hidden="true">
            <div
              className="stability-combo-fill"
              style={{
                width: `${comboCharge}%`,
                background: comboFill,
              }}
            />
          </div>
          <span className="stability-combo" style={{ color: comboColor }}>
            {comboLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

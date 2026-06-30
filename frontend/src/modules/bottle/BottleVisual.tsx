import type { CSSProperties } from "react";

type BottleVisualProps = {
  fillPercent: number;
};

export function BottleVisual({ fillPercent }: BottleVisualProps) {
  const clampedPercent = Math.max(0, Math.min(100, fillPercent));
  const style = { "--bottle-fill": `${clampedPercent}%` } as CSSProperties;

  return (
    <div className="bottle-visual" style={style} aria-hidden="true">
      <div className="bottle-visual__cap" />
      <div className="bottle-visual__neck">
        <div className="bottle-visual__neck-fill" />
      </div>
      <div className="bottle-visual__shoulders" />
      <div className="bottle-visual__body">
        <div className="bottle-visual__fill" />
        <div className="bottle-visual__shine" />
        <div className="bottle-visual__label">
          <span>{clampedPercent}%</span>
          <small>прогресс</small>
        </div>
      </div>
    </div>
  );
}

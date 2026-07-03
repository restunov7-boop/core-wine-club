import type { CSSProperties } from "react";

type BottleVisualProps = {
  fillPercent: number;
  showProgressLabel?: boolean;
  className?: string;
};

export function BottleVisual({ fillPercent, showProgressLabel = true, className }: BottleVisualProps) {
  const normalizedPercent = Number.isFinite(fillPercent) ? fillPercent : 0;
  const clampedPercent = Math.max(0, Math.min(100, normalizedPercent));
  const bodyFillPercent = Math.min(100, (clampedPercent / 72) * 100);
  const neckFillPercent = clampedPercent <= 72 ? 0 : Math.min(100, ((clampedPercent - 72) / 28) * 100);
  const style = {
    "--bottle-fill": `${clampedPercent}%`,
    "--bottle-body-fill": `${bodyFillPercent}%`,
    "--bottle-neck-fill": `${neckFillPercent}%`,
  } as CSSProperties;

  return (
    <div className={className ? `bottle-visual ${className}` : "bottle-visual"} style={style} aria-hidden="true">
      <div className="bottle-visual__cap" />
      <div className="bottle-visual__neck">
        <div className="bottle-visual__neck-fill" />
      </div>
      <div className="bottle-visual__shoulders" />
      <div className="bottle-visual__body">
        <div className="bottle-visual__fill" />
        <div className="bottle-visual__shine" />
        {showProgressLabel && (
          <div className="bottle-visual__label">
            <span>{clampedPercent}%</span>
            <small>прогресс</small>
          </div>
        )}
      </div>
    </div>
  );
}

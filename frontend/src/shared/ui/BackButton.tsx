import { Link } from "react-router-dom";

type BackButtonProps = {
  to: string;
  label?: string;
};

export function BackButton({ to, label = "Назад" }: BackButtonProps) {
  return (
    <Link className="back-button" to={to} aria-label={label} title={label}>
      <span aria-hidden="true">‹</span>
    </Link>
  );
}

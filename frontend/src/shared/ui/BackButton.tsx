import { Link } from "react-router-dom";

type BackButtonProps = {
  to: string;
  label?: string;
};

export function BackButton({ to, label = "Назад" }: BackButtonProps) {
  return (
    <Link className="back-button" to={to} aria-label={label} title={label}>
      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </Link>
  );
}

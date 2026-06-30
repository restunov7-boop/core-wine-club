import { Link } from "react-router-dom";

export function AppHeader() {
  return (
    <header className="app-header">
      <Link className="app-header__brand" to="/home" aria-label="На главную">
        <span>Дочь винодела</span>
        <small>CORE Wine Club</small>
      </Link>
    </header>
  );
}

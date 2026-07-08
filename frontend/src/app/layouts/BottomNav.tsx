import { Link, useLocation } from "react-router-dom";

const navItems = [
  { to: "/home", label: "Главная", match: ["/home"] },
  { to: "/discoveries", label: "Открытия", match: ["/discoveries"] },
  { to: "/learn", label: "Уроки", match: ["/learn"] },
  { to: "/diary", label: "Дневник", match: ["/diary"] },
  { to: "/taste-profile", label: "Профиль", match: ["/taste-profile", "/profile"] },
];

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav" aria-label="Основная навигация">
      {navItems.map((item) => {
        const isActive = item.match.some((path) => pathname === path || pathname.startsWith(`${path}/`));

        return (
          <Link
            key={item.to}
            to={item.to}
            className={isActive ? "bottom-nav__link bottom-nav__link--active" : "bottom-nav__link"}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

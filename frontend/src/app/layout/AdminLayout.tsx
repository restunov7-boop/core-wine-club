import { NavLink, Outlet } from "react-router-dom";

export function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-shell__sidebar">
        <div className="admin-shell__brand">CORE Админ</div>
        <NavLink to="/admin" end>
          Обзор
        </NavLink>
        <NavLink to="/admin/dashboard">Панель</NavLink>
      </aside>
      <section className="admin-shell__main">
        <header className="admin-shell__topbar">Служебный раздел</header>
        <main className="admin-shell__content">
          <Outlet />
        </main>
      </section>
    </div>
  );
}

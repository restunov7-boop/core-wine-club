import { NavLink, Outlet } from "react-router-dom";

export function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-shell__sidebar">
        <div className="admin-shell__brand">CORE Admin</div>
        <NavLink to="/admin" end>
          Overview
        </NavLink>
        <NavLink to="/admin/dashboard">Dashboard</NavLink>
      </aside>
      <section className="admin-shell__main">
        <header className="admin-shell__topbar">Admin workspace</header>
        <main className="admin-shell__content">
          <Outlet />
        </main>
      </section>
    </div>
  );
}

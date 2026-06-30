import { Outlet } from "react-router-dom";

import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";

export function AppShell() {
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-shell__main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

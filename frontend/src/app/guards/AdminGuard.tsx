import { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

import { useAuthStore } from "../../modules/auth/store";
import { PlaceholderPage } from "../../shared/ui/PlaceholderPage";

export function AdminGuard({ children }: PropsWithChildren) {
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const projectUser = useAuthStore((state) => state.projectUser);

  if (!isAdmin) {
    return (
      <PlaceholderPage
        eyebrow="Admin"
        title="Нет доступа"
        description={`Текущая роль "${
          projectUser?.role ?? "unknown"
        }" не включает доступ к admin-разделу.`}
        action={
          <Link className="primary-action" to="/home">
            На главную
          </Link>
        }
      />
    );
  }

  return <>{children}</>;
}

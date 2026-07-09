import { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

import { canAccessAdmin, useAuthStore } from "../../modules/auth/store";
import { PlaceholderPage } from "../../shared/ui/PlaceholderPage";

export function AdminGuard({ children }: PropsWithChildren) {
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const projectUser = useAuthStore((state) => state.projectUser);

  if (!isAdmin && !canAccessAdmin(projectUser)) {
    return (
      <PlaceholderPage
        eyebrow="Admin"
        title="Нет доступа"
        description="Админ-раздел доступен только участникам с правами управления проектом."
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

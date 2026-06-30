import { PropsWithChildren } from "react";

import { useAuthStore } from "../../modules/auth/store";
import { PlaceholderPage } from "../../shared/ui/PlaceholderPage";

export function AdminGuard({ children }: PropsWithChildren) {
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const projectUser = useAuthStore((state) => state.projectUser);

  if (!isAdmin) {
    return (
      <PlaceholderPage
        title="Нет доступа"
        description={`Текущая роль "${
          projectUser?.role ?? "unknown"
        }" не включает доступ к admin-разделу.`}
      />
    );
  }

  return <>{children}</>;
}

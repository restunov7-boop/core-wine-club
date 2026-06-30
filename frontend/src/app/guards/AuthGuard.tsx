import { PropsWithChildren, useEffect } from "react";

import { useAuthStore } from "../../modules/auth/store";
import { PlaceholderPage } from "../../shared/ui/PlaceholderPage";
import { useTelegram } from "../../shared/lib/telegram/useTelegram";

const devTelegramMockEnabled = import.meta.env.VITE_DEV_TELEGRAM_MOCK === "true";

export function AuthGuard({ children }: PropsWithChildren) {
  const telegram = useTelegram();
  const { accessToken, isAuthenticated, isLoading, error, login, loadMe, setError } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated || isLoading || error) {
      return;
    }

    if (accessToken) {
      void loadMe();
      return;
    }

    if (devTelegramMockEnabled) {
      void login(telegram.initData || "dev_mock_init_data");
      return;
    }

    if (telegram.initData) {
      void login(telegram.initData);
      return;
    }

    setError("Telegram initData is missing. Open inside Telegram or enable VITE_DEV_TELEGRAM_MOCK=true.");
  }, [accessToken, error, isAuthenticated, isLoading, loadMe, login, setError, telegram.initData]);

  if (error) {
    return <PlaceholderPage title="Authentication error" description={error} />;
  }

  if (!isAuthenticated) {
    return <PlaceholderPage title="Loading" description="Signing in with local dev Telegram mock..." />;
  }

  return <>{children}</>;
}

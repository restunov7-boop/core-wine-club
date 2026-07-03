import { PropsWithChildren, useEffect } from "react";

import { useAuthStore } from "../../modules/auth/store";
import { PlaceholderPage } from "../../shared/ui/PlaceholderPage";
import { telegramClient } from "../../shared/lib/telegram/telegramClient";

const devTelegramMockEnabled = import.meta.env.DEV && import.meta.env.VITE_DEV_TELEGRAM_MOCK === "true";

export function AuthGuard({ children }: PropsWithChildren) {
  const { accessToken, isAuthenticated, isLoading, error, login, loadMe, setError } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    if (isAuthenticated || isLoading || error) {
      return undefined;
    }

    if (accessToken) {
      void loadMe();
      return undefined;
    }

    void telegramClient.waitForInitData().then((initData) => {
      if (!isMounted) {
        return;
      }

      if (initData) {
        void login(initData);
        return;
      }

      setError("Telegram initData is missing. Open inside Telegram or enable VITE_DEV_TELEGRAM_MOCK=true in local dev.");
    });

    return () => {
      isMounted = false;
    };
  }, [accessToken, error, isAuthenticated, isLoading, loadMe, login, setError]);

  if (error) {
    return <PlaceholderPage title="Authentication error" description={error} />;
  }

  if (!isAuthenticated) {
    return (
      <PlaceholderPage
        title="Loading"
        description={
          devTelegramMockEnabled
            ? "Signing in with local dev Telegram mock..."
            : "Signing in with Telegram Mini App initData..."
        }
      />
    );
  }

  return <>{children}</>;
}

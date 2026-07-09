import { PropsWithChildren, useEffect } from "react";

import { useAuthStore } from "../../modules/auth/store";
import { telegramClient } from "../../shared/lib/telegram/telegramClient";
import { PlaceholderPage } from "../../shared/ui/PlaceholderPage";

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

      setError("Не удалось подтвердить вход через Telegram. Открой приложение из бота ещё раз.");
    });

    return () => {
      isMounted = false;
    };
  }, [accessToken, error, isAuthenticated, isLoading, loadMe, login, setError]);

  if (error) {
    return (
      <PlaceholderPage
        title="Вход не получился"
        description={error}
        action={
          <button className="primary-action" type="button" onClick={() => window.location.reload()}>
            Попробовать снова
          </button>
        }
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <PlaceholderPage
        title="Вход"
        description={devTelegramMockEnabled ? "Входим через локальный Telegram mock..." : "Проверяем вход через Telegram..."}
      />
    );
  }

  return <>{children}</>;
}

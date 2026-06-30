import { useMemo } from "react";

import { telegramClient } from "./telegramClient";

export function useTelegram() {
  return useMemo(
    () => ({
      initData: telegramClient.getInitData(),
      user: telegramClient.getUser(),
      isTelegramEnvironment: telegramClient.isTelegramEnvironment(),
      ready: telegramClient.ready,
      expand: telegramClient.expand,
      close: telegramClient.close,
      hapticFeedback: telegramClient.hapticFeedback,
    }),
    [],
  );
}

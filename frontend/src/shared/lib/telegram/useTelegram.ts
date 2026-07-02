import { useMemo } from "react";

import { telegramClient } from "./telegramClient";

export function useTelegram() {
  return useMemo(
    () => ({
      initData: telegramClient.getInitData(),
      user: telegramClient.getUser(),
      isTelegramMiniApp: telegramClient.isTelegramMiniApp(),
      isTelegramEnvironment: telegramClient.isTelegramEnvironment(),
      ready: telegramClient.ready,
      expand: telegramClient.expand,
      close: telegramClient.close,
      setHeaderColor: telegramClient.setHeaderColor,
      setBackgroundColor: telegramClient.setBackgroundColor,
      enableClosingConfirmation: telegramClient.enableClosingConfirmation,
      disableClosingConfirmation: telegramClient.disableClosingConfirmation,
      hapticFeedback: telegramClient.hapticFeedback,
    }),
    [],
  );
}

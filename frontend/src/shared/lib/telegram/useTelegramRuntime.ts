import { useEffect } from "react";

import { telegramClient } from "./telegramClient";

export function useTelegramRuntime() {
  useEffect(() => {
    telegramClient.applyThemeVariables();

    if (!telegramClient.isTelegramMiniApp()) {
      return;
    }

    telegramClient.ready();
    telegramClient.expand();
    telegramClient.setHeaderColor();
    telegramClient.setBackgroundColor();
  }, []);
}

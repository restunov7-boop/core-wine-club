type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

type TelegramWebApp = {
  initData?: string;
  initDataUnsafe?: {
    user?: TelegramUser;
  };
  ready?: () => void;
  expand?: () => void;
  close?: () => void;
  HapticFeedback?: {
    impactOccurred?: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
  };
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

const devMockEnabled = import.meta.env.VITE_DEV_TELEGRAM_MOCK === "true";

const mockUser: TelegramUser = {
  id: 100001,
  first_name: "CORE",
  username: "core_dev_user",
  language_code: "ru",
};

function getWebApp(): TelegramWebApp | undefined {
  return window.Telegram?.WebApp;
}

export const telegramClient = {
  isTelegramEnvironment(): boolean {
    return Boolean(getWebApp()) && !devMockEnabled;
  },

  getInitData(): string {
    if (devMockEnabled) {
      return "dev_mock_init_data";
    }

    return getWebApp()?.initData ?? "";
  },

  getUser(): TelegramUser | null {
    if (devMockEnabled) {
      return mockUser;
    }

    return getWebApp()?.initDataUnsafe?.user ?? null;
  },

  ready(): void {
    getWebApp()?.ready?.();
  },

  expand(): void {
    getWebApp()?.expand?.();
  },

  close(): void {
    getWebApp()?.close?.();
  },

  hapticFeedback(style: "light" | "medium" | "heavy" | "rigid" | "soft" = "light"): void {
    getWebApp()?.HapticFeedback?.impactOccurred?.(style);
  },
};

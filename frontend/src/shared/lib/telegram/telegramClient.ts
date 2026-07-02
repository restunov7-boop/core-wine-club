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
  colorScheme?: "light" | "dark";
  themeParams?: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  ready?: () => void;
  expand?: () => void;
  close?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  enableClosingConfirmation?: () => void;
  disableClosingConfirmation?: () => void;
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
const miniAppHeaderColor = "#141313";
const miniAppBackgroundColor = "#141313";

const mockUser: TelegramUser = {
  id: 100001,
  first_name: "CORE",
  username: "core_dev_user",
  language_code: "ru",
};

function getWebApp(): TelegramWebApp | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.Telegram?.WebApp;
}

function isRealTelegramMiniApp(): boolean {
  return Boolean(getWebApp()) && !devMockEnabled;
}

export const telegramClient = {
  isTelegramMiniApp(): boolean {
    return isRealTelegramMiniApp();
  },

  isTelegramEnvironment(): boolean {
    return isRealTelegramMiniApp();
  },

  getInitData(): string {
    if (devMockEnabled) {
      return "dev_mock_init_data";
    }

    return getWebApp()?.initData ?? "";
  },

  getTelegramInitData(): string {
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

  getTelegramUser(): TelegramUser | null {
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

  setHeaderColor(color: string = miniAppHeaderColor): void {
    getWebApp()?.setHeaderColor?.(color);
  },

  setBackgroundColor(color: string = miniAppBackgroundColor): void {
    getWebApp()?.setBackgroundColor?.(color);
  },

  enableClosingConfirmation(): void {
    getWebApp()?.enableClosingConfirmation?.();
  },

  disableClosingConfirmation(): void {
    getWebApp()?.disableClosingConfirmation?.();
  },

  applyThemeVariables(): void {
    if (typeof document === "undefined") {
      return;
    }

    const theme = getWebApp()?.themeParams;
    if (!theme) {
      return;
    }

    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--tg-${key.replace(/_/g, "-")}`, value);
      }
    });
  },

  hapticFeedback(style: "light" | "medium" | "heavy" | "rigid" | "soft" = "light"): void {
    getWebApp()?.HapticFeedback?.impactOccurred?.(style);
  },
};

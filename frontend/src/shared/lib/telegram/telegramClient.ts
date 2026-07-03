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
  platform?: string;
  version?: string;
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

export type TelegramDebugState = {
  isTelegramObjectPresent: boolean;
  isWebAppPresent: boolean;
  initDataLength: number;
  initDataSource: "window.Telegram.WebApp.initData" | "launchParams" | "devMock" | "missing";
  platform: string;
  version: string;
  isExpandedAvailable: boolean;
  readyCalled: boolean;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

const devMockEnabled = import.meta.env.DEV && import.meta.env.VITE_DEV_TELEGRAM_MOCK === "true";
const miniAppHeaderColor = "#141313";
const miniAppBackgroundColor = "#141313";
let readyCalled = false;

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

function getLaunchParams(): URLSearchParams[] {
  if (typeof window === "undefined") {
    return [];
  }

  const params: URLSearchParams[] = [];
  const { search, hash } = window.location;

  if (search) {
    params.push(new URLSearchParams(search));
  }

  if (hash) {
    params.push(new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash));
  }

  return params;
}

function getLaunchParam(name: string): string {
  for (const params of getLaunchParams()) {
    const value = params.get(name);
    if (value) {
      return value;
    }
  }

  return "";
}

function getRealInitData(): { value: string; source: TelegramDebugState["initDataSource"] } {
  const webAppInitData = getWebApp()?.initData;
  if (webAppInitData) {
    return { value: webAppInitData, source: "window.Telegram.WebApp.initData" };
  }

  const launchInitData = getLaunchParam("tgWebAppData");
  if (launchInitData) {
    return { value: launchInitData, source: "launchParams" };
  }

  return { value: "", source: "missing" };
}

function isRealTelegramMiniApp(): boolean {
  return (Boolean(getWebApp()) || Boolean(getLaunchParam("tgWebAppData"))) && !devMockEnabled;
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

    return getRealInitData().value;
  },

  getTelegramInitData(): string {
    if (devMockEnabled) {
      return "dev_mock_init_data";
    }

    return getRealInitData().value;
  },

  async waitForInitData(timeoutMs = 1500, intervalMs = 100): Promise<string> {
    const startedAt = Date.now();

    while (Date.now() - startedAt <= timeoutMs) {
      const initData = this.getInitData();
      if (initData) {
        return initData;
      }

      await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
    }

    return this.getInitData();
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
    readyCalled = true;
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

  getDebugState(): TelegramDebugState {
    const webApp = getWebApp();
    const initData =
      devMockEnabled
        ? { value: "dev_mock_init_data", source: "devMock" as const }
        : getRealInitData();

    return {
      isTelegramObjectPresent: typeof window !== "undefined" && Boolean(window.Telegram),
      isWebAppPresent: Boolean(webApp),
      initDataLength: initData.value.length,
      initDataSource: initData.source,
      platform: webApp?.platform ?? getLaunchParam("tgWebAppPlatform") ?? "",
      version: webApp?.version ?? getLaunchParam("tgWebAppVersion") ?? "",
      isExpandedAvailable: typeof webApp?.expand === "function",
      readyCalled,
    };
  },
};

import { create } from "zustand";

import { setApiAccessToken } from "../../shared/api/client";

import { getMe, loginWithTelegram } from "./api";
import type { AuthUser, ProjectUser } from "./types";

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  projectUser: ProjectUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  login: (initData: string) => Promise<void>;
  logout: () => void;
  loadMe: () => Promise<void>;
  updateSessionProfile: (user: AuthUser, projectUser: ProjectUser) => void;
  setError: (message: string | null) => void;
};

function canAccessAdmin(projectUser: ProjectUser | null): boolean {
  if (!projectUser || projectUser.status !== "active") {
    return false;
  }

  return (
    projectUser.role === "admin" ||
    projectUser.role === "owner" ||
    projectUser.capabilities.includes("access_admin")
  );
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  projectUser: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,
  error: null,

  async login(initData: string) {
    if (!initData) {
      set({
        error: "Telegram initData is missing. Enable VITE_DEV_TELEGRAM_MOCK=true for local dev auth.",
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const session = await loginWithTelegram(initData);
      setApiAccessToken(session.access_token);
      set({
        accessToken: session.access_token,
        user: session.user,
        projectUser: session.project_user,
        isAuthenticated: true,
        isAdmin: canAccessAdmin(session.project_user),
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Authentication failed",
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
      });
    }
  },

  logout() {
    setApiAccessToken(null);
    set({
      accessToken: null,
      user: null,
      projectUser: null,
      isAuthenticated: false,
      isAdmin: false,
      error: null,
    });
  },

  async loadMe() {
    const { accessToken } = get();
    if (!accessToken) {
      return;
    }

    setApiAccessToken(accessToken);
    set({ isLoading: true, error: null });
    try {
      const me = await getMe();
      set({
        user: me.user,
        projectUser: me.project_user,
        isAuthenticated: true,
        isAdmin: canAccessAdmin(me.project_user),
        isLoading: false,
      });
    } catch (error) {
      setApiAccessToken(null);
      set({
        accessToken: null,
        error: error instanceof Error ? error.message : "Unable to load session",
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
      });
    }
  },

  updateSessionProfile(user: AuthUser, projectUser: ProjectUser) {
    set({
      user,
      projectUser,
      isAuthenticated: true,
      isAdmin: canAccessAdmin(projectUser),
    });
  },

  setError(message: string | null) {
    set({ error: message });
  },
}));

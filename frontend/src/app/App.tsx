import { RouterProvider } from "react-router-dom";

import { useTelegramRuntime } from "../shared/lib/telegram/useTelegramRuntime";

import { AppProviders } from "./providers";
import { router } from "./router";

export function App() {
  useTelegramRuntime();

  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}

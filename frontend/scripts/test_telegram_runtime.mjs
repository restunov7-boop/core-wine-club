import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const sourcePath = path.resolve("src/shared/lib/telegram/telegramClient.ts");
const source = fs
  .readFileSync(sourcePath, "utf8")
  .replace(/export type TelegramDebugState = \{[\s\S]*?\};\n\n/, "")
  .replace(/export const telegramClient = /, "globalThis.telegramClient = ")
  .replace(/import\.meta\.env\.DEV/g, "false")
  .replace(/import\.meta\.env\.VITE_DEV_TELEGRAM_MOCK/g, '"false"');

const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.None,
    target: ts.ScriptTarget.ES2020,
  },
});

const context = {
  URLSearchParams,
  Date,
  Promise,
  window: {
    Telegram: {
      WebApp: {
        initData: "query_id=test&user=%7B%22id%22%3A100001%7D&auth_date=1780000000&hash=test",
        platform: "tdesktop",
        version: "7.7",
        expand() {},
        ready() {},
      },
    },
    location: {
      search: "",
      hash: "",
    },
    setTimeout,
  },
};

vm.createContext(context);
vm.runInContext(outputText, context);

assert.equal(
  context.telegramClient.getInitData(),
  "query_id=test&user=%7B%22id%22%3A100001%7D&auth_date=1780000000&hash=test",
);

const debugState = context.telegramClient.getDebugState();
assert.equal(debugState.isTelegramObjectPresent, true);
assert.equal(debugState.isWebAppPresent, true);
assert.equal(debugState.initDataLength > 0, true);
assert.equal(debugState.platform, "tdesktop");
assert.equal(debugState.version, "7.7");

console.log("[OK] telegram runtime detects mocked window.Telegram.WebApp.initData");

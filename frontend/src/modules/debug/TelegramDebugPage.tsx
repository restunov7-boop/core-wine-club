import { useMemo, useState } from "react";

import { telegramClient } from "../../shared/lib/telegram/telegramClient";
import { canAccessAdmin, useAuthStore } from "../auth/store";

export function TelegramDebugPage() {
  const [snapshotKey, setSnapshotKey] = useState(0);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const projectUser = useAuthStore((state) => state.projectUser);
  const debugState = useMemo(() => telegramClient.getDebugState(), [snapshotKey]);
  const authDebugState = {
    projectRole: projectUser?.role ?? "missing",
    projectStatus: projectUser?.status ?? "missing",
    projectCapabilities: projectUser?.capabilities?.join(", ") || "none",
    isAdmin,
    canAccessAdmin: canAccessAdmin(projectUser),
  };

  return (
    <section className="page">
      <div className="page__eyebrow">CORE QA</div>
      <h1>Telegram debug</h1>
      <dl className="detail-list">
        {Object.entries(debugState).map(([key, value]) => (
          <div className="detail-list__row" key={key}>
            <dt>{key}</dt>
            <dd>{String(value)}</dd>
          </div>
        ))}
        {Object.entries(authDebugState).map(([key, value]) => (
          <div className="detail-list__row" key={key}>
            <dt>{key}</dt>
            <dd>{String(value)}</dd>
          </div>
        ))}
      </dl>
      <div className="page__actions">
        <button type="button" onClick={() => setSnapshotKey((value) => value + 1)}>
          Refresh
        </button>
      </div>
    </section>
  );
}

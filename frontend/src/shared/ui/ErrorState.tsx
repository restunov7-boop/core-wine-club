import type { ReactNode } from "react";

type ErrorStateProps = {
  title?: string;
  description: string;
  action?: ReactNode;
};

export function ErrorState({ title = "Не удалось загрузить", description, action }: ErrorStateProps) {
  return (
    <section className="state-card state-card--error" role="alert">
      <span>Ошибка</span>
      <h1>{title}</h1>
      <p>{description}</p>
      {action ?? (
        <button className="ghost-action state-card__action" type="button" onClick={() => window.location.reload()}>
          Повторить
        </button>
      )}
    </section>
  );
}

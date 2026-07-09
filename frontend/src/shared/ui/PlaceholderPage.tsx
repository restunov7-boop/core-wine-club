import type { ReactNode } from "react";

type PlaceholderPageProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
};

export function PlaceholderPage({ title, description, eyebrow = "CORE Wine Club", action }: PlaceholderPageProps) {
  return (
    <section className="page">
      <div className="page__eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description ?? "Этот раздел пока готовится. Основная логика появится в следующих спринтах."}</p>
      {action && <div className="page__actions">{action}</div>}
    </section>
  );
}

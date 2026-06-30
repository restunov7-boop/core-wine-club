type LoadingStateProps = {
  title: string;
  description?: string;
};

export function LoadingState({ title, description }: LoadingStateProps) {
  return (
    <section className="state-card" role="status" aria-live="polite">
      <span>Загрузка</span>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </section>
  );
}

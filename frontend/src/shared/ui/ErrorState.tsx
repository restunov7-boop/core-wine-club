type ErrorStateProps = {
  title?: string;
  description: string;
};

export function ErrorState({ title = "Не удалось загрузить", description }: ErrorStateProps) {
  return (
    <section className="state-card state-card--error" role="alert">
      <span>Ошибка</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

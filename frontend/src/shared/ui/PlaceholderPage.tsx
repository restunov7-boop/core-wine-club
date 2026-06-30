type PlaceholderPageProps = {
  title: string;
  description?: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="page">
      <div className="page__eyebrow">CORE Wine Club</div>
      <h1>{title}</h1>
      <p>{description ?? "Sprint placeholder. Business logic will be added in later sprints."}</p>
    </section>
  );
}

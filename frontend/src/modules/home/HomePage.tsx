import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";

import { getHome } from "./api";
import type { HomeResponse } from "./types";

export function HomePage() {
  const navigate = useNavigate();
  const [home, setHome] = useState<HomeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    getHome()
      .then((data) => {
        if (!mounted) {
          return;
        }

        if (!data.onboarding_completed) {
          navigate("/onboarding", { replace: true });
          return;
        }

        setHome(data);
      })
      .catch((caught) => {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "Не удалось загрузить главную");
        }
      });

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (error) {
    return <ErrorState title="Не удалось открыть главную" description={error} />;
  }

  if (!home) {
    return <LoadingState title="Главная" description="Готовим клубное пространство..." />;
  }

  const greetingName = home.user.display_name ?? "друг";
  const hubSections = home.sections.filter((section) =>
    ["discoveries", "learning", "bottle", "diary", "taste_profile"].includes(section.key),
  );

  return (
    <section className="home-page">
      <div className="home-page__intro">
        <span>{home.project.name}</span>
        <h1>Добро пожаловать, {greetingName}</h1>
        <p>{home.hero.subtitle}</p>
      </div>

      <div className="home-hero">
        <div>
          <span>Wine Club</span>
          <h2>{home.hero.title}</h2>
        </div>
        <p>Онбординг завершен. Открытия, дневник и первые мягкие закономерности вкуса уже доступны.</p>
      </div>

      <div className="home-section-grid">
        {hubSections.map((section) => (
          <HomeSectionCard key={section.key} section={section} />
        ))}
      </div>
    </section>
  );
}

function HomeSectionCard({ section }: { section: HomeResponse["sections"][number] }) {
  const linkTo =
    section.href ??
    (section.key === "discoveries"
      ? "/discoveries"
      : section.key === "learning"
        ? "/learn"
      : section.key === "diary"
        ? "/diary"
        : section.key === "taste_profile"
          ? "/taste-profile"
          : null);
  const isAvailable =
    section.items.length > 0 || ["diary", "taste_profile", "learning", "bottle"].includes(section.key);
  const stats = buildStats(section.stats);

  const content = (
    <article className="home-section-card">
      <span>{isAvailable ? "Доступно" : "Скоро"}</span>
      <h3>{section.title}</h3>
      <p>{section.description}</p>

      {stats.length > 0 && (
        <div className="home-stat-row">
          {stats.map((stat) => (
            <div className="home-stat" key={stat.label}>
              <strong>{stat.value}</strong>
              <small>{stat.label}</small>
            </div>
          ))}
        </div>
      )}

      {section.items.length > 0 && (
        <ul className="home-preview-list">
          {section.items.map((item) => (
            <li key={item.slug}>
              <span>{item.title}</span>
              {formatPreviewMeta(item) && <small>{formatPreviewMeta(item)}</small>}
            </li>
          ))}
        </ul>
      )}

      {linkTo && <div className="home-section-card__cta">Открыть раздел</div>}
    </article>
  );

  if (linkTo) {
    return (
      <Link className="home-section-link" to={linkTo}>
        {content}
      </Link>
    );
  }

  return content;
}

function buildStats(stats: Record<string, number | null>): Array<{ value: string; label: string }> {
  const output: Array<{ value: string; label: string }> = [];
  if (typeof stats.notes_count === "number") {
    output.push({
      value: String(stats.notes_count),
      label: stats.notes_count === 1 ? "заметка" : "заметок",
    });
  }
  if (typeof stats.average_rating === "number") {
    output.push({
      value: stats.average_rating.toFixed(1),
      label: "средняя оценка",
    });
  }
  if (typeof stats.completed_lessons_count === "number") {
    output.push({
      value: String(stats.completed_lessons_count),
      label: "уроков завершено",
    });
  }
  if (typeof stats.available_lessons_count === "number") {
    output.push({
      value: String(stats.available_lessons_count),
      label: "уроков доступно",
    });
  }
  if (typeof stats.fill_percent === "number") {
    output.push({
      value: `${stats.fill_percent}%`,
      label: "бутылка",
    });
  }
  if (typeof stats.completed_units === "number") {
    output.push({
      value: String(stats.completed_units),
      label: "заполнено",
    });
  }
  if (typeof stats.total_units === "number") {
    output.push({
      value: String(stats.total_units),
      label: "всего",
    });
  }
  return output;
}

function formatPreviewMeta(item: HomeResponse["sections"][number]["items"][number]): string | null {
  const parts: string[] = [];
  if (typeof item.lessons_count === "number" && typeof item.completed_lessons_count === "number") {
    parts.push(`${item.completed_lessons_count} из ${item.lessons_count} завершено`);
  } else if (typeof item.lessons_count === "number") {
    parts.push(`${item.lessons_count} уроков`);
  }
  if (item.estimated_minutes) {
    parts.push(`${item.estimated_minutes} мин`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

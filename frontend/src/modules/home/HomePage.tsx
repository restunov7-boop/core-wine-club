import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";

import { getHome } from "./api";
import type { HomeResponse } from "./types";

const homeSectionOrder = [
  "my_path",
  "learning_journey",
  "bottle",
  "learning",
  "quizzes",
  "diary",
  "taste_profile",
  "activity",
  "discoveries",
];

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
  const hubSections = home.sections
    .filter((section) => homeSectionOrder.includes(section.key))
    .sort((left, right) => homeSectionOrder.indexOf(left.key) - homeSectionOrder.indexOf(right.key));

  return (
    <section className="home-page">
      <div className="home-page__intro">
        <span>{home.project.name}</span>
        <h1>Добро пожаловать, {greetingName}</h1>
        <p>{home.hero.subtitle}</p>
      </div>

      <div className="home-hero">
        <div>
          <span>С чего начать</span>
          <h2>{home.hero.title}</h2>
        </div>
        <p>
          Начни с короткого урока, закрепи базу в квизе и добавь первую заметку в дневник. Так постепенно появятся
          бутылка прогресса, профиль вкуса и личная история.
        </p>
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
  const notesCount = typeof section.stats.notes_count === "number" ? section.stats.notes_count : null;
  const defaultLinkTo =
    section.href ??
    (section.key === "discoveries"
      ? "/discoveries"
      : section.key === "learning"
        ? "/learn"
        : section.key === "learning_journey"
          ? "/my-path"
          : section.key === "quizzes"
            ? "/quizzes"
            : section.key === "activity"
              ? "/progress"
              : section.key === "my_path"
                ? "/my-path"
                : section.key === "diary"
                  ? "/diary"
                  : section.key === "taste_profile"
                    ? "/taste-profile"
                    : null);
  const linkTo = section.key === "diary" && notesCount === 0 ? "/diary/new" : defaultLinkTo;
  const isAvailable =
    section.items.length > 0 ||
    ["diary", "taste_profile", "learning", "learning_journey", "quizzes", "bottle", "activity", "my_path"].includes(
      section.key,
    );
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
            <li key={item.id ?? item.slug ?? item.title}>
              <span>{item.title}</span>
              {formatPreviewMeta(item, section.key) && <small>{formatPreviewMeta(item, section.key)}</small>}
            </li>
          ))}
        </ul>
      )}

      {linkTo && <div className="home-section-card__cta">{getSectionCta(section.key, notesCount)}</div>}
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

function getSectionCta(sectionKey: string, notesCount: number | null): string {
  if (sectionKey === "my_path") {
    return "Продолжить";
  }
  if (sectionKey === "bottle") {
    return "Посмотреть бутылку";
  }
  if (sectionKey === "learning") {
    return "Продолжить уроки";
  }
  if (sectionKey === "learning_journey") {
    return "Открыть следующий шаг";
  }
  if (sectionKey === "quizzes") {
    return "Открыть квиз";
  }
  if (sectionKey === "diary") {
    return notesCount && notesCount > 0 ? "Открыть дневник" : "Добавить заметку";
  }
  if (sectionKey === "taste_profile") {
    return "Открыть профиль";
  }
  if (sectionKey === "activity") {
    return "Вся активность";
  }
  return "Открыть";
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
  if (typeof stats.completed_quizzes_count === "number") {
    output.push({
      value: String(stats.completed_quizzes_count),
      label: "квизов завершено",
    });
  }
  if (typeof stats.available_quizzes_count === "number") {
    output.push({
      value: String(stats.available_quizzes_count),
      label: "квизов доступно",
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

function formatPreviewMeta(item: HomeResponse["sections"][number]["items"][number], sectionKey: string): string | null {
  if (sectionKey === "activity") {
    return [item.description, item.occurred_at ? formatActivityDate(item.occurred_at) : null]
      .filter(Boolean)
      .join(" · ") || null;
  }
  if (sectionKey === "my_path") {
    return item.description;
  }

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

function formatActivityDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

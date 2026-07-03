import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";
import { BottleVisual } from "../bottle/BottleVisual";
import { getTastingNotes } from "../diary/api";
import type { TastingNoteListItem } from "../diary/types";

import { getHome } from "./api";
import type { HomeResponse } from "./types";

export function HomePage() {
  const navigate = useNavigate();
  const [home, setHome] = useState<HomeResponse | null>(null);
  const [latestNotes, setLatestNotes] = useState<TastingNoteListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await getHome();
        if (!mounted) {
          return;
        }

        if (!data.onboarding_completed) {
          navigate("/onboarding", { replace: true });
          return;
        }

        setHome(data);
        const notes = await getTastingNotes(3);
        if (mounted) {
          setLatestNotes(notes.items);
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "Не удалось загрузить главную");
        }
      }
    }

    void load();

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
  const sections = new Map(home.sections.map((section) => [section.key, section]));
  const myPath = sections.get("my_path");
  const bottle = sections.get("bottle");
  const nextAction = myPath?.items[0];
  const nextActionHref = nextAction?.href ?? myPath?.href ?? "/my-path";
  const bottleFill = typeof bottle?.stats.fill_percent === "number" ? bottle.stats.fill_percent : 0;

  return (
    <section className="home-page home-page--alive">
      <Link className="home-tasting-banner" to="/offline-tastings">
        <span>Скоро</span>
        <strong>Офлайн-дегустации</strong>
        <small>Встречи, вино и спокойное знакомство со вкусами.</small>
      </Link>

      <div className="home-page__intro home-page__intro--with-action">
        <div>
          <span>{home.project.name}</span>
          <h1>Дочь винодела</h1>
          <p>
            Сегодня в клубе, {greetingName}: один мягкий шаг, одна заметка или короткое продолжение маршрута. Без
            меню из ссылок, всё важное уже рядом.
          </p>
        </div>
        <Link className="icon-action" to="/progress" aria-label="Архив действий" title="Архив действий">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M12 8v5l3 2" />
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <path d="M3 4v5h5" />
          </svg>
        </Link>
      </div>

      <article className="home-atmosphere">
        <BottleVisual fillPercent={bottleFill} showProgressLabel={false} className="bottle-visual--home-ambient" />
        <div className="home-atmosphere__copy">
          <span>Тихий прогресс</span>
          <h2>{bottle?.title ?? "Бутылка клуба"}</h2>
          <p>Она наполняется в фоне вместе с уроками и дневником. Детали и цифры остаются внутри раздела бутылки.</p>
          <Link className="home-soft-link" to="/bottle">
            Посмотреть детали
          </Link>
        </div>
      </article>

      <Link className="home-section-link" to={nextActionHref}>
        <article className="home-hero">
          <div>
            <span>Следующий шаг</span>
            <h2>{nextAction?.title ?? home.hero.title}</h2>
          </div>
          <p>{nextAction?.description ?? "Продолжи личный маршрут: урок, квиз или первая заметка в дневнике."}</p>
          <div className="home-section-card__cta">Продолжить</div>
        </article>
      </Link>

      <section className="home-diary-panel">
        <div className="home-diary-panel__header">
          <div>
            <span>Дневник</span>
            <h2>Последние заметки</h2>
          </div>
          <Link className="ghost-action" to="/diary/new">
            Добавить
          </Link>
        </div>

        {latestNotes.length > 0 ? (
          <div className="home-note-list">
            {latestNotes.map((note) => (
              <Link className="home-note-item" key={note.id} to={`/diary/${note.id}`}>
                <strong>{note.wine_name}</strong>
                <span>{[note.country, note.region].filter(Boolean).join(", ") || note.producer || "Личная заметка"}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="home-diary-empty">
            <p>Пока нет заметок. Начни с одного вина, которое хочется запомнить.</p>
            <Link className="primary-action" to="/diary/new">
              Добавить первую заметку
            </Link>
          </div>
        )}
      </section>
    </section>
  );
}

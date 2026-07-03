import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";
import { BottleVisual } from "../bottle/BottleVisual";

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
  const sections = new Map(home.sections.map((section) => [section.key, section]));
  const myPath = sections.get("my_path");
  const bottle = sections.get("bottle");
  const nextAction = myPath?.items[0];
  const nextActionHref = nextAction?.href ?? myPath?.href ?? "/my-path";
  const bottleFill = typeof bottle?.stats.fill_percent === "number" ? bottle.stats.fill_percent : 0;

  return (
    <section className="home-page">
      <div className="home-page__intro">
        <div className="home-page__intro-header">
          <div>
            <span>{home.project.name}</span>
            <h1>Твой винный путь</h1>
          </div>
          <Link className="ghost-action" to="/progress">
            Архив действий
          </Link>
        </div>
        <p>
          Сегодня в клубе, {greetingName}: выбери один спокойный шаг. Урок, заметка или маленькое открытие — без
          перегруза и гонки за цифрами.
        </p>
      </div>

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

      <Link className="home-section-link" to="/bottle">
        <article className="home-bottle-card">
          <BottleVisual fillPercent={bottleFill} showProgressLabel={false} className="bottle-visual--home" />
          <div>
            <span>Бутылка клуба</span>
            <h3>{bottle?.title ?? "Тихий индикатор прогресса"}</h3>
            <p>
              Бутылка наполняется вместе с уроками, дневником и открытиями. На главной она остается красивой
              символической деталью, а цифры живут внутри раздела.
            </p>
            <div className="home-section-card__cta">Открыть детали</div>
          </div>
        </article>
      </Link>

      <div className="home-section-grid">
        <Link className="home-section-link" to="/taste-profile">
          <article className="home-section-card home-section-card--compact">
            <span>Профиль</span>
            <h3>Вкус и прогресс</h3>
            <p>Короткая сводка предпочтений, заметок и маршрута собрана в одном спокойном месте.</p>
            <div className="home-section-card__cta">Открыть профиль</div>
          </article>
        </Link>

        <Link className="home-section-link" to="/diary/new">
          <article className="home-section-card home-section-card--compact">
            <span>Дневник</span>
            <h3>Запомнить вино</h3>
            <p>Добавь название, пару впечатлений и вернись к деталям позже, если сейчас не хочется заполнять всё.</p>
            <div className="home-section-card__cta">Новая заметка</div>
          </article>
        </Link>

        <Link className="home-section-link" to="/discoveries">
          <article className="home-section-card home-section-card--compact">
            <span>Открытия</span>
            <h3>Лёгкие wine tips</h3>
            <p>Короткие заметки и идеи от винной девочки: для выбора, вечера и разговора за бокалом.</p>
            <div className="home-section-card__cta">Почитать</div>
          </article>
        </Link>
      </div>
    </section>
  );
}

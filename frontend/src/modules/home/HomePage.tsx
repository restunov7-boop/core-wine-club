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
  const sections = new Map(home.sections.map((section) => [section.key, section]));
  const myPath = sections.get("my_path");
  const bottle = sections.get("bottle");
  const nextAction = myPath?.items[0];
  const nextActionHref = nextAction?.href ?? myPath?.href ?? "/my-path";
  const bottleFill = typeof bottle?.stats.fill_percent === "number" ? bottle.stats.fill_percent : 0;
  const bottleUnits =
    typeof bottle?.stats.completed_units === "number" && typeof bottle?.stats.total_units === "number"
      ? `${bottle.stats.completed_units} из ${bottle.stats.total_units}`
      : null;

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
          Сегодня в клубе, {greetingName}: продолжи с того места, где остановился. Один спокойный шаг за раз.
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

      <div className="home-section-grid">
        <Link className="home-section-link" to="/bottle">
          <article className="home-section-card home-section-card--compact">
            <span>Бутылка</span>
            <h3>{bottle?.title ?? "Бутылка прогресса"}</h3>
            <p>{bottle?.description ?? "Легкий индикатор твоего движения по урокам, квизам и дневнику."}</p>
            <div className="home-stat-row">
              <div className="home-stat">
                <strong>{bottleFill}%</strong>
                <small>заполнено</small>
              </div>
              {bottleUnits && (
                <div className="home-stat">
                  <strong>{bottleUnits}</strong>
                  <small>шагов</small>
                </div>
              )}
            </div>
            <div className="home-section-card__cta">Посмотреть бутылку</div>
          </article>
        </Link>

        <Link className="home-section-link" to="/taste-profile">
          <article className="home-section-card home-section-card--compact">
            <span>Профиль</span>
            <h3>Вкус и прогресс</h3>
            <p>Статистика и личная карта вкуса теперь живут в профиле, чтобы главная оставалась легкой.</p>
            <div className="home-section-card__cta">Открыть профиль</div>
          </article>
        </Link>
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getOnboardingStatus } from "../onboarding/api";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";

import { getMyPath } from "./api";
import type { MyPathResponse } from "./types";

export function MyPathPage() {
  const navigate = useNavigate();
  const [myPath, setMyPath] = useState<MyPathResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const onboarding = await getOnboardingStatus();
        if (!mounted) {
          return;
        }

        if (!onboarding.is_completed) {
          navigate("/onboarding", { replace: true });
          return;
        }

        const response = await getMyPath();
        if (mounted) {
          setMyPath(response);
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "Не удалось загрузить мой путь");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (error) {
    return <ErrorState title="Не удалось открыть мой путь" description={error} />;
  }

  if (isLoading || !myPath) {
    return <LoadingState title="Мой путь" description="Собираем спокойный маршрут..." />;
  }

  return (
    <section className="my-path-page">
      <header className="my-path-header">
        <Link className="back-link" to="/home">
          На главную
        </Link>
        <span>Что дальше</span>
        <h1>{myPath.title}</h1>
        <p>{myPath.subtitle}</p>
      </header>

      <div className="my-path-summary-grid">
        <SummaryCard
          label="Уроки"
          value={`${myPath.summary.completed_lessons_count} из ${myPath.summary.available_lessons_count}`}
        />
        <SummaryCard
          label="Дневник"
          value={`${myPath.summary.diary_notes_count} из ${myPath.summary.diary_target_notes_count}`}
        />
        <SummaryCard
          label="Квизы"
          value={`${myPath.summary.completed_quizzes_count} из ${myPath.summary.available_quizzes_count}`}
        />
        <SummaryCard label="Бутылка" value={`${myPath.summary.bottle_fill_percent}%`} />
        <SummaryCard label="Активность" value={String(myPath.summary.recent_activity_count)} />
      </div>

      <section className="my-path-panel">
        <div className="my-path-panel__header">
          <span>Следующий шаг</span>
          <h2>Что можно сделать сейчас</h2>
        </div>
        {myPath.next_actions.length === 0 ? (
          <div className="my-path-empty">
            <h3>Маршрут пока пуст</h3>
            <p>Вернись на главную или открой уроки — там всегда есть спокойный следующий шаг.</p>
            <Link className="primary-action" to="/learn">
              Продолжить уроки
            </Link>
          </div>
        ) : (
          <div className="my-path-action-list">
            {myPath.next_actions.map((action) => (
              <Link className="my-path-action" key={action.key} to={action.href}>
                <article>
                  <strong>{action.title}</strong>
                  <p>{action.description}</p>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="my-path-panel">
        <div className="my-path-panel__header">
          <span>Твой маршрут</span>
          <h2>Разделы рядом</h2>
        </div>
        <div className="my-path-section-list">
          {myPath.sections.map((section) => (
            <Link className="my-path-section-link" key={section.key} to={section.href}>
              <article>
                <strong>{section.title}</strong>
                <p>{section.description}</p>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="my-path-summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

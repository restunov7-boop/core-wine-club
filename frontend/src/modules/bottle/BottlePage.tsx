import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { BackButton } from "../../shared/ui/BackButton";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";
import { getOnboardingStatus } from "../onboarding/api";

import { getBottleProgress } from "./api";
import { BottleVisual } from "./BottleVisual";
import type { BottleProgress } from "./types";

export function BottlePage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<BottleProgress | null>(null);
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

        const response = await getBottleProgress();
        if (mounted) {
          setProgress(response);
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "Не удалось загрузить бутылку");
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
    return <ErrorState title="Не удалось открыть бутылку" description={error} />;
  }

  if (isLoading || !progress) {
    return <LoadingState title="Моя бутылка" description="Смотрим текущий прогресс..." />;
  }

  return (
    <section className="bottle-page">
      <header className="bottle-header">
        <BackButton to="/my-path" label="Назад к маршруту" />
        <span>Wine Club</span>
        <h1>{progress.title}</h1>
        <p>{progress.subtitle}</p>
      </header>

      <article className="bottle-panel">
        <BottleVisual fillPercent={progress.fill_percent} />

        <div className="bottle-panel__content">
          <span>Что наполняет бутылку</span>
          <strong>{progress.fill_percent}%</strong>
          <p>
            Заполнено {progress.completed_units} из {progress.total_units}. Сейчас учитываются завершённые уроки, до{" "}
            {progress.breakdown.diary.target_notes_count} заметок дневника и завершённые квизы.
          </p>
          <div className="bottle-panel__stats">
            <div>
              <strong>
                {progress.breakdown.learning.completed_lessons_count} из{" "}
                {progress.breakdown.learning.available_lessons_count}
              </strong>
              <small>уроки завершены</small>
            </div>
            <div>
              <strong>
                {progress.breakdown.diary.notes_count} из {progress.breakdown.diary.target_notes_count}
              </strong>
              <small>заметки в дневнике</small>
            </div>
            <div>
              <strong>
                {progress.breakdown.quizzes.completed_quizzes_count} из{" "}
                {progress.breakdown.quizzes.available_quizzes_count}
              </strong>
              <small>квизы завершены</small>
            </div>
          </div>
          <Link className="primary-action bottle-panel__action" to={progress.next_action.href}>
            {progress.next_action.label}
          </Link>
          {progress.completed_units === 0 && (
            <p className="bottle-panel__hint">
              Сейчас бутылка пустая, и это нормальное начало. Заверши первый урок или добавь заметку, чтобы здесь
              появился первый видимый прогресс.
            </p>
          )}
        </div>
      </article>

      <section className="activity-preview-panel">
        <div className="activity-preview-panel__header">
          <div>
            <span>Недавняя активность</span>
            <h2>Что наполнило бутылку</h2>
          </div>
          <Link className="ghost-action" to="/progress">
            Вся активность
          </Link>
        </div>

        {progress.activity_preview.length === 0 ? (
          <div className="activity-preview-panel__empty">
            <p>Пока нет действий. Уроки, квизы и заметки появятся здесь, когда начнут наполнять бутылку.</p>
            <div className="empty-state__action">
              <Link className="primary-action" to="/learn">
                Начать с урока
              </Link>
              <Link className="ghost-action" to="/diary/new">
                Добавить заметку
              </Link>
            </div>
          </div>
        ) : (
          <div className="activity-preview-list">
            {progress.activity_preview.map((item) => {
              const content = (
                <article className="activity-preview-item">
                  <span>{formatActivityDate(item.occurred_at)}</span>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </article>
              );

              return item.href ? (
                <Link className="activity-preview-link" key={item.id} to={item.href}>
                  {content}
                </Link>
              ) : (
                <div key={item.id}>{content}</div>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}

function formatActivityDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

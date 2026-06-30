import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getOnboardingStatus } from "../onboarding/api";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";

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
        <span>Wine Club</span>
        <h1>{progress.title}</h1>
        <p>{progress.subtitle}</p>
      </header>

      <article className="bottle-panel">
        <BottleVisual fillPercent={progress.fill_percent} />

        <div className="bottle-panel__content">
          <span>Прогресс уроков</span>
          <strong>{progress.fill_percent}%</strong>
          <p>
            Заполнено {progress.completed_units} из {progress.total_units}
          </p>
          <div className="bottle-panel__stats">
            <div>
              <strong>{progress.breakdown.completed_lessons_count}</strong>
              <small>уроков завершено</small>
            </div>
            <div>
              <strong>{progress.breakdown.available_lessons_count}</strong>
              <small>уроков доступно</small>
            </div>
          </div>
          <Link className="primary-action bottle-panel__action" to={progress.next_action.href}>
            {progress.next_action.label}
          </Link>
        </div>
      </article>
    </section>
  );
}

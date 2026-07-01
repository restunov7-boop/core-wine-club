import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getOnboardingStatus } from "../onboarding/api";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";

import { getLearningPaths } from "./api";
import type { LearningPathListItem } from "./types";

const difficultyLabels: Record<string, string> = {
  beginner: "Новичок",
  curious: "Любопытно",
  confident: "Уверенно",
};

export function LearningPathsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<LearningPathListItem[]>([]);
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

        const response = await getLearningPaths();
        if (mounted) {
          setItems(response.items);
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "Не удалось загрузить уроки");
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
    return <ErrorState title="Не удалось открыть уроки" description={error} />;
  }

  if (isLoading) {
    return <LoadingState title="Уроки" description="Собираем короткие винные маршруты..." />;
  }

  return (
    <section className="learning-page">
      <header className="learning-header">
        <span>Wine Club</span>
        <h1>Уроки</h1>
        <p>Короткие маршруты, чтобы спокойно разобраться в вине.</p>
      </header>

      {items.length === 0 ? (
        <EmptyState
          title="Уроков пока нет"
          description="Первые маршруты появятся здесь после локального seed. Пока можно открыть главную."
          action={
            <Link className="primary-action" to="/home">
              На главную
            </Link>
          }
        />
      ) : (
        <div className="learning-list">
          {items.map((item) => (
            <Link className="learning-card" key={item.slug} to={`/learn/${item.slug}`}>
              <article>
                <div className="learning-meta">
                  <span>{difficultyLabels[item.difficulty] ?? item.difficulty}</span>
                  <span>{item.lessons_count} уроков</span>
                  <span>Завершено: {item.completed_lessons_count} из {item.lessons_count}</span>
                  {item.estimated_minutes && <span>{item.estimated_minutes} мин</span>}
                </div>
                <h2>{item.title}</h2>
                {item.subtitle && <p className="learning-card__subtitle">{item.subtitle}</p>}
                <p>{item.summary}</p>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getOnboardingStatus } from "../onboarding/api";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";

import { getLearningPath } from "./api";
import type { LearningPathDetail } from "./types";

const difficultyLabels: Record<string, string> = {
  beginner: "Новичок",
  curious: "Любопытно",
  confident: "Уверенно",
};

const lessonTypeLabels: Record<string, string> = {
  article: "Статья",
  guide: "Гид",
  ritual: "Ритуал",
};

export function LearningPathDetailPage() {
  const navigate = useNavigate();
  const { pathSlug } = useParams();
  const [path, setPath] = useState<LearningPathDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!pathSlug) {
        setError("Не указан маршрут");
        setIsLoading(false);
        return;
      }

      try {
        const onboarding = await getOnboardingStatus();
        if (!mounted) {
          return;
        }

        if (!onboarding.is_completed) {
          navigate("/onboarding", { replace: true });
          return;
        }

        const response = await getLearningPath(pathSlug);
        if (mounted) {
          setPath(response);
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "Не удалось загрузить маршрут");
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
  }, [navigate, pathSlug]);

  if (error) {
    return <ErrorState title="Не удалось открыть маршрут" description={error} />;
  }

  if (isLoading || !path) {
    return <LoadingState title="Уроки" description="Открываем маршрут..." />;
  }

  return (
    <article className="learning-detail">
      <Link className="back-link" to="/learn">
        Назад к урокам
      </Link>

      <header className="learning-detail__header">
        <div className="learning-meta">
          <span>{difficultyLabels[path.difficulty] ?? path.difficulty}</span>
          <span>{path.lessons_count} уроков</span>
          <span>Завершено: {path.completed_lessons_count} из {path.lessons_count}</span>
          {path.estimated_minutes && <span>{path.estimated_minutes} мин</span>}
        </div>
        <h1>{path.title}</h1>
        {path.subtitle && <p className="learning-card__subtitle">{path.subtitle}</p>}
        <p>{path.summary}</p>
        {path.description && <p>{path.description}</p>}
      </header>

      <div className="lesson-list">
        {path.lessons.map((lesson, index) => (
          <Link
            className="lesson-card"
            key={lesson.slug}
            to={`/learn/lessons/${lesson.slug}`}
            state={{ pathSlug: path.slug }}
          >
            <article>
              <div className="lesson-card__topline">
                <span>{index + 1}</span>
                <span>{lessonTypeLabels[lesson.lesson_type] ?? lesson.lesson_type}</span>
                {lesson.is_completed && <span>Завершён</span>}
                {lesson.estimated_minutes && <span>{lesson.estimated_minutes} мин</span>}
              </div>
              <h2>{lesson.title}</h2>
              <p>{lesson.summary}</p>
            </article>
          </Link>
        ))}
      </div>
    </article>
  );
}

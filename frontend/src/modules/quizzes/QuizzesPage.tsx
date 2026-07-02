import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getOnboardingStatus } from "../onboarding/api";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";

import { getQuizzes } from "./api";
import type { QuizListItem } from "./types";

const difficultyLabels: Record<string, string> = {
  beginner: "Новичок",
  curious: "Любопытно",
  confident: "Уверенно",
};

export function QuizzesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<QuizListItem[]>([]);
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

        const response = await getQuizzes();
        if (mounted) {
          setItems(response.items);
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "Не удалось загрузить квизы");
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
    return <ErrorState title="Не удалось открыть квизы" description={error} />;
  }

  if (isLoading) {
    return <LoadingState title="Квизы" description="Собираем короткие проверки..." />;
  }

  return (
    <section className="quizzes-page">
      <header className="quizzes-header">
        <span>Без оценок и давления</span>
        <h1>Квизы</h1>
        <p>Короткие проверки без оценок и давления.</p>
        <p>Квизы помогают закрепить уроки. Это не экзамен и не оценка.</p>
      </header>

      {items.length === 0 ? (
        <EmptyState
          title="Квизов пока нет"
          description="Первые короткие проверки появятся здесь после seed."
          action={
            <Link className="primary-action" to="/learn">
              Продолжить уроки
            </Link>
          }
        />
      ) : (
        <div className="quiz-list">
          {items.map((item) => (
            <Link className="quiz-card" key={item.slug} to={`/quizzes/${item.slug}`}>
              <article>
                <div className="quiz-meta">
                  <span>{difficultyLabels[item.difficulty] ?? item.difficulty}</span>
                  {item.estimated_minutes && <span>{item.estimated_minutes} мин</span>}
                  <span>{item.questions_count} вопросов</span>
                  <span className={item.is_completed ? "quiz-status quiz-status--complete" : "quiz-status"}>
                    {item.is_completed ? "Завершён" : "Не завершён"}
                  </span>
                </div>
                <h2>{item.title}</h2>
                {item.subtitle && <p className="quiz-card__subtitle">{item.subtitle}</p>}
                <p>{item.summary}</p>
                {!item.is_completed && <p className="quiz-card__hint">Можно пройти после уроков.</p>}
                <strong className="quiz-card__cta">Открыть квиз</strong>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

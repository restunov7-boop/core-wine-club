import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { getOnboardingStatus } from "../onboarding/api";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";

import { completeLesson, getLesson, uncompleteLesson } from "./api";
import type { LessonDetail } from "./types";

type LessonLocationState = {
  pathSlug?: string;
};

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

export function LessonDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lessonSlug } = useParams();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSavingCompletion, setIsSavingCompletion] = useState(false);
  const pathSlug = (location.state as LessonLocationState | null)?.pathSlug;
  const backTo = pathSlug ? `/learn/${pathSlug}` : "/learn";
  const backLabel = pathSlug ? "Назад к маршруту" : "Назад к урокам";

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!lessonSlug) {
        setError("Не указан урок");
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

        const response = await getLesson(lessonSlug);
        if (mounted) {
          setLesson(response);
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "Не удалось загрузить урок");
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
  }, [lessonSlug, navigate]);

  const paragraphs = useMemo(
    () => lesson?.body.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean) ?? [],
    [lesson?.body],
  );

  if (error) {
    return <ErrorState title="Не удалось открыть урок" description={error} />;
  }

  if (isLoading || !lesson) {
    return <LoadingState title="Урок" description="Открываем материал..." />;
  }

  async function handleComplete() {
    if (!lesson) {
      return;
    }

    setActionError(null);
    setIsSavingCompletion(true);
    try {
      await completeLesson(lesson.slug);
      const refreshedLesson = await getLesson(lesson.slug);
      setLesson(refreshedLesson);
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Не удалось завершить урок");
    } finally {
      setIsSavingCompletion(false);
    }
  }

  async function handleUncomplete() {
    if (!lesson) {
      return;
    }

    setActionError(null);
    setIsSavingCompletion(true);
    try {
      await uncompleteLesson(lesson.slug);
      const refreshedLesson = await getLesson(lesson.slug);
      setLesson(refreshedLesson);
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Не удалось снять отметку");
    } finally {
      setIsSavingCompletion(false);
    }
  }

  return (
    <article className="lesson-detail">
      <Link className="back-link" to={backTo}>
        {backLabel}
      </Link>

      <header className="lesson-detail__header">
        <div className="learning-meta">
          <span>{lessonTypeLabels[lesson.lesson_type] ?? lesson.lesson_type}</span>
          <span>{difficultyLabels[lesson.difficulty] ?? lesson.difficulty}</span>
          {lesson.estimated_minutes && <span>{lesson.estimated_minutes} мин</span>}
        </div>
        <h1>{lesson.title}</h1>
        {lesson.subtitle && <p className="learning-card__subtitle">{lesson.subtitle}</p>}
        <p>{lesson.summary}</p>
        <div className={lesson.is_completed ? "lesson-completion lesson-completion--done" : "lesson-completion"}>
          <strong>{lesson.is_completed ? "Урок завершён" : "Урок ещё не завершён"}</strong>
          {lesson.is_completed && lesson.completed_at && <small>Отмечено: {formatCompletionDate(lesson.completed_at)}</small>}
          <div className="lesson-completion__actions">
            {lesson.is_completed ? (
              <button className="ghost-action" type="button" onClick={handleUncomplete} disabled={isSavingCompletion}>
                {isSavingCompletion ? "Снимаем отметку..." : "Снять отметку"}
              </button>
            ) : (
              <button className="primary-action" type="button" onClick={handleComplete} disabled={isSavingCompletion}>
                {isSavingCompletion ? "Сохраняем..." : "Завершить урок"}
              </button>
            )}
          </div>
          {actionError && <small className="form-error">{actionError}</small>}
        </div>
      </header>

      <div className="lesson-body">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {lesson.next_step && (
        <section className="lesson-next-step">
          <span>Следующий шаг</span>
          <h2>{lesson.next_step.title}</h2>
          <p>{lesson.next_step.description}</p>
          <Link className="primary-action" to={lesson.next_step.href}>
            {lesson.next_step.type === "quiz" ? "Перейти к квизу" : "Открыть мой путь"}
          </Link>
        </section>
      )}
    </article>
  );
}

function formatCompletionDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

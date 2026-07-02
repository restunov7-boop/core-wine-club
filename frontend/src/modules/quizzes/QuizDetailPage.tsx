import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getOnboardingStatus } from "../onboarding/api";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";

import { checkQuiz, getQuiz } from "./api";
import type { QuizCheckItem, QuizCheckResult, QuizDetail } from "./types";

const difficultyLabels: Record<string, string> = {
  beginner: "Новичок",
  curious: "Любопытно",
  confident: "Уверенно",
};

export function QuizDetailPage() {
  const navigate = useNavigate();
  const { quizSlug } = useParams();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!quizSlug) {
        setError("Не указан квиз");
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

        const response = await getQuiz(quizSlug);
        if (mounted) {
          setQuiz(response);
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "Не удалось загрузить квиз");
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
  }, [navigate, quizSlug]);

  const resultByQuestionId = useMemo(() => {
    const output = new Map<string, QuizCheckItem>();
    result?.items.forEach((item) => output.set(item.question_id, item));
    return output;
  }, [result]);

  if (error) {
    return <ErrorState title="Не удалось открыть квиз" description={error} />;
  }

  if (isLoading || !quiz) {
    return <LoadingState title="Квиз" description="Открываем вопросы..." />;
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const canSubmit = answeredCount === quiz.questions.length && !isSubmitting && !result;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quiz || !quizSlug) {
      return;
    }

    if (answeredCount !== quiz.questions.length) {
      setActionError("Ответь на все вопросы перед проверкой.");
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    try {
      const response = await checkQuiz(
        quizSlug,
        quiz.questions.map((question) => ({
          question_id: question.id,
          selected_option_key: selectedAnswers[question.id],
        })),
      );
      setResult(response);
      if (response.is_completed) {
        setQuiz((current) =>
          current
            ? {
                ...current,
                is_completed: true,
                completed_at: response.completed_at,
              }
            : current,
        );
      }
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Не удалось проверить ответы");
    } finally {
      setIsSubmitting(false);
    }
  }

  function retry() {
    setSelectedAnswers({});
    setResult(null);
    setActionError(null);
  }

  return (
    <section className="quiz-detail-page">
      <header className="quiz-detail-header">
        <Link className="back-link" to="/quizzes">
          Назад к квизам
        </Link>
        <div className="quiz-meta">
          <span>{difficultyLabels[quiz.difficulty] ?? quiz.difficulty}</span>
          {quiz.estimated_minutes && <span>{quiz.estimated_minutes} мин</span>}
          <span>{quiz.questions.length} вопросов</span>
        </div>
        <h1>{quiz.title}</h1>
        {quiz.subtitle && <p className="quiz-card__subtitle">{quiz.subtitle}</p>}
        <p>{quiz.summary}</p>
        {quiz.description && <p>{quiz.description}</p>}
        {quiz.slug === "wine-basics-check" && (
          <Link className="quiz-related-path" to="/learn/wine-basics">
            Связано с путём: Винная база
          </Link>
        )}
      </header>

      {quiz.is_completed && (
        <section className="quiz-completed-notice" aria-live="polite">
          <span>Завершён</span>
          <h2>Квиз уже завершён</h2>
          <p>Можно пройти вопросы ещё раз для себя. Повторная идеальная проверка не создаст дубль в прогрессе.</p>
        </section>
      )}

      {result && (
        <section className="quiz-result-card" aria-live="polite">
          <span>Результат</span>
          <h2>
            {result.is_completed ? "Квиз завершён" : `Правильно ${result.correct_count} из ${result.total_questions}`}
          </h2>
          <p>
            {result.is_completed
              ? "Идеальная проверка сохранена в прогрессе. Без баллов, бейджей и оценок."
              : "Это локальная попытка: результат не сохраняется и не влияет на прогресс или бутылку."}
          </p>
          <button className="ghost-action" type="button" onClick={retry}>
            Попробовать ещё раз
          </button>
        </section>
      )}

      <form className="quiz-question-list" onSubmit={submit}>
        {quiz.questions.map((question, index) => {
          const itemResult = resultByQuestionId.get(question.id);
          const correctOption = itemResult
            ? question.options.find((option) => option.key === itemResult.correct_option_key)
            : null;

          return (
            <fieldset
              className={itemResult ? "quiz-question quiz-question--checked" : "quiz-question"}
              key={question.id}
              disabled={Boolean(result)}
            >
              <legend>
                <span>Вопрос {index + 1}</span>
                {question.prompt}
              </legend>

              <div className="quiz-options">
                {question.options.map((option) => (
                  <label className="quiz-option" key={option.key}>
                    <input
                      name={`question-${question.id}`}
                      type="radio"
                      value={option.key}
                      checked={selectedAnswers[question.id] === option.key}
                      onChange={() =>
                        setSelectedAnswers((current) => ({
                          ...current,
                          [question.id]: option.key,
                        }))
                      }
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>

              {itemResult && (
                <div className={itemResult.is_correct ? "quiz-answer-result quiz-answer-result--correct" : "quiz-answer-result"}>
                  <strong>{itemResult.is_correct ? "Верно" : "Не совсем"}</strong>
                  {correctOption && <p>Правильный ответ: {correctOption.label}</p>}
                  {itemResult.explanation && <p>{itemResult.explanation}</p>}
                </div>
              )}
            </fieldset>
          );
        })}

        {actionError && <p className="form-error" role="alert">{actionError}</p>}

        {!result && (
          <button className="primary-action" type="submit" disabled={!canSubmit}>
            {isSubmitting ? "Проверяем..." : "Проверить ответы"}
          </button>
        )}
      </form>
    </section>
  );
}

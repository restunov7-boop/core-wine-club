import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";
import { getBottleProgress } from "../bottle/api";
import type { BottleProgress } from "../bottle/types";
import { getOnboardingStatus } from "../onboarding/api";
import { getProgressSummary } from "../progress/api";
import type { ProgressSummary } from "../progress/types";

import { getTasteProfile } from "./api";
import type { TasteProfileResponse } from "./types";

export function TasteProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<TasteProfileResponse | null>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [bottle, setBottle] = useState<BottleProgress | null>(null);
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

        const [response, progressResponse, bottleResponse] = await Promise.all([
          getTasteProfile(),
          getProgressSummary(),
          getBottleProgress(),
        ]);
        if (mounted) {
          setProfile(response);
          setProgress(progressResponse);
          setBottle(bottleResponse);
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "Не удалось загрузить профиль вкуса");
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
    return <ErrorState title="Не удалось открыть профиль" description={error} />;
  }

  if (isLoading || !profile) {
    return <LoadingState title="Профиль" description="Собираем личную сводку..." />;
  }

  return (
    <section className="taste-profile-page">
      <header className="taste-profile-header">
        <span>Личный профиль</span>
        <h1>Профиль</h1>
        <p>Спокойная сводка дневника и пути. Стартовые предпочтения из онбординга больше не занимают главный блок.</p>
      </header>

      <section className="taste-summary-card">
        <h2>{profile.summary.title}</h2>
        <p>{profile.summary.description}</p>
        {profile.stats.notes_count === 0 && (
          <Link className="primary-action taste-summary-card__action" to="/diary/new">
            Добавить заметку
          </Link>
        )}
      </section>

      <section className="taste-stat-grid">
        <StatCard label="Заметок" value={String(profile.stats.notes_count)} />
        <StatCard label="Средняя оценка" value={profile.stats.average_rating ? profile.stats.average_rating.toFixed(1) : "—"} />
        <StatCard label="Купила бы снова" value={formatRatio(profile.stats.would_buy_again_ratio)} />
      </section>

      <section className="taste-profile-card taste-profile-card--placeholder">
        <span>Скоро</span>
        <h2>География вкуса</h2>
        <p>Страны и регионы требуют отдельной доработки логики, поэтому пока оставлены как аккуратный placeholder.</p>
      </section>

      <section className="taste-profile-card taste-profile-card--placeholder">
        <span>Скоро</span>
        <h2>Словарь вина</h2>
        <p>Ароматы и вкусовые слова будут лучше работать после отдельного sprint по нормализации дневника.</p>
      </section>

      <section className="taste-profile-card">
        <h2>Наблюдение</h2>
        <div className="taste-insight-list">
          {profile.insights.length > 0 ? (
            profile.insights.map((insight) => (
              <article key={insight.key} className="taste-insight">
                <h3>{insight.title}</h3>
                <p>{insight.description}</p>
              </article>
            ))
          ) : (
            <article className="taste-insight">
              <h3>Наблюдения появятся позже</h3>
              <p>Когда в дневнике станет больше заметок, здесь появятся спокойные выводы о твоём вкусе.</p>
            </article>
          )}
        </div>
      </section>

      <section className="taste-profile-card taste-profile-card--rhythm">
        <div className="taste-profile-card__header">
          <div>
            <span>Личный ритм</span>
            <h2>Прогресс</h2>
          </div>
          <Link className="ghost-action" to="/progress">
            Архив
          </Link>
        </div>
        {progress && bottle ? (
          <div className="taste-stat-grid">
            <StatCard label="Уроки" value={`Пройдено: ${progress.learning.completed_lessons_count}`} />
            <StatCard label="Квизы" value={`Пройдено: ${progress.quizzes.completed_quizzes_count}`} />
            <StatCard label="Дневник" value={`Заметок: ${progress.diary.notes_count}`} />
            <StatCard label="Бутылка" value={`${bottle.fill_percent}%`} />
          </div>
        ) : (
          <p>Прогресс появится здесь после уроков, квизов и первых заметок в дневнике.</p>
        )}
      </section>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="taste-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function formatRatio(value: number | null): string {
  if (value === null) {
    return "—";
  }
  return `${Math.round(value * 100)}%`;
}

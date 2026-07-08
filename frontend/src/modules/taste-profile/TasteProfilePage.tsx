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
import type { TasteProfileCountItem, TasteProfileResponse } from "./types";

const shelfStatusLabels: Record<string, string> = {
  want_to_try: "Хочу попробовать",
  tried: "Пробовала",
  liked: "Понравилось",
  not_for_me: "Не моё",
  buy_again: "Купить снова",
};

const styleLabels: Record<string, string> = {
  red: "Красное",
  white: "Белое",
  rose: "Розе",
  sparkling: "Игристое",
  orange: "Оранжевое",
  dessert: "Десертное",
  unknown: "Не указано",
};

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

  const hasTopItems =
    profile.stats.countries_tried.length > 0 ||
    profile.stats.regions_tried.length > 0 ||
    profile.stats.top_grapes.length > 0 ||
    profile.stats.top_styles.length > 0;
  const hasVocabulary = profile.stats.top_aroma_notes.length > 0 || profile.stats.top_taste_notes.length > 0;

  return (
    <section className="taste-profile-page">
      <header className="taste-profile-header">
        <span>Личный профиль</span>
        <h1>Профиль</h1>
        <p>Живая сводка по дневнику и винной полке. Без догадок: только то, что уже есть в твоих заметках.</p>
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
        <StatCard label="С оценкой" value={String(profile.stats.rated_notes_count)} />
        <StatCard label="Средняя оценка" value={profile.stats.average_rating === null ? "нет" : profile.stats.average_rating.toFixed(1)} />
        <StatCard label="Купить снова" value={String(profile.stats.buy_again_count)} />
      </section>

      <section className="taste-profile-card">
        <div className="taste-profile-card__header">
          <div>
            <span>Наблюдение</span>
            <h2>Что уже видно</h2>
          </div>
          <Link className="ghost-action" to="/diary/new">
            Новая заметка
          </Link>
        </div>
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
              <p>Добавь ещё несколько заметок, и профиль начнёт показывать спокойные выводы о твоём вкусе.</p>
            </article>
          )}
        </div>
      </section>

      <section className="taste-profile-card">
        <h2>Чаще всего</h2>
        {hasTopItems ? (
          <div className="taste-profile-groups">
            <CountGroup title="Страны" items={profile.stats.countries_tried} />
            <CountGroup title="Регионы" items={profile.stats.regions_tried} />
            <CountGroup title="Сорта" items={profile.stats.top_grapes} />
            <CountGroup title="Стили" items={profile.stats.top_styles} labelForKey={(key) => styleLabels[key] ?? key} />
          </div>
        ) : (
          <p>Пока мало данных. После нескольких заметок здесь появятся страны, регионы, сорта и стили, которые встречаются чаще всего.</p>
        )}
      </section>

      <section className="taste-profile-card">
        <h2>Рейтинг</h2>
        <div className="taste-stat-grid">
          <StatCard label="Средняя оценка" value={profile.stats.average_rating === null ? "нет" : profile.stats.average_rating.toFixed(1)} />
          <StatCard label="Оценённых вин" value={String(profile.stats.rated_notes_count)} />
          <StatCard label="Повторить" value={formatRatio(profile.stats.would_buy_again_ratio)} />
        </div>
        <p>Рейтинг считается только по твоим заметкам. Если оценок мало, профиль показывает это спокойно, без лишней уверенности.</p>
      </section>

      <section className="taste-profile-card">
        <div className="taste-profile-card__header">
          <div>
            <span>Винная полка</span>
            <h2>Что сохранено</h2>
          </div>
          <Link className="ghost-action" to="/diary/shelf">
            Открыть
          </Link>
        </div>
        <div className="taste-stat-grid">
          <StatCard label="Всего" value={String(profile.stats.shelf_items_count)} />
          <StatCard label="Купить снова" value={String(countByKey(profile.stats.shelf_status_counts, "buy_again"))} />
          <StatCard label="Хочу попробовать" value={String(countByKey(profile.stats.shelf_status_counts, "want_to_try"))} />
        </div>
        {profile.stats.shelf_status_counts.length > 0 ? (
          <div className="taste-chip-row">
            {profile.stats.shelf_status_counts.map((item) => (
              <span key={item.key}>
                {shelfStatusLabels[item.key] ?? item.key}: {item.count}
              </span>
            ))}
          </div>
        ) : (
          <p>Полка пока пустая. Добавь вино из заметки или сохрани бутылку, которую хочется попробовать позже.</p>
        )}
      </section>

      <section className="taste-profile-card">
        <h2>Словарь вкуса</h2>
        {hasVocabulary ? (
          <div className="taste-profile-groups">
            <CountGroup title="Ароматы" items={profile.stats.top_aroma_notes} />
            <CountGroup title="Вкус" items={profile.stats.top_taste_notes} />
          </div>
        ) : (
          <p>Когда в заметках появятся повторяющиеся слова про аромат и вкус, они соберутся здесь.</p>
        )}
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

function CountGroup({
  title,
  items,
  labelForKey,
}: {
  title: string;
  items: TasteProfileCountItem[];
  labelForKey?: (key: string) => string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <article className="taste-profile-group">
      <h3>{title}</h3>
      <div className="taste-chip-row">
        {items.map((item) => (
          <span key={item.key}>
            {labelForKey ? labelForKey(item.key) : item.key}: {item.count}
          </span>
        ))}
      </div>
    </article>
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

function countByKey(items: TasteProfileCountItem[], key: string): number {
  return items.find((item) => item.key === key)?.count ?? 0;
}

function formatRatio(value: number | null): string {
  if (value === null) {
    return "нет";
  }
  return `${Math.round(value * 100)}%`;
}

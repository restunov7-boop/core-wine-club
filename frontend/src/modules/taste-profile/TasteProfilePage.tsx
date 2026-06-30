import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getOnboardingStatus } from "../onboarding/api";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";

import { getTasteProfile } from "./api";
import type { TasteProfileCountItem, TasteProfileResponse } from "./types";

const experienceLabels: Record<string, string> = {
  beginner: "Новичок",
  curious: "Любопытно",
  confident: "Уверенно",
};

const tasteLabels: Record<string, string> = {
  red: "Красное",
  white: "Белое",
  sparkling: "Игристое",
  rose: "Розе",
  sweet: "Сладкое",
  dry: "Сухое",
  not_sure: "Пока не знаю",
};

const goalLabels: Record<string, string> = {
  understand_wine: "Понимать вино",
  choose_bottle: "Выбирать бутылку",
  build_taste: "Собрать свой вкус",
  feel_confident: "Чувствовать уверенность",
  explore_culture: "Исследовать культуру",
};

const wineColorLabels: Record<string, string> = {
  red: "Красное",
  white: "Белое",
  rose: "Розе",
  sparkling: "Игристое",
  orange: "Оранжевое",
  dessert: "Десертное",
  unknown: "Не знаю",
};

const sweetnessLabels: Record<string, string> = {
  dry: "Сухое",
  semi_dry: "Полусухое",
  semi_sweet: "Полусладкое",
  sweet: "Сладкое",
  unknown: "Не знаю",
};

export function TasteProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<TasteProfileResponse | null>(null);
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

        const response = await getTasteProfile();
        if (mounted) {
          setProfile(response);
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
    return <ErrorState title="Не удалось открыть профиль вкуса" description={error} />;
  }

  if (isLoading || !profile) {
    return <LoadingState title="Профиль вкуса" description="Собираем личную карту вкуса..." />;
  }

  return (
    <section className="taste-profile-page">
      <header className="taste-profile-header">
        <span>Личный профиль</span>
        <h1>Профиль вкуса</h1>
        <p>Личная карта твоих винных предпочтений. Она строится только на твоём онбординге и дневнике.</p>
      </header>

      <section className="taste-summary-card">
        <h2>{profile.summary.title}</h2>
        <p>{profile.summary.description}</p>
        {profile.stats.notes_count === 0 && (
          <Link className="primary-action taste-summary-card__action" to="/diary/new">
            Добавить первую заметку
          </Link>
        )}
      </section>

      <section className="taste-profile-card">
        <h2>Стартовые предпочтения</h2>
        <div className="taste-chip-row">
          {profile.onboarding.wine_experience_level && (
            <span>{experienceLabels[profile.onboarding.wine_experience_level] ?? profile.onboarding.wine_experience_level}</span>
          )}
          {profile.onboarding.taste_preferences.map((item) => (
            <span key={item}>{tasteLabels[item] ?? item}</span>
          ))}
          {profile.onboarding.goals.map((item) => (
            <span key={item}>{goalLabels[item] ?? item}</span>
          ))}
          {!profile.onboarding.wine_experience_level &&
            profile.onboarding.taste_preferences.length === 0 &&
            profile.onboarding.goals.length === 0 && <span>Онбординг пока без предпочтений</span>}
        </div>
      </section>

      <section className="taste-stat-grid">
        <StatCard label="Заметок" value={String(profile.stats.notes_count)} />
        <StatCard label="Средняя оценка" value={profile.stats.average_rating ? profile.stats.average_rating.toFixed(1) : "—"} />
        <StatCard label="Купил бы снова" value={formatRatio(profile.stats.would_buy_again_ratio)} />
      </section>

      <ProfileListCard title="Любимые стили" groups={[
        { label: "Цвет", items: profile.stats.favorite_wine_colors, labels: wineColorLabels },
        { label: "Сладость", items: profile.stats.sweetness_distribution, labels: sweetnessLabels },
      ]} />

      <ProfileListCard title="Словарь вкуса" groups={[
        { label: "Ароматы", items: profile.stats.top_aroma_notes },
        { label: "Вкус", items: profile.stats.top_taste_notes },
      ]} />

      <ProfileListCard title="География" groups={[
        { label: "Страны", items: profile.stats.countries_tried },
        { label: "Регионы", items: profile.stats.regions_tried },
      ]} />

      <section className="taste-profile-card">
        <h2>Инсайты</h2>
        <div className="taste-insight-list">
          {profile.insights.map((insight) => (
            <article key={insight.key} className="taste-insight">
              <h3>{insight.title}</h3>
              <p>{insight.description}</p>
            </article>
          ))}
        </div>
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

function ProfileListCard({
  title,
  groups,
}: {
  title: string;
  groups: Array<{ label: string; items: TasteProfileCountItem[]; labels?: Record<string, string> }>;
}) {
  return (
    <section className="taste-profile-card">
      <h2>{title}</h2>
      <div className="taste-profile-groups">
        {groups.map((group) => (
          <div className="taste-profile-group" key={group.label}>
            <h3>{group.label}</h3>
            {group.items.length > 0 ? (
              <div className="taste-chip-row">
                {group.items.map((item) => (
                  <span key={item.key}>
                    {group.labels?.[item.key] ?? item.key} · {item.count}
                  </span>
                ))}
              </div>
            ) : (
              <p>Пока нет данных</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function formatRatio(value: number | null): string {
  if (value === null) {
    return "—";
  }
  return `${Math.round(value * 100)}%`;
}

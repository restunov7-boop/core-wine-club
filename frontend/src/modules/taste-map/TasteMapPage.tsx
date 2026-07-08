import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";
import { getTasteProfile } from "../taste-profile/api";
import type { TasteProfileCountItem, TasteProfileResponse } from "../taste-profile/types";

const styleLabels: Record<string, string> = {
  red: "Красное",
  white: "Белое",
  rose: "Розе",
  sparkling: "Игристое",
  orange: "Оранжевое",
  dessert: "Десертное",
  fortified: "Креплёное",
  unknown: "Не указано",
};

export function TasteMapPage() {
  const [profile, setProfile] = useState<TasteProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const response = await getTasteProfile();
        if (mounted) {
          setProfile(response);
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "Не удалось загрузить географию вкуса");
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
  }, []);

  if (error) {
    return <ErrorState title="География вкуса недоступна" description={error} />;
  }

  if (isLoading || !profile) {
    return <LoadingState title="География вкуса" description="Собираем страны, регионы и стили..." />;
  }

  const hasMapData = profile.stats.countries_tried.length > 0 || profile.stats.regions_tried.length > 0;

  return (
    <section className="taste-map-page">
      <header className="taste-map-header">
        <span>Карта вкуса</span>
        <h1>География вкуса</h1>
        <p>Спокойная карта без настоящей карты: страны, регионы, сорта и стили из твоего дневника и винной полки.</p>
      </header>

      <section className="taste-map-stat-grid">
        <StatCard label="Стран" value={String(profile.stats.countries_tried.length)} />
        <StatCard label="Регионов" value={String(profile.stats.regions_tried.length)} />
        <StatCard label="Заметок" value={String(profile.stats.notes_count)} />
        <StatCard label="На полке" value={String(profile.stats.shelf_items_count)} />
      </section>

      {hasMapData ? (
        <>
          <section className="taste-map-card">
            <div className="taste-map-card__header">
              <div>
                <span>География</span>
                <h2>Страны и регионы</h2>
              </div>
              <Link className="ghost-action" to="/diary/new">
                Добавить заметку
              </Link>
            </div>
            <CountList title="Страны" items={profile.stats.countries_tried} />
            <CountList title="Регионы" items={profile.stats.regions_tried} />
          </section>

          <section className="taste-map-card">
            <h2>Что рядом с географией</h2>
            <div className="taste-map-columns">
              <CountList title="Сорта" items={profile.stats.top_grapes} />
              <CountList title="Стили" items={profile.stats.top_styles} labelForKey={(key) => styleLabels[key] ?? key} />
            </div>
          </section>
        </>
      ) : (
        <section className="empty-state taste-map-empty">
          <span>Пока пусто</span>
          <h2>Карта появится после первых заметок</h2>
          <p>Укажи страну или регион в дневнике, и здесь начнёт собираться твоя личная география вкуса.</p>
          <Link className="primary-action empty-state__action" to="/diary/new">
            Добавить заметку
          </Link>
        </section>
      )}
    </section>
  );
}

function CountList({
  title,
  items,
  labelForKey,
}: {
  title: string;
  items: TasteProfileCountItem[];
  labelForKey?: (key: string) => string;
}) {
  if (items.length === 0) {
    return (
      <article className="taste-map-list">
        <h3>{title}</h3>
        <p>Пока нет данных.</p>
      </article>
    );
  }

  return (
    <article className="taste-map-list">
      <h3>{title}</h3>
      <div className="taste-map-chip-row">
        {items.map((item) => (
          <span key={item.key}>
            {labelForKey ? labelForKey(item.key) : item.key}
            <strong>{item.count}</strong>
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

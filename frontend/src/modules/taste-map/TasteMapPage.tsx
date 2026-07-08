import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";
import { getTasteProfile } from "../taste-profile/api";
import type { TasteProfileCountItem, TasteProfileResponse } from "../taste-profile/types";

import { getNextWineCountries, getOpenedWineCountries, wineCountries, type WineCountry } from "./data/wineCountries";
import { TasteWorldMap } from "./TasteWorldMap";

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

  const openedCountries = useMemo(
    () => (profile ? getOpenedWineCountries(profile.stats.countries_tried) : []),
    [profile],
  );
  const nextCountries = useMemo(() => getNextWineCountries(openedCountries), [openedCountries]);

  if (error) {
    return <ErrorState title="География вкуса недоступна" description={error} />;
  }

  if (isLoading || !profile) {
    return <LoadingState title="География вкуса" description="Собираем страны, регионы и карту..." />;
  }

  const hasOpenedCountries = openedCountries.length > 0;

  return (
    <section className="taste-map-page">
      <header className="taste-map-header">
        <span>Винная карта мира</span>
        <h1>География вкуса</h1>
        <p>Страны закрашиваются, когда в дневнике или полке появляется вино из этой страны. Это твоя личная винная карта, без внешних карт и лишней тяжести.</p>
      </header>

      <section className="taste-map-card taste-map-card--world">
        <div className="taste-map-card__header">
          <div>
            <span>Карта</span>
            <h2>Открытые страны</h2>
          </div>
          <Link className="ghost-action" to="/diary/new">
            Добавить
          </Link>
        </div>
        <TasteWorldMap openedCountries={openedCountries} />
        {!hasOpenedCountries && (
          <div className="taste-map-map-note">
            <h3>Карта начнёт закрашиваться после первой заметки</h3>
            <p>Укажи страну в дневнике или добавь вино на полку, и первая точка появится на карте.</p>
          </div>
        )}
      </section>

      <section className="taste-map-stat-grid">
        <StatCard label="Открыто стран" value={`${openedCountries.length} / ${wineCountries.length}`} />
        <StatCard label="Регионов" value={String(profile.stats.regions_tried.length)} />
        <StatCard label="Заметок" value={String(profile.stats.notes_count)} />
        <StatCard label="В полке" value={String(profile.stats.shelf_items_count)} />
      </section>

      {hasOpenedCountries ? (
        <section className="taste-map-card">
          <div className="taste-map-card__header">
            <div>
              <span>Коллекция</span>
              <h2>Уже открыто</h2>
            </div>
          </div>
          <div className="taste-country-grid">
            {openedCountries.map((country) => (
              <article key={country.code} className="taste-country-card">
                <span>{country.regionGroup}</span>
                <h3>{country.label}</h3>
                <p>{country.count} {pluralizeRecords(country.count)}</p>
                <small>{country.commonWineHint}</small>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="empty-state taste-map-empty">
          <span>Пока пусто</span>
          <h2>Открой первую страну</h2>
          <p>Добавь заметку с Францией, Италией, Грузией или любой другой страной, и карта начнёт оживать.</p>
          <Link className="primary-action empty-state__action" to="/diary/new">
            Добавить заметку
          </Link>
        </section>
      )}

      <section className="taste-map-card">
        <div className="taste-map-card__header">
          <div>
            <span>Следующая страна для карты</span>
            <h2>Что можно открыть дальше</h2>
          </div>
          <Link className="ghost-action" to="/diary/new">
            Записать бокал
          </Link>
        </div>
        <div className="taste-country-grid taste-country-grid--suggested">
          {nextCountries.map((country) => (
            <SuggestedCountry key={country.code} country={country} />
          ))}
        </div>
      </section>

      <section className="taste-map-card">
        <h2>Регионы и стили</h2>
        <div className="taste-map-columns">
          <CountList title="Регионы" items={profile.stats.regions_tried} />
          <CountList title="Сорта" items={profile.stats.top_grapes} />
          <CountList title="Стили" items={profile.stats.top_styles} labelForKey={(key) => styleLabels[key] ?? key} />
        </div>
      </section>
    </section>
  );
}

function SuggestedCountry({ country }: { country: WineCountry }) {
  return (
    <article className="taste-country-card taste-country-card--suggested">
      <span>{country.regionGroup}</span>
      <h3>{country.label}</h3>
      <p>{country.commonWineHint}</p>
    </article>
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

function pluralizeRecords(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return "запись";
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "записи";
  }
  return "записей";
}

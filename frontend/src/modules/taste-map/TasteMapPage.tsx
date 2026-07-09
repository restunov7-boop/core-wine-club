import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";
import { getTasteProfile } from "../taste-profile/api";
import type { TasteProfileCountItem, TasteProfileResponse } from "../taste-profile/types";

import { getNextWineCountries, getOpenedWineCountries, wineCountries, type OpenedWineCountry, type WineCountry } from "./data/wineCountries";
import {
  getRegionProgress,
  getTasteMapAchievements,
  regionGroupLabels,
  type RegionProgress,
  type TasteMapAchievement,
} from "./tasteMapGamification";
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
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);

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
  const regionProgress = useMemo(() => getRegionProgress(openedCountries), [openedCountries]);
  const achievements = useMemo(() => getTasteMapAchievements(openedCountries), [openedCountries]);
  const selectedCountry = openedCountries.find((country) => country.code === selectedCountryCode) ?? null;

  if (error) {
    return <ErrorState title="География вкуса недоступна" description={error} />;
  }

  if (isLoading || !profile) {
    return <LoadingState title="География вкуса" description="Обновляем карту по дневнику и винной полке..." />;
  }

  const hasOpenedCountries = openedCountries.length > 0;
  const nextGoalCount = Math.min(wineCountries.length, openedCountries.length + 3);
  const countriesToNextGoal = Math.max(0, nextGoalCount - openedCountries.length);
  const nextGoalCopy = hasOpenedCountries
    ? countriesToNextGoal > 0
      ? `открыть ещё ${countriesToNextGoal}`
      : "вся карта открыта"
    : "открой первую страну";
  const hasAnySourceData = profile.stats.notes_count > 0 || profile.stats.shelf_items_count > 0;

  return (
    <section className="taste-map-page">
      <header className="taste-map-header">
        <span>Винная карта мира</span>
        <h1>География вкуса</h1>
        <p>Страны открываются, когда в дневнике или винной полке появляется вино из этой страны.</p>
      </header>

      <section className="taste-map-card taste-map-card--world">
        <div className="taste-map-card__header">
          <div>
            <span>Карта</span>
            <h2>Континенты и открытые страны</h2>
          </div>
          <Link className="ghost-action" to="/diary/new">
            Добавить
          </Link>
        </div>
        <TasteWorldMap
          openedCountries={openedCountries}
          selectedCountryCode={selectedCountryCode ?? undefined}
          onSelectCountry={(country) => setSelectedCountryCode(country.code)}
        />
        <div className="taste-map-progress-panel">
          <div>
            <span>Открыто стран</span>
            <strong>{openedCountries.length} / {wineCountries.length}</strong>
          </div>
          <div>
            <span>Следующая цель</span>
            <strong>{nextGoalCopy}</strong>
          </div>
        </div>
        <p className="taste-map-source-note">
          Карта собирается по заметкам дневника и винной полке. Если заметки удалены, страна может оставаться открытой, пока на полке есть вино из этой страны.
        </p>
        {!hasOpenedCountries && (
          <div className="taste-map-map-note">
            <h3>Карта начнёт заполняться после первой страны</h3>
            <p>Укажи страну в дневнике или добавь вино на полку, и первая точка появится на карте.</p>
          </div>
        )}
      </section>

      <CountryDetail country={selectedCountry} hasOpenedCountries={hasOpenedCountries} />

      <section className="taste-map-stat-grid">
        <StatCard label="Регионов" value={String(profile.stats.regions_tried.length)} />
        <StatCard label="Заметок" value={String(profile.stats.notes_count)} />
        <StatCard label="В полке" value={String(profile.stats.shelf_items_count)} />
        <StatCard label="Поддержано стран" value={String(wineCountries.length)} />
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
              <button
                key={country.code}
                className={
                  country.code === selectedCountryCode
                    ? "taste-country-card taste-country-card--button taste-country-card--selected"
                    : "taste-country-card taste-country-card--button"
                }
                type="button"
                onClick={() => setSelectedCountryCode(country.code)}
              >
                <span>{regionGroupLabels[country.regionGroup]}</span>
                <h3>{country.label}</h3>
                <p>{country.count} {pluralizeRecords(country.count)}</p>
                <small>{country.commonWineHint}</small>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="empty-state taste-map-empty">
          <span>{hasAnySourceData ? "Страна не указана" : "Пока пусто"}</span>
          <h2>Карта начнёт заполняться после первой страны</h2>
          <p>
            {hasAnySourceData
              ? "В дневнике или полке уже есть данные, но страна пока не распознана. Добавь страну к заметке или полке, чтобы открыть первую точку."
              : "Добавь заметку с Францией, Италией, Грузией или любой другой страной, и карта начнёт оживать."}
          </p>
          <Link className="primary-action empty-state__action" to="/diary/new">
            Добавить заметку
          </Link>
        </section>
      )}

      <section className="taste-map-card">
        <div className="taste-map-card__header">
          <div>
            <span>Континенты</span>
            <h2>Прогресс по регионам</h2>
          </div>
        </div>
        <RegionProgressList items={regionProgress} />
      </section>

      <section className="taste-map-card taste-map-card--achievements">
        <div className="taste-map-card__header">
          <div>
            <span>Достижения</span>
            <h2>Маленькие вехи карты</h2>
          </div>
        </div>
        <AchievementGrid items={achievements} />
      </section>

      <section className="taste-map-card taste-map-card--next">
        <div className="taste-map-card__header">
          <div>
            <span>Следующие страны</span>
            <h2>Что можно открыть дальше</h2>
          </div>
          <Link className="ghost-action" to="/diary/new">
            Записать бокал
          </Link>
        </div>
        <p>Добавь заметку с вином из этой страны, и она появится на карте.</p>
        <div className="taste-country-grid taste-country-grid--suggested">
          {nextCountries.map((country) => (
            <SuggestedCountry key={country.code} country={country} />
          ))}
        </div>
      </section>

      <section className="taste-map-card taste-map-card--secondary">
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

function CountryDetail({
  country,
  hasOpenedCountries,
}: {
  country: OpenedWineCountry | null;
  hasOpenedCountries: boolean;
}) {
  return (
    <section className="taste-map-card taste-map-card--selected-country">
      <div className="taste-map-card__header">
        <div>
          <span>Деталь страны</span>
          <h2>{country ? country.label : "Открытая страна"}</h2>
        </div>
        <Link className="ghost-action" to="/diary/new">
          Добавить заметку
        </Link>
      </div>
      {country ? (
        <div className="taste-country-detail">
          <span>{regionGroupLabels[country.regionGroup]}</span>
          <strong>{country.count} {pluralizeRecords(country.count)}</strong>
          <p>{country.commonWineHint}</p>
        </div>
      ) : (
        <p className="taste-map-muted">
          {hasOpenedCountries
            ? "Выбери открытую страну на карте или в списке."
            : "Первая деталь появится, когда в дневнике или винной полке будет страна."}
        </p>
      )}
    </section>
  );
}

function SuggestedCountry({ country }: { country: WineCountry }) {
  return (
    <article className="taste-country-card taste-country-card--suggested">
      <span>{regionGroupLabels[country.regionGroup]}</span>
      <h3>{country.label}</h3>
      <p>{country.commonWineHint}</p>
      <Link className="ghost-action taste-country-card__action" to="/diary/new">
        Добавить заметку
      </Link>
    </article>
  );
}

function RegionProgressList({ items }: { items: RegionProgress[] }) {
  return (
    <div className="taste-region-grid">
      {items.map((item) => (
        <article key={item.key} className={item.opened > 0 ? "taste-region-card taste-region-card--active" : "taste-region-card"}>
          <span>{item.label}</span>
          <strong>{item.opened} / {item.total}</strong>
        </article>
      ))}
    </div>
  );
}

function AchievementGrid({ items }: { items: TasteMapAchievement[] }) {
  return (
    <div className="taste-achievement-grid">
      {items.map((item) => (
        <article key={item.key} className={item.achieved ? "taste-achievement-card taste-achievement-card--done" : "taste-achievement-card"}>
          <span>{item.achieved ? "Открыто" : `${item.progress} / ${item.target}`}</span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </article>
      ))}
    </div>
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

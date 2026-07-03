import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";
import { getOnboardingStatus } from "../onboarding/api";

import { getTastingNotes } from "./api";
import type { TastingNoteListItem } from "./types";

const colorLabels: Record<string, string> = {
  red: "Красное",
  white: "Белое",
  rose: "Розе",
  sparkling: "Игристое",
  orange: "Оранжевое",
  dessert: "Десертное",
  unknown: "Не знаю",
};

export function DiaryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<TastingNoteListItem[]>([]);
  const [total, setTotal] = useState(0);
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

        const response = await getTastingNotes();
        if (mounted) {
          setItems(response.items);
          setTotal(response.total);
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "Не удалось загрузить дневник");
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
    return <ErrorState title="Не удалось открыть дневник" description={error} />;
  }

  if (isLoading) {
    return <LoadingState title="Дневник вкуса" description="Открываем твои личные заметки..." />;
  }

  const ratedCount = items.filter((item) => item.rating !== null).length;
  const repeatCount = items.filter((item) => item.would_buy_again).length;

  return (
    <section className="diary-page">
      <header className="diary-header">
        <div className="diary-header__content">
          <span>Личный журнал</span>
          <h1>Дневник вкуса</h1>
          <p>Структурированные записи о винах: происхождение, стиль, впечатления и маленькие детали, которые легко забыть.</p>
        </div>
        <Link className="primary-action diary-header__action" to="/diary/new">
          Добавить заметку
        </Link>
      </header>

      <section className="diary-summary-strip" aria-label="Сводка дневника">
        <SummaryCell label="Записей" value={String(total)} />
        <SummaryCell label="С оценкой" value={String(ratedCount)} />
        <SummaryCell label="Повторила бы" value={String(repeatCount)} />
      </section>

      <aside className="diary-shelf-placeholder">
        <span>Скоро</span>
        <h2>Винная полка</h2>
        <p>Будущий раздел для сохранённых бутылок. Сейчас это аккуратная страница-закладка в журнале, без новой логики.</p>
      </aside>

      {total === 0 ? (
        <EmptyState
          title="Дневник пока чистый"
          description="Здесь будут личные заметки о винах: что пробовала, что понравилось, что хочется повторить. Начать можно с любого бокала, без идеальной структуры."
          action={
            <>
              <Link className="primary-action" to="/diary/new">
                Добавить первую заметку
              </Link>
              <Link className="ghost-action" to="/home">
                На главную
              </Link>
            </>
          }
        />
      ) : (
        <div className="diary-list">
          {items.map((item) => (
            <Link className="diary-note-card" key={item.id} to={`/diary/${item.id}`}>
              <article>
                <div className="diary-note-card__row">
                  <div>
                    <span className="diary-note-card__label">{item.tasted_at ? formatDate(item.tasted_at) : "Без даты"}</span>
                    <h2>{item.wine_name}</h2>
                  </div>
                  {item.rating && <strong className="diary-rating">{item.rating}/5</strong>}
                </div>
                {item.producer && <p>{item.producer}</p>}
                <div className="diary-note-card__topline">
                  {(item.country || item.region) && <span>{[item.country, item.region].filter(Boolean).join(", ")}</span>}
                  {item.wine_color && <span>{colorLabels[item.wine_color] ?? item.wine_color}</span>}
                  {item.would_buy_again !== null && <span>{item.would_buy_again ? "Повторила бы" : "Не повторю"}</span>}
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

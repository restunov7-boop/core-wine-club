import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getOnboardingStatus } from "../onboarding/api";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";

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

  return (
    <section className="diary-page">
      <header className="diary-header">
        <span>Только для тебя</span>
        <h1>Дневник вкуса</h1>
        <p>Твои личные заметки о винах. Только для тебя.</p>
        <Link className="primary-action diary-header__action" to="/diary/new">
          Новая заметка
        </Link>
      </header>

      {total === 0 ? (
        <EmptyState
          title="Пока здесь пусто"
          description="Сохрани первое впечатление: название вина, пару слов о вкусе и желание купить снова."
          action={
            <Link className="primary-action" to="/diary/new">
              Добавить первую заметку
            </Link>
          }
        />
      ) : (
        <div className="diary-list">
          {items.map((item) => (
            <Link className="diary-note-card" key={item.id} to={`/diary/${item.id}`}>
              <article>
                <div className="diary-note-card__topline">
                  {item.rating && <span>{item.rating}/5</span>}
                  {item.wine_color && <span>{colorLabels[item.wine_color] ?? item.wine_color}</span>}
                  {item.would_buy_again !== null && <span>{item.would_buy_again ? "Купил бы снова" : "Не повторю"}</span>}
                </div>
                <h2>{item.wine_name}</h2>
                {item.producer && <p>{item.producer}</p>}
                {(item.country || item.region) && (
                  <small>
                    {[item.country, item.region].filter(Boolean).join(", ")}
                  </small>
                )}
                {item.tasted_at && <small>{formatDate(item.tasted_at)}</small>}
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

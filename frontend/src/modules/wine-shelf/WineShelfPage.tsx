import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { BackButton } from "../../shared/ui/BackButton";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";
import { wineSuggestions, type WineSuggestion } from "../diary/data/wineSuggestions";
import { getOnboardingStatus } from "../onboarding/api";

import { createShelfItem, deleteShelfItem, listShelfItems, updateShelfItem } from "./api";
import type { WineShelfItem, WineShelfItemPayload, WineShelfStatus } from "./types";

const statusLabels: Record<WineShelfStatus, string> = {
  want_to_try: "Хочу попробовать",
  tried: "Пробовала",
  liked: "Понравилось",
  not_for_me: "Не моё",
  buy_again: "Купить снова",
};

const statusOptions: WineShelfStatus[] = ["want_to_try", "tried", "liked", "not_for_me", "buy_again"];

type ShelfFilter = "all" | WineShelfStatus;

type ShelfFormState = {
  wine_name: string;
  country: string;
  region: string;
  grape: string;
  style: string;
  status: WineShelfStatus;
  personal_note: string;
};

const emptyForm: ShelfFormState = {
  wine_name: "",
  country: "",
  region: "",
  grape: "",
  style: "",
  status: "want_to_try",
  personal_note: "",
};

export function WineShelfPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<WineShelfItem[]>([]);
  const [filter, setFilter] = useState<ShelfFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState<ShelfFormState>(emptyForm);
  const [drafts, setDrafts] = useState<Record<string, { status: WineShelfStatus; personal_note: string }>>({});

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

        const response = await listShelfItems(filter === "all" ? undefined : filter);
        if (mounted) {
          setItems(response.items);
          setDrafts(Object.fromEntries(response.items.map((item) => [item.id, draftFromItem(item)])));
          setError(null);
        }
      } catch (caught) {
        if (mounted) {
          const message = caught instanceof Error ? caught.message : "Не удалось открыть винную полку";
          setError(`${message}. Полка почти готова, но в production может понадобиться обновить базу данных.`);
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
  }, [filter, navigate]);

  const matchingSuggestions = useMemo(() => {
    const query = form.wine_name.trim().toLowerCase();
    if (query.length < 2) {
      return [];
    }

    return wineSuggestions
      .filter((suggestion) => {
        const searchable = [suggestion.name, suggestion.country, suggestion.region, suggestion.grape, suggestion.style ?? ""];
        return searchable.some((value) => value.toLowerCase().includes(query));
      })
      .slice(0, 6);
  }, [form.wine_name]);

  async function reload() {
    const response = await listShelfItems(filter === "all" ? undefined : filter);
    setItems(response.items);
    setDrafts(Object.fromEntries(response.items.map((item) => [item.id, draftFromItem(item)])));
  }

  function updateForm<Key extends keyof ShelfFormState>(key: Key, value: ShelfFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function applySuggestion(suggestion: WineSuggestion) {
    setForm((current) => ({
      ...current,
      wine_name: suggestion.name,
      country: suggestion.country,
      region: suggestion.region,
      grape: suggestion.grape,
      style: suggestion.style ?? "",
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setNotice(null);
    setError(null);
    try {
      await createShelfItem(payloadFromForm(form));
      setForm(emptyForm);
      await reload();
      setNotice("Вино добавлено на полку.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось добавить вино на полку");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveItem(item: WineShelfItem) {
    const draft = drafts[item.id];
    if (!draft) {
      return;
    }

    setNotice(null);
    setError(null);
    try {
      await updateShelfItem(item.id, {
        status: draft.status,
        personal_note: optionalText(draft.personal_note),
      });
      await reload();
      setNotice("Полка обновлена.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось обновить полку");
    }
  }

  async function removeItem(item: WineShelfItem) {
    if (!window.confirm(`Убрать "${item.wine_name}" с винной полки?`)) {
      return;
    }

    setNotice(null);
    setError(null);
    try {
      await deleteShelfItem(item.id);
      await reload();
      setNotice("Вино убрано с полки.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось удалить вино с полки");
    }
  }

  if (isLoading) {
    return <LoadingState title="Винная полка" description="Открываем личную полку..." />;
  }

  return (
    <section className="wine-shelf-page">
      <header className="wine-shelf-header">
        <BackButton to="/diary" label="Назад к дневнику" />
        <span>Личная полка</span>
        <h1>Винная полка</h1>
        <p>Место для вин, которые хочется попробовать, запомнить, повторить или аккуратно отложить как “не моё”.</p>
      </header>

      {error && (
        <ErrorState
          title="Полка почти готова"
          description={error}
          action={
            <button className="ghost-action state-card__action" type="button" onClick={() => window.location.reload()}>
              Обновить
            </button>
          }
        />
      )}

      {notice && <p className="wine-shelf-notice">{notice}</p>}

      <section className="wine-shelf-form-panel">
        <div className="wine-shelf-form-panel__header">
          <span>Добавить</span>
          <h2>Вино на полку</h2>
        </div>

        <form className="wine-shelf-form" onSubmit={submit}>
          <label>
            <span>Название вина *</span>
            <input
              className="text-input"
              required
              value={form.wine_name}
              placeholder="Etna Rosso"
              autoComplete="off"
              onChange={(event) => updateForm("wine_name", event.target.value)}
            />
          </label>

          {matchingSuggestions.length > 0 && (
            <div className="wine-autocomplete" aria-label="Wine shelf suggestions">
              {matchingSuggestions.map((suggestion) => (
                <button
                  className="wine-autocomplete__item"
                  key={`${suggestion.name}-${suggestion.region}-${suggestion.grape}`}
                  type="button"
                  onClick={() => applySuggestion(suggestion)}
                >
                  <strong>{suggestion.name}</strong>
                  <span>{[suggestion.country, suggestion.region, suggestion.grape, suggestion.style].filter(Boolean).join(" · ")}</span>
                </button>
              ))}
            </div>
          )}

          <div className="form-grid">
            <TextField label="Страна" value={form.country} onChange={(value) => updateForm("country", value)} />
            <TextField label="Регион" value={form.region} onChange={(value) => updateForm("region", value)} />
            <TextField label="Сорт" value={form.grape} onChange={(value) => updateForm("grape", value)} />
            <TextField label="Стиль" value={form.style} onChange={(value) => updateForm("style", value)} />
          </div>

          <label>
            <span>Статус</span>
            <select className="select-input" value={form.status} onChange={(event) => updateForm("status", event.target.value as WineShelfStatus)}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Заметка</span>
            <textarea
              className="textarea-input"
              value={form.personal_note}
              rows={3}
              placeholder="Почему хочется попробовать или повторить?"
              onChange={(event) => updateForm("personal_note", event.target.value)}
            />
          </label>

          <button className="primary-action" type="submit" disabled={isSaving || !form.wine_name.trim()}>
            {isSaving ? "Добавляем..." : "Добавить на полку"}
          </button>
        </form>
      </section>

      <section className="wine-shelf-filter-panel" aria-label="Фильтр винной полки">
        <button className={filter === "all" ? "choice-chip choice-chip--active" : "choice-chip"} type="button" onClick={() => setFilter("all")}>
          Все
        </button>
        {statusOptions.map((status) => (
          <button
            className={filter === status ? "choice-chip choice-chip--active" : "choice-chip"}
            key={status}
            type="button"
            onClick={() => setFilter(status)}
          >
            {statusLabels[status]}
          </button>
        ))}
      </section>

      {items.length === 0 ? (
        <EmptyState
          title={filter === "all" ? "Полка пока пустая" : "В этом статусе пока ничего нет"}
          description="Добавь вино, которое хочется попробовать, запомнить или купить снова. Полка сохранится в аккаунте и будет доступна между сессиями."
          action={
            <Link className="ghost-action" to="/diary">
              Вернуться в дневник
            </Link>
          }
        />
      ) : (
        <div className="wine-shelf-list">
          {items.map((item) => {
            const draft = drafts[item.id] ?? draftFromItem(item);
            return (
              <article className="wine-shelf-card" key={item.id}>
                <div className="wine-shelf-card__header">
                  <div>
                    <span>{statusLabels[item.status]}</span>
                    <h2>{item.wine_name}</h2>
                  </div>
                  {item.diary_note_id && (
                    <Link className="ghost-action" to={`/diary/${item.diary_note_id}`}>
                      Заметка
                    </Link>
                  )}
                </div>

                <div className="diary-note-card__topline">
                  {[item.country, item.region].filter(Boolean).length > 0 && <span>{[item.country, item.region].filter(Boolean).join(", ")}</span>}
                  {item.grape && <span>{item.grape}</span>}
                  {item.style && <span>{item.style}</span>}
                </div>

                {item.personal_note && <p>{item.personal_note}</p>}

                <div className="wine-shelf-card__edit">
                  <label>
                    <span>Статус</span>
                    <select
                      className="select-input"
                      value={draft.status}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [item.id]: { ...draft, status: event.target.value as WineShelfStatus },
                        }))
                      }
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Заметка</span>
                    <textarea
                      className="textarea-input"
                      value={draft.personal_note}
                      rows={2}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [item.id]: { ...draft, personal_note: event.target.value },
                        }))
                      }
                    />
                  </label>
                  <div className="wine-shelf-card__actions">
                    <button className="primary-action" type="button" onClick={() => saveItem(item)}>
                      Сохранить
                    </button>
                    <button className="ghost-action" type="button" onClick={() => removeItem(item)}>
                      Убрать
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span>{label}</span>
      <input className="text-input" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function draftFromItem(item: WineShelfItem): { status: WineShelfStatus; personal_note: string } {
  return {
    status: item.status,
    personal_note: item.personal_note ?? "",
  };
}

function payloadFromForm(form: ShelfFormState): WineShelfItemPayload {
  return {
    wine_name: form.wine_name.trim(),
    country: optionalText(form.country),
    region: optionalText(form.region),
    grape: optionalText(form.grape),
    style: optionalText(form.style),
    status: form.status,
    personal_note: optionalText(form.personal_note),
  };
}

function optionalText(value: string): string | null {
  const cleaned = value.trim();
  return cleaned || null;
}

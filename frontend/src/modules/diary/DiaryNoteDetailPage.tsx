import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getOnboardingStatus } from "../onboarding/api";
import { BackButton } from "../../shared/ui/BackButton";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";

import { deleteTastingNote, getTastingNote } from "./api";
import type { TastingNoteDetail } from "./types";
import { createShelfItem, listShelfItems } from "../wine-shelf/api";
import type { WineShelfStatus } from "../wine-shelf/types";

const colorLabels: Record<string, string> = {
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

export function DiaryNoteDetailPage() {
  const navigate = useNavigate();
  const { noteId } = useParams();
  const [note, setNote] = useState<TastingNoteDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [shelfItemId, setShelfItemId] = useState<string | null>(null);
  const [shelfMessage, setShelfMessage] = useState<string | null>(null);
  const [isAddingToShelf, setIsAddingToShelf] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!noteId) {
        setError("Не указана заметка");
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

        const response = await getTastingNote(noteId);
        if (mounted) {
          setNote(response);
        }
        const shelf = await listShelfItems(undefined, 100).catch(() => null);
        const linkedShelfItem = shelf?.items.find((item) => item.diary_note_id === response.id);
        if (mounted && linkedShelfItem) {
          setShelfItemId(linkedShelfItem.id);
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "Не удалось открыть заметку");
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
  }, [navigate, noteId]);

  async function remove() {
    if (!noteId) {
      return;
    }

    setIsDeleting(true);
    setActionError(null);
    try {
      await deleteTastingNote(noteId);
      navigate("/diary", { replace: true });
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Не удалось удалить заметку");
      setIsDeleting(false);
    }
  }

  async function addToShelf() {
    if (!note) {
      return;
    }

    setIsAddingToShelf(true);
    setActionError(null);
    setShelfMessage(null);
    try {
      const item = await createShelfItem({
        diary_note_id: note.id,
        wine_name: note.wine_name,
        country: note.country,
        region: note.region,
        grape: note.grape,
        style: note.wine_color ? colorLabels[note.wine_color] : null,
        status: shelfStatusFromNote(note),
        personal_note: note.personal_note,
      });
      setShelfItemId(item.id);
      setShelfMessage("Добавлено в винную полку.");
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Не удалось добавить вино в полку");
    } finally {
      setIsAddingToShelf(false);
    }
  }

  if (error) {
    return (
      <ErrorState
        title="Заметка не открылась"
        description={error}
        action={
          <Link className="primary-action state-card__action" to="/diary">
            Вернуться в дневник
          </Link>
        }
      />
    );
  }

  if (isLoading) {
    return <LoadingState title="Дневник вкуса" description="Открываем заметку..." />;
  }

  if (!note) {
    return (
      <EmptyState
        title="Заметка не найдена"
        description="Возможно, она была удалена или ссылка устарела. Дневник рядом, можно вернуться к списку заметок."
        action={
          <Link className="primary-action" to="/diary">
            Вернуться в дневник
          </Link>
        }
      />
    );
  }

  const hasIdentityDetails = Boolean(note.producer || note.grape || note.vintage || note.wine_color);
  const hasOriginDetails = Boolean(note.country || note.region || note.tasted_at || note.occasion || note.price_text || note.pairing);
  const hasTastingDetails = Boolean(
    note.sweetness ||
      note.rating ||
      note.would_buy_again !== null ||
      note.aroma_notes?.length ||
      note.taste_notes?.length,
  );

  return (
    <article className="diary-detail">
      <BackButton to="/diary" label="Назад к дневнику" />

      <header className="diary-detail__header">
        <div className="diary-note-card__topline">
          {note.wine_color && <span>{colorLabels[note.wine_color] ?? note.wine_color}</span>}
          {note.tasted_at && <span>{formatDate(note.tasted_at)}</span>}
          {note.rating && <span>{note.rating}/5</span>}
        </div>
        <h1>{note.wine_name}</h1>
        {note.producer && <p>{note.producer}</p>}
      </header>

      {hasIdentityDetails && (
        <section className="diary-entry-section">
          <div className="diary-entry-section__header">
            <span>Wine identity</span>
            <h2>Бутылка</h2>
          </div>
          <div className="diary-detail-grid">
            <Field label="Производитель" value={note.producer} />
            <Field label="Сорт" value={note.grape} />
            <Field label="Винтаж" value={note.vintage ? String(note.vintage) : null} />
            <Field label="Стиль" value={note.wine_color ? colorLabels[note.wine_color] : null} />
          </div>
        </section>
      )}

      {hasOriginDetails && (
        <section className="diary-entry-section">
          <div className="diary-entry-section__header">
            <span>Origin</span>
            <h2>Место и контекст</h2>
          </div>
          <div className="diary-detail-grid">
            <Field label="Страна" value={note.country} />
            <Field label="Регион" value={note.region} />
            <Field label="Дата" value={note.tasted_at ? formatDate(note.tasted_at) : null} />
            <Field label="Повод" value={note.occasion} />
            <Field label="Цена" value={note.price_text} />
            <Field label="Сочетание" value={note.pairing} />
          </div>
        </section>
      )}

      {hasTastingDetails && (
        <section className="diary-entry-section">
          <div className="diary-entry-section__header">
            <span>Tasting</span>
            <h2>Вкус и ощущения</h2>
          </div>
          <div className="diary-detail-grid">
            <Field label="Сладость" value={note.sweetness ? sweetnessLabels[note.sweetness] : null} />
            <Field label="Оценка" value={note.rating ? `${note.rating}/5` : null} />
            <Field label="Повторила бы" value={note.would_buy_again === null ? null : note.would_buy_again ? "Да" : "Нет"} />
          </div>
          <NoteList title="Ароматы" items={note.aroma_notes} />
          <NoteList title="Вкус" items={note.taste_notes} />
        </section>
      )}

      {note.personal_note && (
        <section className="diary-entry-section diary-entry-section--note">
          <div className="diary-entry-section__header">
            <span>Personal note</span>
            <h2>Личная заметка</h2>
          </div>
          <div className="diary-note-text">
            <p>{note.personal_note}</p>
          </div>
        </section>
      )}

      <section className="diary-entry-section diary-entry-section--shelf">
        <div className="diary-entry-section__header">
          <span>Wine Shelf</span>
          <h2>Винная полка</h2>
        </div>
        <p>Сохрани это вино отдельно от заметки, чтобы быстро найти его в списке “хочу попробовать”, “понравилось” или “купить снова”.</p>
        <div className="diary-actions">
          {shelfItemId ? (
            <Link className="primary-action" to="/diary/shelf">
              Открыть в полке
            </Link>
          ) : (
            <button className="primary-action" type="button" disabled={isAddingToShelf} onClick={addToShelf}>
              {isAddingToShelf ? "Добавляем..." : "Добавить в полку"}
            </button>
          )}
          {shelfMessage && <small>{shelfMessage}</small>}
        </div>
      </section>

      <div className="diary-actions">
        <Link className="primary-action" to={`/diary/${note.id}/edit`}>
          Редактировать
        </Link>
        {!showConfirm ? (
          <button className="ghost-action" type="button" onClick={() => setShowConfirm(true)}>
            Удалить
          </button>
        ) : (
          <>
            <button className="ghost-action" type="button" onClick={() => setShowConfirm(false)}>
              Оставить
            </button>
            <button className="danger-action" type="button" disabled={isDeleting} onClick={remove}>
              {isDeleting ? "Удаляем..." : "Удалить заметку"}
            </button>
          </>
        )}
        {actionError && <small className="form-error">{actionError}</small>}
      </div>
    </article>
  );
}

function shelfStatusFromNote(note: TastingNoteDetail): WineShelfStatus {
  if (note.would_buy_again) {
    return "buy_again";
  }
  if (note.rating && note.rating >= 4) {
    return "liked";
  }
  if (note.rating && note.rating <= 2) {
    return "not_for_me";
  }
  return "tried";
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) {
    return null;
  }

  return (
    <div className="diary-field">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function NoteList({ title, items }: { title: string; items: string[] | null }) {
  if (!items?.length) {
    return null;
  }

  return (
    <section className="diary-note-text">
      <h2>{title}</h2>
      <div className="diary-chip-row">
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
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

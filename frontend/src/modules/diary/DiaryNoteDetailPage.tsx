import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getOnboardingStatus } from "../onboarding/api";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";

import { deleteTastingNote, getTastingNote } from "./api";
import type { TastingNoteDetail } from "./types";

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
    setError(null);
    try {
      await deleteTastingNote(noteId);
      navigate("/diary", { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось удалить заметку");
      setIsDeleting(false);
    }
  }

  if (error) {
    return <ErrorState title="Не удалось открыть заметку" description={error} />;
  }

  if (isLoading || !note) {
    return <LoadingState title="Дневник вкуса" description="Открываем заметку..." />;
  }

  return (
    <article className="diary-detail">
      <Link className="back-link" to="/diary">
        Назад к дневнику
      </Link>

      <header className="diary-detail__header">
        <div className="diary-note-card__topline">
          {note.rating && <span>{note.rating}/5</span>}
          {note.wine_color && <span>{colorLabels[note.wine_color] ?? note.wine_color}</span>}
          {note.tasted_at && <span>{formatDate(note.tasted_at)}</span>}
        </div>
        <h1>{note.wine_name}</h1>
        {note.producer && <p>{note.producer}</p>}
        {(note.country || note.region) && <p>{[note.country, note.region].filter(Boolean).join(", ")}</p>}
      </header>

      <div className="diary-detail-grid">
        <Field label="Сорт" value={note.grape} />
        <Field label="Винтаж" value={note.vintage ? String(note.vintage) : null} />
        <Field label="Сладость" value={note.sweetness ? sweetnessLabels[note.sweetness] : null} />
        <Field label="Повод" value={note.occasion} />
        <Field label="Цена" value={note.price_text} />
        <Field label="Сочетание" value={note.pairing} />
        <Field label="Купил бы снова" value={note.would_buy_again === null ? null : note.would_buy_again ? "Да" : "Нет"} />
      </div>

      <NoteList title="Ароматы" items={note.aroma_notes} />
      <NoteList title="Вкус" items={note.taste_notes} />

      {note.personal_note && (
        <section className="diary-note-text">
          <h2>Личная заметка</h2>
          <p>{note.personal_note}</p>
        </section>
      )}

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
      </div>
    </article>
  );
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

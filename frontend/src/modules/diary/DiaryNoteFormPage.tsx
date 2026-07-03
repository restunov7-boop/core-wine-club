import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { BackButton } from "../../shared/ui/BackButton";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";
import { getOnboardingStatus } from "../onboarding/api";

import { createTastingNote, getTastingNote, updateTastingNote } from "./api";
import { DiaryNoteForm, emptyDiaryNoteForm, formFromNote, payloadFromForm } from "./DiaryNoteForm";
import type { DiaryNoteFormState } from "./DiaryNoteForm";

export function DiaryNoteFormPage() {
  const navigate = useNavigate();
  const { noteId } = useParams();
  const isEditing = Boolean(noteId);
  const backTo = isEditing && noteId ? `/diary/${noteId}` : "/diary";
  const backLabel = isEditing ? "Назад к заметке" : "Назад к дневнику";
  const [form, setForm] = useState<DiaryNoteFormState>(emptyDiaryNoteForm);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

        if (noteId) {
          const note = await getTastingNote(noteId);
          if (mounted) {
            setForm(formFromNote(note));
          }
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "Не удалось открыть форму");
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

  async function submit() {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = payloadFromForm(form);
      const note = noteId ? await updateTastingNote(noteId, payload) : await createTastingNote(payload);
      navigate(`/diary/${note.id}`, { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось сохранить заметку");
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <LoadingState title="Дневник вкуса" description="Готовим форму заметки..." />;
  }

  if (isEditing && error && !form.wine_name) {
    return (
      <ErrorState
        title="Не удалось открыть форму"
        description={error}
        action={
          <Link className="primary-action state-card__action" to="/diary">
            Вернуться в дневник
          </Link>
        }
      />
    );
  }

  return (
    <section className="diary-page">
      <header className="diary-header">
        <BackButton to={backTo} label={backLabel} />
        <span>{isEditing ? "Редактирование" : "Новая запись"}</span>
        <h1>{isEditing ? "Редактировать заметку" : "Новая заметка"}</h1>
        <p>
          Достаточно названия и пары честных слов. Остальные поля можно заполнить сейчас или вернуться к ним позже.
        </p>
      </header>

      {error && <p className="form-error" role="alert">{error}</p>}

      <DiaryNoteForm
        form={form}
        isSubmitting={isSubmitting}
        submitLabel={isEditing ? "Сохранить изменения" : "Добавить заметку"}
        onChange={setForm}
        onSubmit={submit}
      />
    </section>
  );
}

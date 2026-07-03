import { useMemo, type FormEvent } from "react";

import { wineSuggestions, type WineSuggestion } from "./data/wineSuggestions";
import type { Sweetness, TastingNoteDetail, TastingNotePayload, WineColor } from "./types";

export type DiaryNoteFormState = {
  wine_name: string;
  producer: string;
  country: string;
  region: string;
  grape: string;
  vintage: string;
  wine_color: "" | WineColor;
  sweetness: "" | Sweetness;
  rating: string;
  occasion: string;
  price_text: string;
  tasted_at: string;
  aroma_notes: string;
  taste_notes: string;
  pairing: string;
  personal_note: string;
  would_buy_again: boolean;
};

type DiaryNoteFormProps = {
  form: DiaryNoteFormState;
  isSubmitting: boolean;
  submitLabel: string;
  onChange: (next: DiaryNoteFormState) => void;
  onSubmit: () => void;
};

export const emptyDiaryNoteForm: DiaryNoteFormState = {
  wine_name: "",
  producer: "",
  country: "",
  region: "",
  grape: "",
  vintage: "",
  wine_color: "",
  sweetness: "",
  rating: "",
  occasion: "",
  price_text: "",
  tasted_at: "",
  aroma_notes: "",
  taste_notes: "",
  pairing: "",
  personal_note: "",
  would_buy_again: false,
};

export function formFromNote(note: TastingNoteDetail): DiaryNoteFormState {
  return {
    wine_name: note.wine_name,
    producer: note.producer ?? "",
    country: note.country ?? "",
    region: note.region ?? "",
    grape: note.grape ?? "",
    vintage: note.vintage ? String(note.vintage) : "",
    wine_color: note.wine_color ?? "",
    sweetness: note.sweetness ?? "",
    rating: note.rating ? String(note.rating) : "",
    occasion: note.occasion ?? "",
    price_text: note.price_text ?? "",
    tasted_at: note.tasted_at ? note.tasted_at.slice(0, 10) : "",
    aroma_notes: note.aroma_notes?.join(", ") ?? "",
    taste_notes: note.taste_notes?.join(", ") ?? "",
    pairing: note.pairing ?? "",
    personal_note: note.personal_note ?? "",
    would_buy_again: note.would_buy_again ?? false,
  };
}

export function payloadFromForm(form: DiaryNoteFormState): TastingNotePayload {
  return {
    wine_name: form.wine_name.trim(),
    producer: optionalText(form.producer),
    country: optionalText(form.country),
    region: optionalText(form.region),
    grape: optionalText(form.grape),
    vintage: optionalNumber(form.vintage),
    wine_color: form.wine_color || null,
    sweetness: form.sweetness || null,
    rating: optionalNumber(form.rating),
    occasion: optionalText(form.occasion),
    price_text: optionalText(form.price_text),
    tasted_at: optionalText(form.tasted_at),
    aroma_notes: splitNotes(form.aroma_notes),
    taste_notes: splitNotes(form.taste_notes),
    pairing: optionalText(form.pairing),
    personal_note: optionalText(form.personal_note),
    would_buy_again: form.would_buy_again,
  };
}

export function DiaryNoteForm({ form, isSubmitting, submitLabel, onChange, onSubmit }: DiaryNoteFormProps) {
  const matchingSuggestions = useMemo(() => {
    const query = form.wine_name.trim().toLowerCase();
    if (query.length < 2) {
      return [];
    }

    return wineSuggestions
      .filter((suggestion) => {
        const searchable = [suggestion.name, suggestion.country, suggestion.region, suggestion.grape];
        if (suggestion.style) {
          searchable.push(suggestion.style);
        }

        return searchable.some((value) => value.toLowerCase().includes(query));
      })
      .slice(0, 6);
  }, [form.wine_name]);

  function update<Key extends keyof DiaryNoteFormState>(key: Key, value: DiaryNoteFormState[Key]) {
    onChange({ ...form, [key]: value });
  }

  function applySuggestion(suggestion: WineSuggestion) {
    onChange({
      ...form,
      wine_name: suggestion.name,
      country: suggestion.country,
      region: suggestion.region,
      grape: suggestion.grape,
    });
  }

  function updateWineName(value: string) {
    const suggestion = wineSuggestions.find((item) => item.name.toLowerCase() === value.trim().toLowerCase());
    if (suggestion) {
      applySuggestion(suggestion);
      return;
    }

    update("wine_name", value);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="diary-form" onSubmit={submit}>
      <section className="diary-form-section diary-form-section--identity">
        <div className="diary-form-section__header">
          <span>Бутылка</span>
          <h2>Что пробовала?</h2>
          <p>Начни с названия вина. Подсказки помогут быстро заполнить страну, регион и сорт, если вино есть в демо-каталоге.</p>
        </div>

        <label>
          <span>Название вина *</span>
          <input
            className="text-input"
            required
            value={form.wine_name}
            placeholder="Chianti Classico"
            autoComplete="off"
            onChange={(event) => updateWineName(event.target.value)}
          />
          <small className="field-hint">Достаточно названия. Остальные детали можно заполнить сейчас или вернуться к ним позже.</small>
        </label>

        {matchingSuggestions.length > 0 && (
          <div className="wine-autocomplete" aria-label="Wine suggestions">
            {matchingSuggestions.map((suggestion) => (
              <button
                className="wine-autocomplete__item"
                key={`${suggestion.name}-${suggestion.region}`}
                type="button"
                onClick={() => applySuggestion(suggestion)}
              >
                <strong>{suggestion.name}</strong>
                <span>
                  {[suggestion.country, suggestion.region, suggestion.grape, suggestion.style].filter(Boolean).join(" · ")}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="form-grid">
          <TextField label="Производитель" value={form.producer} onChange={(value) => update("producer", value)} />
          <TextField label="Винтаж" type="number" value={form.vintage} onChange={(value) => update("vintage", value)} />
        </div>
      </section>

      <section className="diary-form-section diary-form-section--origin">
        <div className="diary-form-section__header">
          <span>Происхождение</span>
          <h2>Откуда оно?</h2>
          <p>Страна, регион и сорт помогают потом находить похожие вина и замечать свой вкус.</p>
        </div>

        <div className="form-grid">
          <TextField label="Страна" value={form.country} onChange={(value) => update("country", value)} />
          <TextField label="Регион" value={form.region} onChange={(value) => update("region", value)} />
          <TextField label="Сорт или blend" value={form.grape} onChange={(value) => update("grape", value)} />
          <TextField label="Дата дегустации" type="date" value={form.tasted_at} onChange={(value) => update("tasted_at", value)} />
        </div>
      </section>

      <section className="diary-form-section diary-form-section--taste">
        <div className="diary-form-section__header">
          <span>Вкус</span>
          <h2>Что почувствовала?</h2>
          <p>Пиши простыми словами: яблоко, мёд, свежесть, терпкость, сливочность. Это личный дневник, не экзамен.</p>
        </div>

        <div className="form-grid">
          <label>
            <span>Стиль вина</span>
            <select className="select-input" value={form.wine_color} onChange={(event) => update("wine_color", event.target.value as DiaryNoteFormState["wine_color"])}>
              <option value="">Не указано</option>
              <option value="red">Красное</option>
              <option value="white">Белое</option>
              <option value="rose">Розе</option>
              <option value="sparkling">Игристое</option>
              <option value="orange">Оранжевое</option>
              <option value="dessert">Десертное</option>
              <option value="unknown">Не знаю</option>
            </select>
          </label>

          <label>
            <span>Сладость</span>
            <select className="select-input" value={form.sweetness} onChange={(event) => update("sweetness", event.target.value as DiaryNoteFormState["sweetness"])}>
              <option value="">Не указано</option>
              <option value="dry">Сухое</option>
              <option value="semi_dry">Полусухое</option>
              <option value="semi_sweet">Полусладкое</option>
              <option value="sweet">Сладкое</option>
              <option value="unknown">Не знаю</option>
            </select>
          </label>
        </div>

        <TextField label="Ароматы через запятую" placeholder="ягоды, ваниль, цитрус" value={form.aroma_notes} onChange={(value) => update("aroma_notes", value)} />
        <TextField label="Вкус через запятую" placeholder="свежее, мягкое, терпкое" value={form.taste_notes} onChange={(value) => update("taste_notes", value)} />
        <TextField label="С чем хорошо сочеталось" value={form.pairing} onChange={(value) => update("pairing", value)} />
      </section>

      <section className="diary-form-section diary-form-section--impression">
        <div className="diary-form-section__header">
          <span>Впечатление</span>
          <h2>Насколько понравилось?</h2>
          <p>Оценка и “повторила бы” нужны только для тебя: чтобы потом быстро вспомнить удачные бутылки.</p>
        </div>

        <div className="form-grid">
          <label>
            <span>Оценка</span>
            <select className="select-input" value={form.rating} onChange={(event) => update("rating", event.target.value)}>
              <option value="">Без оценки</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </label>
          <TextField label="Повод" value={form.occasion} onChange={(value) => update("occasion", value)} />
          <TextField label="Цена" value={form.price_text} onChange={(value) => update("price_text", value)} />
        </div>

        <label className="toggle-row">
          <input
            type="checkbox"
            checked={form.would_buy_again}
            onChange={(event) => update("would_buy_again", event.target.checked)}
          />
          <span>Повторила бы это вино</span>
        </label>
      </section>

      <section className="diary-form-section diary-form-section--personal">
        <div className="diary-form-section__header">
          <span>Личная заметка</span>
          <h2>Что хочется запомнить?</h2>
        </div>

        <label>
          <span>Заметка</span>
          <textarea
            className="textarea-input"
            value={form.personal_note}
            rows={5}
            placeholder="Например: взяла к ужину, понравилась свежесть и лёгкая минеральность."
            onChange={(event) => update("personal_note", event.target.value)}
          />
        </label>
      </section>

      <section className="diary-form-section diary-form-section--photo">
        <div className="diary-form-section__header">
          <span>Фото</span>
          <h2>Этикетка или момент</h2>
          <p>Загрузка появится позже. Пока это аккуратное место-подсказка, чтобы не забыть сфотографировать бутылку.</p>
        </div>
        <div className="diary-photo-placeholder" aria-hidden="true">
          <span>+</span>
          <small>Фото будет здесь</small>
        </div>
      </section>

      <button className="primary-action" type="submit" disabled={isSubmitting || !form.wine_name.trim()}>
        {isSubmitting ? "Сохраняем..." : submitLabel}
      </button>
    </form>
  );
}

function TextField({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <input
        className="text-input"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function optionalText(value: string): string | null {
  const cleaned = value.trim();
  return cleaned || null;
}

function optionalNumber(value: string): number | null {
  if (!value.trim()) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function splitNotes(value: string): string[] | null {
  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : null;
}

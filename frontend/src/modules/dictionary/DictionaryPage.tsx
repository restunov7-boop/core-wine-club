import { useMemo, useState } from "react";

import { wineDictionary, type WineDictionaryCategory } from "./data/wineDictionary";

const categories: Array<WineDictionaryCategory | "все"> = ["все", "вкус", "стиль", "виноград", "процесс", "этикетка/регион"];

export function DictionaryPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<WineDictionaryCategory | "все">("все");

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return wineDictionary.filter((entry) => {
      const matchesCategory = category === "все" || entry.category === category;
      const matchesQuery =
        !normalizedQuery ||
        entry.title.toLowerCase().includes(normalizedQuery) ||
        entry.category.toLowerCase().includes(normalizedQuery) ||
        entry.definition.toLowerCase().includes(normalizedQuery) ||
        entry.example.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <section className="dictionary-page">
      <header className="dictionary-header">
        <span>Быстрая опора</span>
        <h1>Словарь вина</h1>
        <p>Короткие объяснения без занудства. Можно открыть перед покупкой, дегустацией или новой заметкой.</p>
      </header>

      <section className="dictionary-tools">
        <label>
          <span>Поиск</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Кислотность, рислинг, дуб..."
          />
        </label>
        <div className="dictionary-category-row" aria-label="Категории словаря">
          {categories.map((item) => (
            <button
              key={item}
              className={item === category ? "choice-chip choice-chip--active" : "choice-chip"}
              type="button"
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {filteredEntries.length > 0 ? (
        <section className="dictionary-list" aria-label="Термины словаря">
          {filteredEntries.map((entry) => (
            <article key={entry.slug} className="dictionary-card">
              <div className="dictionary-card__header">
                <h2>{entry.title}</h2>
                <span>{entry.category}</span>
              </div>
              <p>{entry.definition}</p>
              <div className="dictionary-example">
                <span>Пример</span>
                <p>{entry.example}</p>
              </div>
              {entry.related && entry.related.length > 0 && (
                <div className="taste-chip-row">
                  {entry.related.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>
      ) : (
        <section className="empty-state dictionary-empty">
          <span>Ничего не найдено</span>
          <h2>Такого термина пока нет</h2>
          <p>Попробуй другое слово или открой категорию целиком. Этот словарь будет расти постепенно.</p>
        </section>
      )}
    </section>
  );
}

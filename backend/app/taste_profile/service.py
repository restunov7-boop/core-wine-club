from __future__ import annotations

from collections import Counter
from collections.abc import Iterable

from sqlalchemy.orm import Session

from app.diary.models import TastingNote
from app.projects.models import ProjectUser
from app.taste_profile.schemas import (
    TasteProfileCountItem,
    TasteProfileInsight,
    TasteProfileOnboarding,
    TasteProfilePreview,
    TasteProfileResponse,
    TasteProfileStats,
    TasteProfileSummary,
)
from app.wine_shelf.models import WineShelfItem

COUNT_LIMIT = 5
INSIGHT_LIMIT = 4

WINE_COLOR_LABELS = {
    "red": "красные",
    "white": "белые",
    "rose": "розе",
    "sparkling": "игристые",
    "orange": "оранжевые",
    "dessert": "десертные",
    "unknown": "пока не определённые",
}

STYLE_ALIASES = {
    "red": "red",
    "красное": "red",
    "красные": "red",
    "white": "white",
    "белое": "white",
    "белые": "white",
    "rose": "rose",
    "rosé": "rose",
    "розе": "rose",
    "sparkling": "sparkling",
    "игристое": "sparkling",
    "игристые": "sparkling",
    "orange": "orange",
    "оранжевое": "orange",
    "оранжевые": "orange",
    "dessert": "dessert",
    "десертное": "dessert",
    "десертные": "dessert",
    "fortified": "fortified",
    "креплёное": "fortified",
    "крепленое": "fortified",
    "креплёные": "fortified",
    "крепленые": "fortified",
}


def build_taste_profile(db: Session, project_user: ProjectUser) -> TasteProfileResponse:
    notes = _list_owned_notes(db, project_user)
    shelf_items = _list_owned_shelf_items(db, project_user)
    onboarding = _build_onboarding(project_user)
    stats = _build_stats(notes, shelf_items)
    summary = _build_summary(stats.notes_count)
    insights = _build_insights(stats, onboarding)

    return TasteProfileResponse(
        summary=summary,
        onboarding=onboarding,
        stats=stats,
        insights=insights,
    )


def build_taste_profile_preview(db: Session, project_user: ProjectUser) -> TasteProfilePreview:
    notes = _list_owned_notes(db, project_user)
    stats = _build_stats(notes, [])
    return TasteProfilePreview(notes_count=stats.notes_count, average_rating=stats.average_rating)


def _list_owned_notes(db: Session, project_user: ProjectUser) -> list[TastingNote]:
    return (
        db.query(TastingNote)
        .filter(
            TastingNote.project_id == project_user.project_id,
            TastingNote.project_user_id == project_user.id,
            TastingNote.visibility == "private",
        )
        .all()
    )


def _list_owned_shelf_items(db: Session, project_user: ProjectUser) -> list[WineShelfItem]:
    return (
        db.query(WineShelfItem)
        .filter(
            WineShelfItem.project_id == project_user.project_id,
            WineShelfItem.project_user_id == project_user.id,
        )
        .all()
    )


def _build_onboarding(project_user: ProjectUser) -> TasteProfileOnboarding:
    data = project_user.onboarding_data_json or {}
    return TasteProfileOnboarding(
        wine_experience_level=_clean_optional_string(data.get("wine_experience_level")),
        taste_preferences=_clean_string_list(data.get("taste_preferences")),
        goals=_clean_string_list(data.get("goals")),
    )


def _build_stats(notes: list[TastingNote], shelf_items: list[WineShelfItem]) -> TasteProfileStats:
    ratings = [note.rating for note in notes if note.rating is not None]
    would_buy_again_answers = [note.would_buy_again for note in notes if note.would_buy_again is not None]
    buy_again_note_ids = {note.id for note in notes if note.would_buy_again is True}
    note_buy_again_count = len(buy_again_note_ids)
    shelf_buy_again_count = sum(
        1
        for item in shelf_items
        if item.status == "buy_again" and (item.diary_note_id is None or item.diary_note_id not in buy_again_note_ids)
    )

    average_rating = round(sum(ratings) / len(ratings), 2) if ratings else None
    would_buy_again_ratio = (
        round(sum(1 for value in would_buy_again_answers if value) / len(would_buy_again_answers), 2)
        if would_buy_again_answers
        else None
    )

    return TasteProfileStats(
        notes_count=len(notes),
        rated_notes_count=len(ratings),
        average_rating=average_rating,
        would_buy_again_ratio=would_buy_again_ratio,
        buy_again_count=note_buy_again_count + shelf_buy_again_count,
        shelf_items_count=len(shelf_items),
        favorite_wine_colors=_counter_items(note.wine_color for note in notes),
        sweetness_distribution=_counter_items(note.sweetness for note in notes),
        top_aroma_notes=_counter_items(_flatten_note_lists(note.aroma_notes_json for note in notes), normalize=True),
        top_taste_notes=_counter_items(_flatten_note_lists(note.taste_notes_json for note in notes), normalize=True),
        top_grapes=_counter_items([*(note.grape for note in notes), *(item.grape for item in shelf_items)]),
        top_styles=_counter_items(
            _normalize_style(value) for value in [*(note.wine_color for note in notes), *(item.style for item in shelf_items)]
        ),
        countries_tried=_counter_items([*(note.country for note in notes), *(item.country for item in shelf_items)]),
        regions_tried=_counter_items([*(note.region for note in notes), *(item.region for item in shelf_items)]),
        shelf_status_counts=_counter_items(item.status for item in shelf_items),
    )


def _build_summary(notes_count: int) -> TasteProfileSummary:
    if notes_count == 0:
        return TasteProfileSummary(
            title="Твой вкус только начинает складываться",
            description="Добавь ещё несколько заметок, и здесь появятся первые наблюдения по странам, сортам, стилям и винам, которые хочется повторить.",
        )

    return TasteProfileSummary(
        title="Твой вкус начинает складываться",
        description="Первые закономерности уже видны по дневнику и винной полке. Они мягкие и будут уточняться с каждой новой заметкой.",
    )


def _build_insights(stats: TasteProfileStats, onboarding: TasteProfileOnboarding) -> list[TasteProfileInsight]:
    insights: list[TasteProfileInsight] = []

    if stats.notes_count == 0:
        insights.append(
            TasteProfileInsight(
                key="first_note_next",
                title="Добавь первую заметку",
                description="Добавь ещё несколько заметок, и здесь появятся первые наблюдения.",
            )
        )
        if onboarding.taste_preferences:
            insights.append(
                TasteProfileInsight(
                    key="onboarding_preferences",
                    title="Первые ориентиры уже есть",
                    description="Онбординг сохранил стартовые предпочтения. Дневник поможет проверить их на реальных винах.",
                )
            )
        return insights[:INSIGHT_LIMIT]

    insights.append(
        TasteProfileInsight(
            key="diary_started",
            title="Ты уже начала собирать личную карту вкуса",
            description="Каждая заметка помогает видеть, какие вина ближе по первым впечатлениям.",
        )
    )

    if stats.countries_tried:
        top_country = stats.countries_tried[0]
        insights.append(
            TasteProfileInsight(
                key="top_country",
                title="Появляется география вкуса",
                description=f"Чаще всего в дневнике и полке встречается {top_country.key}.",
            )
        )

    if stats.average_rating is not None and stats.average_rating >= 4:
        insights.append(
            TasteProfileInsight(
                key="high_average_rating",
                title="Оценки выглядят уверенно",
                description=f"В среднем ты ставишь винам {stats.average_rating:.1f} — похоже, выбираешь довольно удачно.",
            )
        )

    dominant_color = _dominant_item(stats.favorite_wine_colors, stats.notes_count)
    if dominant_color is not None:
        label = WINE_COLOR_LABELS.get(dominant_color.key, dominant_color.key)
        insights.append(
            TasteProfileInsight(
                key="dominant_wine_color",
                title="Появляется повторяющийся стиль",
                description=f"Похоже, в дневнике чаще встречаются {label} вина. Это пока мягкий ориентир, не правило.",
            )
        )

    if stats.buy_again_count > 0:
        insights.append(
            TasteProfileInsight(
                key="would_buy_again",
                title="Есть вина, к которым хочется вернуться",
                description="У тебя уже есть вина, которые хочется купить снова.",
            )
        )

    repeated_tags = [item.key for item in [*stats.top_aroma_notes[:2], *stats.top_taste_notes[:2]]]
    if repeated_tags:
        insights.append(
            TasteProfileInsight(
                key="repeated_vocabulary",
                title="Начинает появляться личный словарь вкуса",
                description=f"В заметках повторяются слова: {', '.join(repeated_tags[:3])}. Со временем это поможет точнее выбирать стиль.",
            )
        )

    return insights[:INSIGHT_LIMIT]


def _counter_items(values: Iterable[str | None] | Iterable[str], normalize: bool = False) -> list[TasteProfileCountItem]:
    cleaned: list[str] = []
    for value in values:
        if not isinstance(value, str):
            continue
        item = value.strip()
        if not item:
            continue
        cleaned.append(item.lower() if normalize else item)

    counter = Counter(cleaned)
    ordered = sorted(counter.items(), key=lambda item: (-item[1], item[0].lower()))
    return [TasteProfileCountItem(key=key, count=count) for key, count in ordered[:COUNT_LIMIT]]


def _normalize_style(value: str | None) -> str | None:
    if not isinstance(value, str):
        return None
    cleaned = value.strip().lower()
    if not cleaned:
        return None
    return STYLE_ALIASES.get(cleaned, cleaned)


def _flatten_note_lists(values: Iterable[list[str] | None]) -> list[str]:
    flattened: list[str] = []
    for value in values:
        if not value:
            continue
        flattened.extend(item for item in value if isinstance(item, str))
    return flattened


def _dominant_item(items: list[TasteProfileCountItem], notes_count: int) -> TasteProfileCountItem | None:
    if not items or notes_count == 0:
        return None
    top = items[0]
    if top.count >= 2 and top.count / notes_count >= 0.5:
        return top
    return None


def _clean_optional_string(value: object) -> str | None:
    return value.strip() if isinstance(value, str) and value.strip() else None


def _clean_string_list(value: object) -> list[str]:
    if not isinstance(value, list):
        return []
    return [item.strip() for item in value if isinstance(item, str) and item.strip()]

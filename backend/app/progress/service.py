from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.diary.models import TastingNote
from app.learning.models import Lesson
from app.progress.models import ProgressEvent
from app.progress.schemas import (
    DiaryProgressSummary,
    LearningProgressSummary,
    LessonCompletionState,
    LessonUncompleteState,
    ProgressActivityItem,
    ProgressActivityPreviewItem,
    ProgressActivityResponse,
    ProgressSummary,
    QuizProgressSummary,
)
from app.projects.models import ProjectUser
from app.quizzes.models import Quiz
from app.shared.errors import NotFoundError


LESSON_COMPLETED_EVENT = "learning.lesson.completed"
LESSON_SOURCE_TYPE = "lesson"
DIARY_NOTE_CREATED_EVENT = "diary.note.created"
DIARY_NOTE_SOURCE_TYPE = "diary_note"
QUIZ_COMPLETED_EVENT = "quiz.completed"
QUIZ_SOURCE_TYPE = "quiz"
DEFAULT_ACTIVITY_LIMIT = 20
MAX_ACTIVITY_LIMIT = 50


def mark_lesson_completed(db: Session, project_user: ProjectUser, lesson_slug: str) -> LessonCompletionState:
    lesson = _get_published_lesson(db, project_user, lesson_slug)
    event = get_lesson_completion_event(db, project_user, lesson.id)
    if event is None:
        now = datetime.now(timezone.utc)
        event = ProgressEvent(
            project_id=project_user.project_id,
            project_user_id=project_user.id,
            event_type=LESSON_COMPLETED_EVENT,
            source_type=LESSON_SOURCE_TYPE,
            source_id=lesson.id,
            source_slug=lesson.slug,
            metadata_json={"lesson_title": lesson.title},
            occurred_at=now,
        )
        db.add(event)
        db.commit()
        db.refresh(event)

    return LessonCompletionState(
        lesson_slug=lesson.slug,
        is_completed=True,
        completed_at=event.occurred_at,
    )


def unmark_lesson_completed(db: Session, project_user: ProjectUser, lesson_slug: str) -> LessonUncompleteState:
    lesson = _get_published_lesson(db, project_user, lesson_slug)
    event = get_lesson_completion_event(db, project_user, lesson.id)
    deleted = event is not None
    if event is not None:
        db.delete(event)
        db.commit()

    return LessonUncompleteState(
        lesson_slug=lesson.slug,
        is_completed=False,
        deleted=deleted,
    )


def build_progress_summary(db: Session, project_user: ProjectUser) -> ProgressSummary:
    return ProgressSummary(
        learning=build_learning_progress_summary(db, project_user),
        diary=build_diary_progress_summary(db, project_user),
        quizzes=build_quiz_progress_summary(db, project_user),
    )


def build_progress_activity(
    db: Session,
    project_user: ProjectUser,
    limit: int | None = DEFAULT_ACTIVITY_LIMIT,
) -> tuple[ProgressActivityResponse, int]:
    normalized_limit = normalize_activity_limit(limit)
    events = (
        _progress_activity_events_query(db, project_user)
        .order_by(ProgressEvent.occurred_at.desc(), ProgressEvent.created_at.desc())
        .limit(normalized_limit)
        .all()
    )
    return ProgressActivityResponse(items=_map_activity_events(db, project_user, events)), normalized_limit


def build_progress_activity_preview(
    db: Session,
    project_user: ProjectUser,
    limit: int = 3,
) -> list[ProgressActivityPreviewItem]:
    response, _ = build_progress_activity(db, project_user, limit)
    return [
        ProgressActivityPreviewItem(
            id=item.id,
            title=item.title,
            description=item.description,
            occurred_at=item.occurred_at,
            href=item.href,
        )
        for item in response.items
    ]


def normalize_activity_limit(limit: int | None) -> int:
    if limit is None:
        return DEFAULT_ACTIVITY_LIMIT
    return max(1, min(limit, MAX_ACTIVITY_LIMIT))


def count_progress_activity_events(db: Session, project_user: ProjectUser) -> int:
    return _progress_activity_events_query(db, project_user).count()


def build_learning_progress_summary(db: Session, project_user: ProjectUser) -> LearningProgressSummary:
    available_lessons_count = (
        db.query(Lesson)
        .filter(
            Lesson.project_id == project_user.project_id,
            Lesson.is_published.is_(True),
        )
        .count()
    )
    completed_events = (
        _lesson_completion_events_query(db, project_user)
        .join(Lesson, Lesson.id == ProgressEvent.source_id)
        .filter(
            Lesson.project_id == project_user.project_id,
            Lesson.is_published.is_(True),
        )
        .order_by(ProgressEvent.occurred_at.asc(), ProgressEvent.created_at.asc())
        .all()
    )
    completed_lesson_slugs = [event.source_slug for event in completed_events if event.source_slug]

    return LearningProgressSummary(
        completed_lessons_count=len(completed_lesson_slugs),
        available_lessons_count=available_lessons_count,
        completed_lesson_slugs=completed_lesson_slugs,
    )


def get_lesson_completion_event(db: Session, project_user: ProjectUser, lesson_id: UUID) -> ProgressEvent | None:
    return (
        _lesson_completion_events_query(db, project_user)
        .filter(ProgressEvent.source_id == lesson_id)
        .one_or_none()
    )


def get_lesson_completion_map(
    db: Session,
    project_user: ProjectUser,
    lesson_ids: list[UUID],
) -> dict[UUID, ProgressEvent]:
    if not lesson_ids:
        return {}

    events = (
        _lesson_completion_events_query(db, project_user)
        .filter(ProgressEvent.source_id.in_(lesson_ids))
        .all()
    )
    return {event.source_id: event for event in events if event.source_id is not None}


def record_diary_note_created_event(
    db: Session,
    project_user: ProjectUser,
    note: TastingNote,
) -> ProgressEvent:
    event = (
        db.query(ProgressEvent)
        .filter(
            ProgressEvent.project_id == project_user.project_id,
            ProgressEvent.project_user_id == project_user.id,
            ProgressEvent.event_type == DIARY_NOTE_CREATED_EVENT,
            ProgressEvent.source_type == DIARY_NOTE_SOURCE_TYPE,
            ProgressEvent.source_id == note.id,
        )
        .one_or_none()
    )
    if event is not None:
        return event

    metadata = {"wine_name": note.wine_name}
    if note.rating is not None:
        metadata["rating"] = note.rating

    event = ProgressEvent(
        project_id=project_user.project_id,
        project_user_id=project_user.id,
        event_type=DIARY_NOTE_CREATED_EVENT,
        source_type=DIARY_NOTE_SOURCE_TYPE,
        source_id=note.id,
        source_slug=None,
        metadata_json=metadata,
        occurred_at=datetime.now(timezone.utc),
    )
    db.add(event)
    return event


def build_diary_progress_summary(db: Session, project_user: ProjectUser) -> DiaryProgressSummary:
    notes_count = (
        db.query(TastingNote)
        .filter(
            TastingNote.project_id == project_user.project_id,
            TastingNote.project_user_id == project_user.id,
            TastingNote.visibility == "private",
        )
        .count()
    )
    created_note_events_count = (
        db.query(ProgressEvent)
        .filter(
            ProgressEvent.project_id == project_user.project_id,
            ProgressEvent.project_user_id == project_user.id,
            ProgressEvent.event_type == DIARY_NOTE_CREATED_EVENT,
            ProgressEvent.source_type == DIARY_NOTE_SOURCE_TYPE,
        )
        .count()
    )
    return DiaryProgressSummary(
        notes_count=notes_count,
        created_note_events_count=created_note_events_count,
    )


def build_quiz_progress_summary(db: Session, project_user: ProjectUser) -> QuizProgressSummary:
    available_quizzes_count = (
        db.query(Quiz)
        .filter(
            Quiz.project_id == project_user.project_id,
            Quiz.is_published.is_(True),
        )
        .count()
    )
    completed_events = (
        _quiz_completion_events_query(db, project_user)
        .join(Quiz, Quiz.id == ProgressEvent.source_id)
        .filter(
            Quiz.project_id == project_user.project_id,
            Quiz.is_published.is_(True),
        )
        .order_by(ProgressEvent.occurred_at.asc(), ProgressEvent.created_at.asc())
        .all()
    )
    completed_quiz_slugs = [event.source_slug for event in completed_events if event.source_slug]

    return QuizProgressSummary(
        completed_quizzes_count=len(completed_quiz_slugs),
        available_quizzes_count=available_quizzes_count,
        completed_quiz_slugs=completed_quiz_slugs,
    )


def get_quiz_completion_event(db: Session, project_user: ProjectUser, quiz_id: UUID) -> ProgressEvent | None:
    return (
        _quiz_completion_events_query(db, project_user)
        .filter(ProgressEvent.source_id == quiz_id)
        .one_or_none()
    )


def get_quiz_completion_map(
    db: Session,
    project_user: ProjectUser,
    quiz_ids: list[UUID],
) -> dict[UUID, ProgressEvent]:
    if not quiz_ids:
        return {}

    events = (
        _quiz_completion_events_query(db, project_user)
        .filter(ProgressEvent.source_id.in_(quiz_ids))
        .all()
    )
    return {event.source_id: event for event in events if event.source_id is not None}


def record_quiz_completed_event(
    db: Session,
    project_user: ProjectUser,
    quiz: Quiz,
    correct_count: int,
    total_questions: int,
) -> ProgressEvent:
    event = get_quiz_completion_event(db, project_user, quiz.id)
    if event is not None:
        return event

    event = ProgressEvent(
        project_id=project_user.project_id,
        project_user_id=project_user.id,
        event_type=QUIZ_COMPLETED_EVENT,
        source_type=QUIZ_SOURCE_TYPE,
        source_id=quiz.id,
        source_slug=quiz.slug,
        metadata_json={
            "quiz_title": quiz.title,
            "correct_count": correct_count,
            "total_questions": total_questions,
        },
        occurred_at=datetime.now(timezone.utc),
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def _progress_activity_events_query(db: Session, project_user: ProjectUser):
    return db.query(ProgressEvent).filter(
        ProgressEvent.project_id == project_user.project_id,
        ProgressEvent.project_user_id == project_user.id,
        ProgressEvent.event_type.in_([LESSON_COMPLETED_EVENT, DIARY_NOTE_CREATED_EVENT, QUIZ_COMPLETED_EVENT]),
        ProgressEvent.source_type.in_([LESSON_SOURCE_TYPE, DIARY_NOTE_SOURCE_TYPE, QUIZ_SOURCE_TYPE]),
    )


def _map_activity_events(
    db: Session,
    project_user: ProjectUser,
    events: list[ProgressEvent],
) -> list[ProgressActivityItem]:
    lesson_ids = [
        event.source_id
        for event in events
        if event.event_type == LESSON_COMPLETED_EVENT and event.source_id is not None
    ]
    note_ids = [
        event.source_id
        for event in events
        if event.event_type == DIARY_NOTE_CREATED_EVENT and event.source_id is not None
    ]
    quiz_ids = [
        event.source_id
        for event in events
        if event.event_type == QUIZ_COMPLETED_EVENT and event.source_id is not None
    ]
    lessons_by_id = {
        lesson.id: lesson
        for lesson in (
            db.query(Lesson)
            .filter(
                Lesson.project_id == project_user.project_id,
                Lesson.id.in_(lesson_ids),
            )
            .all()
            if lesson_ids
            else []
        )
    }
    notes_by_id = {
        note.id: note
        for note in (
            db.query(TastingNote)
            .filter(
                TastingNote.project_id == project_user.project_id,
                TastingNote.project_user_id == project_user.id,
                TastingNote.visibility == "private",
                TastingNote.id.in_(note_ids),
            )
            .all()
            if note_ids
            else []
        )
    }
    quizzes_by_id = {
        quiz.id: quiz
        for quiz in (
            db.query(Quiz)
            .filter(
                Quiz.project_id == project_user.project_id,
                Quiz.id.in_(quiz_ids),
            )
            .all()
            if quiz_ids
            else []
        )
    }

    return [_map_activity_event(event, lessons_by_id, notes_by_id, quizzes_by_id) for event in events]


def _map_activity_event(
    event: ProgressEvent,
    lessons_by_id: dict[UUID, Lesson],
    notes_by_id: dict[UUID, TastingNote],
    quizzes_by_id: dict[UUID, Quiz],
) -> ProgressActivityItem:
    if event.event_type == LESSON_COMPLETED_EVENT:
        lesson = lessons_by_id.get(event.source_id) if event.source_id is not None else None
        description = (
            lesson.title
            if lesson is not None
            else _metadata_text(event, "title", "lesson_title") or event.source_slug or "Урок"
        )
        href = f"/learn/lessons/{event.source_slug}" if event.source_slug else None
        return ProgressActivityItem(
            id=event.id,
            event_type=event.event_type,
            source_type=event.source_type,
            source_id=event.source_id,
            source_slug=event.source_slug,
            title="Урок завершён",
            description=description,
            occurred_at=event.occurred_at,
            href=href,
        )

    if event.event_type == QUIZ_COMPLETED_EVENT:
        quiz = quizzes_by_id.get(event.source_id) if event.source_id is not None else None
        description = (
            quiz.title
            if quiz is not None
            else _metadata_text(event, "quiz_title", "title") or event.source_slug or "Квиз"
        )
        href = f"/quizzes/{event.source_slug}" if event.source_slug else None
        return ProgressActivityItem(
            id=event.id,
            event_type=event.event_type,
            source_type=event.source_type,
            source_id=event.source_id,
            source_slug=event.source_slug,
            title="Квиз завершён",
            description=description,
            occurred_at=event.occurred_at,
            href=href,
        )

    note = notes_by_id.get(event.source_id) if event.source_id is not None else None
    description = (
        note.wine_name
        if note is not None
        else _metadata_text(event, "wine_name") or "Заметка в дневнике"
    )
    href = f"/diary/{event.source_id}" if note is not None and event.source_id is not None else None
    return ProgressActivityItem(
        id=event.id,
        event_type=event.event_type,
        source_type=event.source_type,
        source_id=event.source_id,
        source_slug=event.source_slug,
        title="Заметка добавлена",
        description=description,
        occurred_at=event.occurred_at,
        href=href,
    )


def _metadata_text(event: ProgressEvent, *keys: str) -> str | None:
    if not isinstance(event.metadata_json, dict):
        return None
    for key in keys:
        value = event.metadata_json.get(key)
        if isinstance(value, str):
            cleaned = value.strip()
            if cleaned:
                return cleaned
    return None


def _lesson_completion_events_query(db: Session, project_user: ProjectUser):
    return db.query(ProgressEvent).filter(
        ProgressEvent.project_id == project_user.project_id,
        ProgressEvent.project_user_id == project_user.id,
        ProgressEvent.event_type == LESSON_COMPLETED_EVENT,
        ProgressEvent.source_type == LESSON_SOURCE_TYPE,
    )


def _quiz_completion_events_query(db: Session, project_user: ProjectUser):
    return db.query(ProgressEvent).filter(
        ProgressEvent.project_id == project_user.project_id,
        ProgressEvent.project_user_id == project_user.id,
        ProgressEvent.event_type == QUIZ_COMPLETED_EVENT,
        ProgressEvent.source_type == QUIZ_SOURCE_TYPE,
    )


def _get_published_lesson(db: Session, project_user: ProjectUser, lesson_slug: str) -> Lesson:
    lesson = (
        db.query(Lesson)
        .filter(
            Lesson.project_id == project_user.project_id,
            Lesson.slug == lesson_slug,
            Lesson.is_published.is_(True),
        )
        .one_or_none()
    )
    if lesson is None:
        raise NotFoundError("Lesson was not found")
    return lesson

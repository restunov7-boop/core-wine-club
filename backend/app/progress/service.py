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
    ProgressSummary,
)
from app.projects.models import ProjectUser
from app.shared.errors import NotFoundError


LESSON_COMPLETED_EVENT = "learning.lesson.completed"
LESSON_SOURCE_TYPE = "lesson"
DIARY_NOTE_CREATED_EVENT = "diary.note.created"
DIARY_NOTE_SOURCE_TYPE = "diary_note"


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
    )


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


def _lesson_completion_events_query(db: Session, project_user: ProjectUser):
    return db.query(ProgressEvent).filter(
        ProgressEvent.project_id == project_user.project_id,
        ProgressEvent.project_user_id == project_user.id,
        ProgressEvent.event_type == LESSON_COMPLETED_EVENT,
        ProgressEvent.source_type == LESSON_SOURCE_TYPE,
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

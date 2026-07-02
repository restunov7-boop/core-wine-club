from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.progress.service import get_quiz_completion_event, get_quiz_completion_map, record_quiz_completed_event
from app.projects.models import Project, ProjectUser
from app.quizzes.models import Quiz, QuizQuestion
from app.quizzes.schemas import (
    QuizCheckItem,
    QuizCheckResult,
    QuizDetail,
    QuizListItem,
    QuizOption,
    QuizQuestionPublic,
)
from app.shared.errors import NotFoundError, ValidationAppError


DEMO_QUIZ: dict[str, Any] = {
    "slug": "wine-basics-check",
    "title": "Проверка винной базы",
    "subtitle": "Короткий квиз после первых уроков",
    "summary": "Пять спокойных вопросов, чтобы закрепить базовые понятия.",
    "description": (
        "Небольшая проверка без оценок и давления. Она помогает вспомнить базовые идеи из первых уроков "
        "и спокойно заметить, что уже стало понятнее."
    ),
    "difficulty": "beginner",
    "estimated_minutes": 4,
    "sort_order": 10,
}

DEMO_QUESTIONS: list[dict[str, Any]] = [
    {
        "slug": "dry-wine-meaning",
        "prompt": "Что обычно означает сухое вино?",
        "options": [
            {"key": "a", "label": "Вино без сахара или почти без сахара"},
            {"key": "b", "label": "Вино без аромата"},
            {"key": "c", "label": "Вино, которое обязательно кажется резким"},
        ],
        "correct_option_key": "a",
        "explanation": "Сухость обычно связана с уровнем остаточного сахара, а не с отсутствием аромата.",
        "sort_order": 10,
    },
    {
        "slug": "wine-color-basics",
        "prompt": "Что чаще всего влияет на разницу между красным, белым и розе?",
        "options": [
            {"key": "a", "label": "Только форма бутылки"},
            {"key": "b", "label": "Контакт с кожицей винограда и стиль производства"},
            {"key": "c", "label": "Температура в магазине"},
        ],
        "correct_option_key": "b",
        "explanation": "Кожица винограда даёт цвет, часть аромата и структуру, поэтому контакт с ней важен.",
        "sort_order": 20,
    },
    {
        "slug": "glass-shape-perception",
        "prompt": "Почему форма бокала может менять восприятие вина?",
        "options": [
            {"key": "a", "label": "Она влияет на раскрытие аромата и то, как вино попадает к нам"},
            {"key": "b", "label": "Она меняет сорт винограда"},
            {"key": "c", "label": "Она превращает сухое вино в сладкое"},
        ],
        "correct_option_key": "a",
        "explanation": "Форма бокала помогает направить аромат и глоток, но не меняет само вино магически.",
        "sort_order": 30,
    },
    {
        "slug": "food-pairing-meaning",
        "prompt": "Что значит подобрать вино к еде?",
        "options": [
            {"key": "a", "label": "Выбрать самое дорогое вино"},
            {"key": "b", "label": "Сделать так, чтобы еда и вино рядом звучали приятнее"},
            {"key": "c", "label": "Всегда брать только красное"},
        ],
        "correct_option_key": "b",
        "explanation": "Хорошее сочетание поддерживает блюдо или добавляет баланс, а не превращает ужин в экзамен.",
        "sort_order": 40,
    },
    {
        "slug": "tasting-without-snobbery",
        "prompt": "Как спокойнее всего подходить к дегустации?",
        "options": [
            {"key": "a", "label": "Искать только сложные профессиональные слова"},
            {"key": "b", "label": "Замечать цвет, аромат, вкус и своё честное впечатление"},
            {"key": "c", "label": "Не доверять собственному вкусу"},
        ],
        "correct_option_key": "b",
        "explanation": "Для старта достаточно честных наблюдений: что видишь, чувствуешь и хочешь ли повторить.",
        "sort_order": 50,
    },
]


def _published_quizzes_query(db: Session, project_user: ProjectUser):
    return db.query(Quiz).filter(
        Quiz.project_id == project_user.project_id,
        Quiz.is_published.is_(True),
    )


def _ordered_questions_query(db: Session, project_user: ProjectUser, quiz: Quiz):
    return db.query(QuizQuestion).filter(
        QuizQuestion.project_id == project_user.project_id,
        QuizQuestion.quiz_id == quiz.id,
    ).order_by(QuizQuestion.sort_order.asc(), QuizQuestion.created_at.asc())


def list_quizzes(db: Session, project_user: ProjectUser) -> list[QuizListItem]:
    quizzes = (
        _published_quizzes_query(db, project_user)
        .order_by(Quiz.sort_order.asc(), Quiz.published_at.desc(), Quiz.created_at.asc())
        .all()
    )
    completion_map = get_quiz_completion_map(db, project_user, [quiz.id for quiz in quizzes])
    return [
        _build_quiz_list_item(db, project_user, quiz, completion_map.get(quiz.id))
        for quiz in quizzes
    ]


def get_quiz_detail(db: Session, project_user: ProjectUser, slug: str) -> QuizDetail:
    quiz = _get_published_quiz(db, project_user, slug)
    completion_event = get_quiz_completion_event(db, project_user, quiz.id)
    questions = [
        QuizQuestionPublic(
            id=question.id,
            slug=question.slug,
            prompt=question.prompt,
            question_type=question.question_type,
            options=[QuizOption(**option) for option in question.options_json],
        )
        for question in _ordered_questions_query(db, project_user, quiz).all()
    ]
    return QuizDetail(
        id=quiz.id,
        slug=quiz.slug,
        title=quiz.title,
        subtitle=quiz.subtitle,
        summary=quiz.summary,
        description=quiz.description,
        difficulty=quiz.difficulty,
        estimated_minutes=quiz.estimated_minutes,
        is_completed=completion_event is not None,
        completed_at=completion_event.occurred_at if completion_event is not None else None,
        questions=questions,
    )


def check_quiz_answers(
    db: Session,
    project_user: ProjectUser,
    slug: str,
    answers: list[tuple[UUID, str]],
) -> QuizCheckResult:
    quiz = _get_published_quiz(db, project_user, slug)
    questions = _ordered_questions_query(db, project_user, quiz).all()
    questions_by_id = {question.id: question for question in questions}
    items: list[QuizCheckItem] = []
    answered_question_ids: set[UUID] = set()

    for question_id, selected_option_key in answers:
        if question_id in answered_question_ids:
            raise ValidationAppError("Answer references a quiz question more than once")
        answered_question_ids.add(question_id)

        question = questions_by_id.get(question_id)
        if question is None:
            raise ValidationAppError("Answer references an unknown quiz question")

        valid_option_keys = {option["key"] for option in question.options_json}
        if selected_option_key not in valid_option_keys:
            raise ValidationAppError("Selected option is not valid for this question")

        items.append(
            QuizCheckItem(
                question_id=question.id,
                is_correct=selected_option_key == question.correct_option_key,
                selected_option_key=selected_option_key,
                correct_option_key=question.correct_option_key,
                explanation=question.explanation,
            )
        )

    correct_count = sum(1 for item in items if item.is_correct)
    completion_event = None
    if len(questions) > 0 and len(answered_question_ids) == len(questions) and correct_count == len(questions):
        completion_event = record_quiz_completed_event(
            db,
            project_user,
            quiz,
            correct_count=correct_count,
            total_questions=len(questions),
        )

    return QuizCheckResult(
        quiz_slug=quiz.slug,
        total_questions=len(questions),
        correct_count=correct_count,
        is_completed=completion_event is not None,
        completed_at=completion_event.occurred_at if completion_event is not None else None,
        items=items,
    )


def _build_quiz_list_item(
    db: Session,
    project_user: ProjectUser,
    quiz: Quiz,
    completion_event,
) -> QuizListItem:
    return QuizListItem(
        id=quiz.id,
        slug=quiz.slug,
        title=quiz.title,
        subtitle=quiz.subtitle,
        summary=quiz.summary,
        difficulty=quiz.difficulty,
        estimated_minutes=quiz.estimated_minutes,
        questions_count=_ordered_questions_query(db, project_user, quiz).count(),
        is_completed=completion_event is not None,
        completed_at=completion_event.occurred_at if completion_event is not None else None,
    )


def seed_demo_quizzes(db: Session, project: Project) -> int:
    now = datetime.now(timezone.utc)
    quiz = db.query(Quiz).filter(
        Quiz.project_id == project.id,
        Quiz.slug == DEMO_QUIZ["slug"],
    ).one_or_none()
    if quiz is None:
        quiz = Quiz(project_id=project.id, slug=DEMO_QUIZ["slug"])
        db.add(quiz)

    quiz.title = DEMO_QUIZ["title"]
    quiz.subtitle = DEMO_QUIZ["subtitle"]
    quiz.summary = DEMO_QUIZ["summary"]
    quiz.description = DEMO_QUIZ["description"]
    quiz.difficulty = DEMO_QUIZ["difficulty"]
    quiz.estimated_minutes = DEMO_QUIZ["estimated_minutes"]
    quiz.is_published = True
    quiz.published_at = quiz.published_at or now
    quiz.sort_order = DEMO_QUIZ["sort_order"]
    db.flush()

    for item in DEMO_QUESTIONS:
        question = db.query(QuizQuestion).filter(
            QuizQuestion.project_id == project.id,
            QuizQuestion.quiz_id == quiz.id,
            QuizQuestion.slug == item["slug"],
        ).one_or_none()
        if question is None:
            question = QuizQuestion(project_id=project.id, quiz_id=quiz.id, slug=item["slug"])
            db.add(question)

        question.prompt = item["prompt"]
        question.question_type = "single_choice"
        question.options_json = item["options"]
        question.correct_option_key = item["correct_option_key"]
        question.explanation = item["explanation"]
        question.sort_order = item["sort_order"]

    db.flush()
    return len(DEMO_QUESTIONS)


def _get_published_quiz(db: Session, project_user: ProjectUser, slug: str) -> Quiz:
    quiz = _published_quizzes_query(db, project_user).filter(Quiz.slug == slug).one_or_none()
    if quiz is None:
        raise NotFoundError("Quiz was not found")
    return quiz

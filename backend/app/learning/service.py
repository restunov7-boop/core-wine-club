from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.learning.models import LearningPath, LearningPathLesson, Lesson
from app.learning.schemas import (
    LearningPathDetail,
    LearningPathLessonItem,
    LearningPathListItem,
    LearningPathPreview,
    LessonDetail,
)
from app.progress.service import get_lesson_completion_event, get_lesson_completion_map
from app.projects.models import Project, ProjectUser
from app.shared.errors import NotFoundError


DEMO_LEARNING_PATH: dict[str, Any] = {
    "slug": "wine-basics",
    "title": "Винная база без снобизма",
    "subtitle": "Первый маршрут для уверенного старта",
    "summary": "Пять спокойных уроков, чтобы понять язык вина и не теряться перед полкой или картой.",
    "description": (
        "Этот маршрут собирает базовые ориентиры: как рождается вино, чем отличаются стили, "
        "как понимать сухость и сладость, как пробовать без напряжения и как выбирать пару к еде."
    ),
    "difficulty": "beginner",
    "estimated_minutes": 25,
    "sort_order": 10,
}

DEMO_LESSONS: list[dict[str, Any]] = [
    {
        "slug": "how-wine-is-made",
        "title": "Как рождается вино",
        "subtitle": "От винограда до бокала без лишней терминологии.",
        "summary": "Короткий путь через сбор урожая, брожение, выдержку и розлив.",
        "body": (
            "Вино начинается с винограда, но характер будущего напитка складывается ещё в винограднике: "
            "важны сорт, зрелость ягод, погода и момент сбора.\n\n"
            "После сбора ягоды давят, а сок начинает бродить. Дрожжи превращают сахар в алкоголь, и в этот момент "
            "появляется основа аромата, тела и свежести.\n\n"
            "Дальше вино может спокойно созревать в стали, бетоне, глине или дубе. Сосуд не делает вино лучше сам по себе, "
            "но помогает подчеркнуть стиль: свежий, округлый, пряный или более глубокий.\n\n"
            "Когда вино готово, его фильтруют при необходимости, разливают и дают ему немного времени собраться. "
            "В бокале оказывается не магия, а цепочка понятных решений."
        ),
        "lesson_type": "article",
        "difficulty": "beginner",
        "estimated_minutes": 5,
        "sort_order": 10,
    },
    {
        "slug": "red-white-rose-basics",
        "title": "Красное, белое, розе: в чём разница",
        "subtitle": "Цвет как первый ориентир, а не строгий закон.",
        "summary": "Разбираем, почему цвет влияет на ожидания от вина и когда правила можно отпускать.",
        "body": (
            "Цвет вина связан не только с виноградом, но и с тем, как долго сок контактировал с кожицей ягод. "
            "Именно кожица даёт цвет, часть аромата и структуру.\n\n"
            "Белые вина чаще воспринимаются как свежие и лёгкие, но среди них бывают плотные, сливочные и серьёзные. "
            "Красные чаще дают больше тела, ягодности и танинов, хотя лёгкие красные тоже существуют.\n\n"
            "Розе живёт между стилями: оно может быть почти невесомым, гастрономичным, фруктовым или сухим и строгим. "
            "Главное — не ожидать от цвета одного единственного вкуса.\n\n"
            "Для старта цвет помогает выбрать настроение: свежесть, глубину или мягкую фруктовость. Потом личный дневник уточнит эту карту."
        ),
        "lesson_type": "guide",
        "difficulty": "beginner",
        "estimated_minutes": 5,
        "sort_order": 20,
    },
    {
        "slug": "dry-sweet-balance",
        "title": "Сухое и сладкое: как это понимать",
        "subtitle": "Сахар, кислотность и ощущение баланса.",
        "summary": "Почему сухое не всегда резкое, а сладость не всегда делает вино простым.",
        "body": (
            "Сухость говорит о том, сколько сахара осталось после брожения. В сухом вине сахара мало, но это не значит, "
            "что оно обязано быть жёстким или кислым.\n\n"
            "На ощущение влияет баланс: кислотность освежает, алкоголь даёт тепло, зрелый фрукт может казаться сладким даже без сахара. "
            "Поэтому два сухих вина могут ощущаться совершенно по-разному.\n\n"
            "Полусухие и сладкие вина тоже бывают тонкими, особенно если у них достаточно свежести. Хороший ориентир — не слово на этикетке, "
            "а вопрос: хочется ли сделать следующий глоток.\n\n"
            "Когда пробуешь, отмечай не только сухое или сладкое, а общий баланс: свежее, мягкое, плотное, сочное или спокойное."
        ),
        "lesson_type": "article",
        "difficulty": "beginner",
        "estimated_minutes": 5,
        "sort_order": 30,
    },
    {
        "slug": "how-to-taste-wine",
        "title": "Как пробовать вино спокойно и уверенно",
        "subtitle": "Три шага без экзамена и сложных слов.",
        "summary": "Смотри, нюхай, пробуй — и доверяй собственному впечатлению.",
        "body": (
            "Начни с внешнего вида: цвет, прозрачность и настроение вина в бокале уже дают первые подсказки. "
            "Не нужно делать выводы сразу, достаточно заметить первое впечатление.\n\n"
            "Затем понюхай вино спокойно. Можно искать простые слова: ягоды, яблоко, цитрус, цветы, специи, хлеб, трава. "
            "Если ничего не приходит — это тоже нормально.\n\n"
            "Сделай небольшой глоток и отметь свежесть, тело, мягкость, терпкость и послевкусие. Самый важный вопрос: "
            "тебе приятно или нет, и почему.\n\n"
            "Записывай пару честных слов в дневник. Со временем из этих слов сложится твой личный словарь вкуса."
        ),
        "lesson_type": "ritual",
        "difficulty": "beginner",
        "estimated_minutes": 5,
        "sort_order": 40,
    },
    {
        "slug": "wine-with-food-basics",
        "title": "Как подобрать вино к еде без паники",
        "subtitle": "Вес блюда, соус и настроение важнее строгих правил.",
        "summary": "Простая рамка для ужина дома, гостей или выбора в ресторане.",
        "body": (
            "Самый спокойный ориентир — вес блюда. Лёгкая еда чаще просит свежее и не слишком плотное вино, "
            "а насыщенная еда выдерживает больше тела и характера.\n\n"
            "Соус часто важнее основного продукта. Сливочный соус любит кислотность, томатный — фруктовость, "
            "острое блюдо лучше раскрывается с мягкими и не слишком крепкими винами.\n\n"
            "Совпадение и контраст работают одинаково хорошо. Можно поддержать блюдо похожим настроением, а можно добавить свежести, "
            "если еда кажется тяжёлой.\n\n"
            "И главное: сочетание должно помогать вечеру, а не превращаться в экзамен. Если еда и вино рядом стали приятнее, выбор уже удался."
        ),
        "lesson_type": "guide",
        "difficulty": "beginner",
        "estimated_minutes": 5,
        "sort_order": 50,
    },
]


def _published_paths_query(db: Session, project_user: ProjectUser):
    return db.query(LearningPath).filter(
        LearningPath.project_id == project_user.project_id,
        LearningPath.is_published.is_(True),
    )


def _published_lessons_query(db: Session, project_user: ProjectUser):
    return db.query(Lesson).filter(
        Lesson.project_id == project_user.project_id,
        Lesson.is_published.is_(True),
    )


def _published_lessons_for_path_query(db: Session, project_user: ProjectUser, learning_path: LearningPath):
    return (
        db.query(Lesson, LearningPathLesson.sort_order)
        .join(LearningPathLesson, LearningPathLesson.lesson_id == Lesson.id)
        .filter(
            LearningPathLesson.project_id == project_user.project_id,
            LearningPathLesson.learning_path_id == learning_path.id,
            Lesson.project_id == project_user.project_id,
            Lesson.is_published.is_(True),
        )
    )


def list_learning_path_summaries(db: Session, project_user: ProjectUser) -> list[LearningPathListItem]:
    paths = (
        _published_paths_query(db, project_user)
        .order_by(LearningPath.sort_order.asc(), LearningPath.published_at.desc(), LearningPath.created_at.asc())
        .all()
    )
    return [_path_to_list_item(db, project_user, path) for path in paths]


def get_learning_path_detail(db: Session, project_user: ProjectUser, slug: str) -> LearningPathDetail:
    learning_path = _published_paths_query(db, project_user).filter(LearningPath.slug == slug).one_or_none()
    if learning_path is None:
        raise NotFoundError("Learning path was not found")

    lesson_rows = (
        _published_lessons_for_path_query(db, project_user, learning_path)
        .order_by(LearningPathLesson.sort_order.asc(), Lesson.sort_order.asc(), Lesson.created_at.asc())
        .all()
    )
    completion_map = get_lesson_completion_map(db, project_user, [lesson.id for lesson, _ in lesson_rows])
    lessons = [
        LearningPathLessonItem(
            slug=lesson.slug,
            title=lesson.title,
            summary=lesson.summary,
            lesson_type=lesson.lesson_type,
            difficulty=lesson.difficulty,
            estimated_minutes=lesson.estimated_minutes,
            is_completed=lesson.id in completion_map,
            completed_at=completion_map[lesson.id].occurred_at if lesson.id in completion_map else None,
        )
        for lesson, _ in lesson_rows
    ]
    lessons_count = len(lessons)
    completed_lessons_count = sum(1 for lesson in lessons if lesson.is_completed)

    return LearningPathDetail(
        id=learning_path.id,
        slug=learning_path.slug,
        title=learning_path.title,
        subtitle=learning_path.subtitle,
        summary=learning_path.summary,
        description=learning_path.description,
        difficulty=learning_path.difficulty,
        estimated_minutes=learning_path.estimated_minutes,
        lessons_count=lessons_count,
        completed_lessons_count=completed_lessons_count,
        lessons=lessons,
    )


def get_lesson_detail(db: Session, project_user: ProjectUser, slug: str) -> LessonDetail:
    lesson = _published_lessons_query(db, project_user).filter(Lesson.slug == slug).one_or_none()
    if lesson is None:
        raise NotFoundError("Lesson was not found")
    completion = get_lesson_completion_event(db, project_user, lesson.id)
    return LessonDetail(
        id=lesson.id,
        slug=lesson.slug,
        title=lesson.title,
        subtitle=lesson.subtitle,
        summary=lesson.summary,
        body=lesson.body,
        lesson_type=lesson.lesson_type,
        difficulty=lesson.difficulty,
        estimated_minutes=lesson.estimated_minutes,
        published_at=lesson.published_at,
        is_completed=completion is not None,
        completed_at=completion.occurred_at if completion is not None else None,
    )


def list_learning_path_previews(db: Session, project_user: ProjectUser, limit: int = 3) -> list[LearningPathPreview]:
    paths = (
        _published_paths_query(db, project_user)
        .order_by(LearningPath.sort_order.asc(), LearningPath.published_at.desc(), LearningPath.created_at.asc())
        .limit(limit)
        .all()
    )
    return [
        LearningPathPreview(
            slug=path.slug,
            title=path.title,
            lessons_count=_count_published_lessons(db, project_user, path),
            completed_lessons_count=_count_completed_lessons(db, project_user, path),
            estimated_minutes=path.estimated_minutes,
        )
        for path in paths
    ]


def seed_demo_learning(db: Session, project: Project) -> int:
    now = datetime.now(timezone.utc)
    path = db.query(LearningPath).filter(
        LearningPath.project_id == project.id,
        LearningPath.slug == DEMO_LEARNING_PATH["slug"],
    ).one_or_none()
    if path is None:
        path = LearningPath(project_id=project.id, slug=DEMO_LEARNING_PATH["slug"])
        db.add(path)

    path.title = DEMO_LEARNING_PATH["title"]
    path.subtitle = DEMO_LEARNING_PATH["subtitle"]
    path.summary = DEMO_LEARNING_PATH["summary"]
    path.description = DEMO_LEARNING_PATH["description"]
    path.difficulty = DEMO_LEARNING_PATH["difficulty"]
    path.estimated_minutes = DEMO_LEARNING_PATH["estimated_minutes"]
    path.cover_image_url = None
    path.is_published = True
    path.published_at = path.published_at or now
    path.sort_order = DEMO_LEARNING_PATH["sort_order"]
    db.flush()

    lessons_by_slug: dict[str, Lesson] = {}
    for item in DEMO_LESSONS:
        lesson = db.query(Lesson).filter(
            Lesson.project_id == project.id,
            Lesson.slug == item["slug"],
        ).one_or_none()
        if lesson is None:
            lesson = Lesson(project_id=project.id, slug=item["slug"])
            db.add(lesson)

        lesson.title = item["title"]
        lesson.subtitle = item["subtitle"]
        lesson.summary = item["summary"]
        lesson.body = item["body"]
        lesson.lesson_type = item["lesson_type"]
        lesson.difficulty = item["difficulty"]
        lesson.estimated_minutes = item["estimated_minutes"]
        lesson.cover_image_url = None
        lesson.is_published = True
        lesson.published_at = lesson.published_at or now
        lesson.sort_order = item["sort_order"]
        lessons_by_slug[item["slug"]] = lesson

    db.flush()

    for item in DEMO_LESSONS:
        lesson = lessons_by_slug[item["slug"]]
        link = db.query(LearningPathLesson).filter(
            LearningPathLesson.learning_path_id == path.id,
            LearningPathLesson.lesson_id == lesson.id,
        ).one_or_none()
        if link is None:
            link = LearningPathLesson(
                project_id=project.id,
                learning_path_id=path.id,
                lesson_id=lesson.id,
            )
            db.add(link)
        link.project_id = project.id
        link.sort_order = item["sort_order"]

    db.flush()
    return len(DEMO_LESSONS)


def _path_to_list_item(db: Session, project_user: ProjectUser, path: LearningPath) -> LearningPathListItem:
    return LearningPathListItem(
        id=path.id,
        slug=path.slug,
        title=path.title,
        subtitle=path.subtitle,
        summary=path.summary,
        difficulty=path.difficulty,
        estimated_minutes=path.estimated_minutes,
        cover_image_url=path.cover_image_url,
        lessons_count=_count_published_lessons(db, project_user, path),
        completed_lessons_count=_count_completed_lessons(db, project_user, path),
    )


def _count_published_lessons(db: Session, project_user: ProjectUser, learning_path: LearningPath) -> int:
    return _published_lessons_for_path_query(db, project_user, learning_path).count()


def _count_completed_lessons(db: Session, project_user: ProjectUser, learning_path: LearningPath) -> int:
    lesson_rows = _published_lessons_for_path_query(db, project_user, learning_path).all()
    completion_map = get_lesson_completion_map(db, project_user, [lesson.id for lesson, _ in lesson_rows])
    return len(completion_map)

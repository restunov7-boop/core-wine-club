from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.discoveries.models import Discovery
from app.projects.models import Project, ProjectUser
from app.shared.errors import NotFoundError


DEMO_DISCOVERIES: list[dict[str, Any]] = [
    {
        "slug": "how-to-read-wine-label",
        "title": "Как читать винную этикетку",
        "subtitle": "Несколько спокойных ориентиров перед первой покупкой.",
        "summary": "Этикетка становится понятнее, если искать на ней не тайный код, а четыре простых подсказки: место, сорт, стиль и год.",
        "body": (
            "Винная этикетка часто выглядит как приглашение в закрытый клуб, но на самом деле она говорит довольно простыми фразами. "
            "Начни с региона: он подсказывает климат, характер вина и иногда традиционный стиль.\n\n"
            "Затем посмотри на сорт винограда или апелласьон. Если сорт указан прямо, перед тобой более понятная точка входа. "
            "Если вместо сорта стоит название места, значит производитель опирается на местные правила и привычный для региона вкус.\n\n"
            "Год урожая не обязан быть поводом для тревоги. Для первых открытий важнее свежесть, честный импортёр и стиль, который подходит случаю: лёгкий ужин, разговор, подарок или вечер без спешки."
        ),
        "category": "basics",
        "difficulty": "beginner",
        "estimated_minutes": 4,
        "sort_order": 10,
    },
    {
        "slug": "red-white-rose-where-to-start",
        "title": "Красное, белое, розе: с чего начать",
        "subtitle": "Короткая карта трёх настроений в бокале.",
        "summary": "Цвет вина не диктует правила, но помогает выбрать первое направление: свежесть, глубину или лёгкую фруктовую середину.",
        "body": (
            "Белое вино часто выбирают за свежесть, цитрусовость и ощущение прохлады. Оно хорошо подходит к рыбе, мягким сырам, салатам и вечерам, когда хочется лёгкости.\n\n"
            "Красное чаще даёт больше тела, ягодности, специй и структуры. Начинать удобно с мягких, не слишком терпких вин: они показывают характер без давления.\n\n"
            "Розе живёт между этими мирами. Оно может быть сухим, гастрономичным и очень серьёзным, но при этом остаётся дружелюбным выбором для закусок, пикника или простого ужина."
        ),
        "category": "taste",
        "difficulty": "beginner",
        "estimated_minutes": 5,
        "sort_order": 20,
    },
    {
        "slug": "what-dry-wine-means",
        "title": "Что такое сухое вино на самом деле",
        "subtitle": "Про сахар, кислотность и ощущение свежести.",
        "summary": "Сухое вино не обязательно резкое. Чаще это вино, где почти весь сахар превратился в алкоголь, а вкус держится на балансе.",
        "body": (
            "Слово «сухое» описывает не настроение вина, а количество остаточного сахара. В сухом вине его мало, поэтому сладость не выходит на первый план.\n\n"
            "Но сухое не равно кислое или строгое. Вино может казаться мягким благодаря спелому фрукту, выдержке, сорту винограда и температуре подачи.\n\n"
            "Если сухие вина пока кажутся слишком прямыми, попробуй начать с ароматных белых, мягких красных или розе. Они часто дают ощущение фруктовости без настоящей сладости."
        ),
        "category": "basics",
        "difficulty": "beginner",
        "estimated_minutes": 4,
        "sort_order": 30,
    },
    {
        "slug": "why-glass-changes-taste",
        "title": "Почему бокал меняет вкус",
        "subtitle": "Форма, воздух и маленькая театральность ритуала.",
        "summary": "Бокал помогает вину раскрыть аромат, направляет его к носу и делает глоток более собранным.",
        "body": (
            "Бокал работает как тихий усилитель. Широкая чаша даёт вину больше контакта с воздухом, а сужение сверху собирает аромат, чтобы его легче было заметить.\n\n"
            "Для первых шагов не нужны десятки форм. Один универсальный бокал с тонким краем уже меняет впечатление сильнее, чем кажется.\n\n"
            "Попробуй одно и то же вино из обычного стакана и из бокала. Разница часто чувствуется сразу: аромат становится яснее, а вкус кажется более цельным."
        ),
        "category": "ritual",
        "difficulty": "curious",
        "estimated_minutes": 3,
        "sort_order": 40,
    },
    {
        "slug": "how-to-choose-wine-for-dinner",
        "title": "Как выбрать вино к ужину",
        "subtitle": "Не правила ради правил, а способ сделать еду выразительнее.",
        "summary": "Начни не с сложных таблиц, а с веса блюда, соуса и настроения вечера.",
        "body": (
            "Самый простой ориентир — плотность блюда. Лёгкая еда просит более свежего вина, насыщенная — вина с большим телом и характером.\n\n"
            "Соус часто важнее основного продукта. Сливочный соус любит свежесть и кислотность, томатный просит фруктовости, а пряные блюда лучше раскрываются с мягкими и не слишком крепкими винами.\n\n"
            "И главное: сочетание должно помогать вечеру, а не экзаменовать тебя. Если вино и еда рядом становятся приятнее, выбор уже удался."
        ),
        "category": "pairing",
        "difficulty": "curious",
        "estimated_minutes": 5,
        "sort_order": 50,
    },
    {
        "slug": "sparkling-is-not-only-celebration",
        "title": "Игристое — это не только праздник",
        "subtitle": "Почему пузырьки уместны в обычный вечер.",
        "summary": "Игристое может быть аперитивом, парой к еде и способом добавить свежести без торжественной сцены.",
        "body": (
            "Пузырьки делают вкус живым: они освежают, подчёркивают кислотность и легко справляются с солёными, жареными и сливочными блюдами.\n\n"
            "Не всё игристое сладкое. Brut и extra brut часто сухие, собранные и гастрономичные. Они хорошо подходят к сырам, рыбе, картофелю, закускам и даже простому домашнему ужину.\n\n"
            "Если хочется начать мягко, ищи просекко, креман или спокойные локальные варианты. Главное — хорошо охладить бутылку и не ждать особого повода."
        ),
        "category": "culture",
        "difficulty": "beginner",
        "estimated_minutes": 4,
        "sort_order": 60,
    },
    {
        "slug": "talk-about-wine-without-snobbery",
        "title": "Как говорить о вине без снобизма",
        "subtitle": "Точность без напряжения и красивых лишних слов.",
        "summary": "О вине можно говорить просто: что чувствуешь, что нравится, чего хочется больше или меньше.",
        "body": (
            "Хорошее описание вина не обязано звучать как лекция. Достаточно заметить аромат, вкус, тело и послевкусие: ягоды или цитрусы, лёгкое или плотное, свежее или мягкое.\n\n"
            "Фраза «мне нравится, потому что оно свежее и не тяжёлое» полезнее, чем попытка угадать редкую ноту. Вино становится ближе, когда язык остаётся человеческим.\n\n"
            "Со временем словарь сам станет богаче. Но уверенность начинается не с терминов, а с доверия к собственному впечатлению."
        ),
        "category": "culture",
        "difficulty": "beginner",
        "estimated_minutes": 4,
        "sort_order": 70,
    },
]


def _published_query(db: Session, project_user: ProjectUser):
    return db.query(Discovery).filter(
        Discovery.project_id == project_user.project_id,
        Discovery.is_published.is_(True),
    )


def list_published_discoveries(
    db: Session,
    project_user: ProjectUser,
    category: str | None = None,
    difficulty: str | None = None,
) -> list[Discovery]:
    query = _published_query(db, project_user)
    if category:
        query = query.filter(Discovery.category == category)
    if difficulty:
        query = query.filter(Discovery.difficulty == difficulty)

    return query.order_by(Discovery.sort_order.asc(), Discovery.published_at.desc(), Discovery.created_at.asc()).all()


def get_published_discovery_by_slug(db: Session, project_user: ProjectUser, slug: str) -> Discovery:
    discovery = _published_query(db, project_user).filter(Discovery.slug == slug).one_or_none()
    if discovery is None:
        raise NotFoundError("Discovery was not found")
    return discovery


def list_discovery_previews(db: Session, project_user: ProjectUser, limit: int = 3) -> list[Discovery]:
    return (
        _published_query(db, project_user)
        .order_by(Discovery.sort_order.asc(), Discovery.published_at.desc(), Discovery.created_at.asc())
        .limit(limit)
        .all()
    )


def seed_demo_discoveries(db: Session, project: Project) -> int:
    slugs = [item["slug"] for item in DEMO_DISCOVERIES]
    existing = (
        db.query(Discovery)
        .filter(
            Discovery.project_id == project.id,
            Discovery.slug.in_(slugs),
        )
        .all()
    )
    existing_by_slug = {item.slug: item for item in existing}
    now = datetime.now(timezone.utc)

    for item in DEMO_DISCOVERIES:
        discovery = existing_by_slug.get(item["slug"])
        if discovery is None:
            discovery = Discovery(project_id=project.id, slug=item["slug"])
            db.add(discovery)

        discovery.title = item["title"]
        discovery.subtitle = item["subtitle"]
        discovery.summary = item["summary"]
        discovery.body = item["body"]
        discovery.category = item["category"]
        discovery.difficulty = item["difficulty"]
        discovery.estimated_minutes = item["estimated_minutes"]
        discovery.cover_image_url = None
        discovery.is_published = True
        discovery.published_at = discovery.published_at or now
        discovery.sort_order = item["sort_order"]

    db.flush()
    return len(DEMO_DISCOVERIES)

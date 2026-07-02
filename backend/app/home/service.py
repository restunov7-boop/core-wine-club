from sqlalchemy.orm import Session

from app.bottle.service import build_bottle_progress
from app.diary.service import count_tasting_notes
from app.discoveries.schemas import DiscoveryPreview
from app.discoveries.service import list_discovery_previews
from app.home.schemas import HomeHero, HomeProject, HomeResponse, HomeSection, HomeSectionItem, HomeUser
from app.learning.service import list_learning_path_previews
from app.my_path.service import build_my_path
from app.progress.service import build_learning_progress_summary, build_quiz_progress_summary
from app.projects.models import ProjectUser
from app.taste_profile.service import build_taste_profile_preview
from app.users.models import User


def build_home_response(db: Session, user: User, project_user: ProjectUser) -> HomeResponse:
    discovery_items = [
        DiscoveryPreview.model_validate(item).model_dump(mode="json")
        for item in list_discovery_previews(db, project_user)
    ]
    learning_items = [item.model_dump(mode="json") for item in list_learning_path_previews(db, project_user)]
    learning_progress = build_learning_progress_summary(db, project_user)
    quiz_progress = build_quiz_progress_summary(db, project_user)
    bottle_progress = build_bottle_progress(db, project_user)
    my_path = build_my_path(db, project_user)
    activity_items = [
        HomeSectionItem(
            id=str(item.id),
            title=item.title,
            description=item.description,
            href=item.href,
            occurred_at=item.occurred_at,
        )
        for item in bottle_progress.activity_preview
    ]
    my_path_items = [
        HomeSectionItem(
            id=item.key,
            title=item.title,
            description=item.description,
            href=item.href,
        )
        for item in my_path.next_actions[:2]
    ]
    learning_journey_href = my_path.next_actions[0].href if my_path.next_actions else "/my-path"
    notes_count = count_tasting_notes(db, project_user)
    taste_profile_preview = build_taste_profile_preview(db, project_user)

    return HomeResponse(
        project=HomeProject(
            slug=project_user.project.slug,
            name=project_user.project.name,
        ),
        user=HomeUser(display_name=user.display_name),
        onboarding_completed=project_user.onboarding_completed_at is not None,
        hero=HomeHero(
            title="Добро пожаловать в винный клуб",
            subtitle="Твое личное пространство для вкуса, открытий и уверенности в выборе вина.",
        ),
        sections=[
            HomeSection(
                key="discoveries",
                title="Открытия",
                description="Первые винные маршруты уже ждут тебя.",
                items=discovery_items,
            ),
            HomeSection(
                key="learning",
                title="Уроки",
                description="Короткие маршруты, чтобы спокойно разобраться в вине.",
                items=learning_items,
                stats={
                    "completed_lessons_count": learning_progress.completed_lessons_count,
                    "available_lessons_count": learning_progress.available_lessons_count,
                },
            ),
            HomeSection(
                key="learning_journey",
                title="Путь обучения",
                description="Уроки, квиз и дневник складываются в твой винный прогресс.",
                href=learning_journey_href,
                stats={
                    "completed_lessons_count": learning_progress.completed_lessons_count,
                    "available_lessons_count": learning_progress.available_lessons_count,
                    "completed_quizzes_count": quiz_progress.completed_quizzes_count,
                    "available_quizzes_count": quiz_progress.available_quizzes_count,
                    "notes_count": notes_count,
                },
            ),
            HomeSection(
                key="quizzes",
                title="Квизы",
                description="Короткие проверки без оценок и давления.",
                href="/quizzes",
                stats={
                    "completed_quizzes_count": quiz_progress.completed_quizzes_count,
                    "available_quizzes_count": quiz_progress.available_quizzes_count,
                },
            ),
            HomeSection(
                key="bottle",
                title=bottle_progress.title,
                description=bottle_progress.subtitle,
                href="/bottle",
                stats={
                    "fill_percent": bottle_progress.fill_percent,
                    "completed_units": bottle_progress.completed_units,
                    "total_units": bottle_progress.total_units,
                },
            ),
            HomeSection(
                key="activity",
                title="Недавняя активность",
                description="Что уже наполнило твою бутылку.",
                href="/progress",
                items=activity_items,
            ),
            HomeSection(
                key="my_path",
                title="Что дальше",
                description="Короткий маршрут на сегодня.",
                href="/my-path",
                items=my_path_items,
            ),
            HomeSection(
                key="diary",
                title="Дневник вкуса",
                description="Сохраняй свои впечатления о винах и постепенно собирай личную карту вкуса.",
                stats={"notes_count": notes_count},
            ),
            HomeSection(
                key="taste_profile",
                title="Профиль вкуса",
                description="Первые закономерности появятся из твоих заметок.",
                stats=taste_profile_preview.model_dump(mode="json"),
            ),
            HomeSection(
                key="club",
                title="Клуб",
                description="Здесь появится пространство общения.",
            ),
        ],
    )

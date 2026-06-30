from app.database import SessionLocal
from app.learning.models import LearningPath, Lesson
from app.projects.service import ensure_default_project
from tests.conftest import login


def test_learning_paths_list_returns_seeded_path(client):
    headers = login(client)

    response = client.get("/api/v1/learning/paths", headers=headers)

    assert response.status_code == 200, response.text
    items = response.json()["data"]["items"]
    assert len(items) == 1
    assert items[0]["slug"] == "wine-basics"
    assert items[0]["difficulty"] == "beginner"
    assert items[0]["estimated_minutes"] == 25
    assert items[0]["lessons_count"] == 5
    assert items[0]["completed_lessons_count"] == 0


def test_learning_path_detail_returns_ordered_lessons(client):
    headers = login(client)

    response = client.get("/api/v1/learning/paths/wine-basics", headers=headers)

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["slug"] == "wine-basics"
    assert data["lessons_count"] == 5
    assert data["completed_lessons_count"] == 0
    assert len(data["lessons"]) == 5
    assert [lesson["slug"] for lesson in data["lessons"]] == [
        "how-wine-is-made",
        "red-white-rose-basics",
        "dry-sweet-balance",
        "how-to-taste-wine",
        "wine-with-food-basics",
    ]
    assert data["lessons"][0]["is_completed"] is False
    assert data["lessons"][0]["completed_at"] is None
    assert "progress" not in data
    assert "completion" not in data


def test_lesson_detail_returns_published_lesson(client):
    headers = login(client)

    response = client.get("/api/v1/learning/lessons/how-wine-is-made", headers=headers)

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["slug"] == "how-wine-is-made"
    assert data["lesson_type"] == "article"
    assert data["difficulty"] == "beginner"
    assert data["estimated_minutes"] == 5
    assert data["body"]
    assert data["is_completed"] is False
    assert data["completed_at"] is None


def test_unpublished_learning_content_is_not_visible(client):
    headers = login(client)
    db = SessionLocal()
    try:
        project = ensure_default_project(db)
        hidden_path = LearningPath(
            project_id=project.id,
            slug="hidden-path",
            title="Hidden path",
            summary="Hidden summary",
            difficulty="beginner",
            is_published=False,
        )
        hidden_lesson = Lesson(
            project_id=project.id,
            slug="hidden-lesson",
            title="Hidden lesson",
            summary="Hidden summary",
            body="Hidden body",
            lesson_type="article",
            difficulty="beginner",
            is_published=False,
        )
        db.add_all([hidden_path, hidden_lesson])
        db.commit()
    finally:
        db.close()

    path_response = client.get("/api/v1/learning/paths/hidden-path", headers=headers)
    lesson_response = client.get("/api/v1/learning/lessons/hidden-lesson", headers=headers)

    assert path_response.status_code == 404
    assert lesson_response.status_code == 404

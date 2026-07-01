from app.database import SessionLocal
from app.learning.models import Lesson
from app.projects.service import ensure_default_project
from tests.conftest import complete_onboarding, login, set_dev_user


LESSON_SLUG = "how-wine-is-made"


def _complete_first_lessons(client, headers: dict[str, str], count: int) -> None:
    path_response = client.get("/api/v1/learning/paths/wine-basics", headers=headers)
    assert path_response.status_code == 200, path_response.text
    for lesson in path_response.json()["data"]["lessons"][:count]:
        response = client.post(f"/api/v1/progress/lessons/{lesson['slug']}/complete", headers=headers)
        assert response.status_code == 200, response.text


def test_bottle_progress_starts_at_zero_for_fresh_user(client):
    headers = login(client)

    response = client.get("/api/v1/bottle/progress", headers=headers)

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["title"] == "Моя бутылка"
    assert data["source"] == "learning_and_diary"
    assert data["completed_units"] == 0
    assert data["total_units"] == 8
    assert data["fill_percent"] == 0
    assert data["breakdown"] == {
        "learning": {
            "completed_lessons_count": 0,
            "available_lessons_count": 5,
        },
        "diary": {
            "notes_count": 0,
            "target_notes_count": 3,
            "contributed_units": 0,
        },
    }
    assert data["next_action"] == {
        "label": "Продолжить уроки",
        "href": "/learn",
    }
    assert data["activity_preview"] == []


def test_bottle_progress_updates_after_complete_and_uncomplete(client):
    headers = login(client)

    client.post(f"/api/v1/progress/lessons/{LESSON_SLUG}/complete", headers=headers)
    after_complete = client.get("/api/v1/bottle/progress", headers=headers)
    client.delete(f"/api/v1/progress/lessons/{LESSON_SLUG}/complete", headers=headers)
    after_uncomplete = client.get("/api/v1/bottle/progress", headers=headers)

    assert after_complete.status_code == 200, after_complete.text
    assert after_complete.json()["data"]["completed_units"] == 1
    assert after_complete.json()["data"]["total_units"] == 8
    assert after_complete.json()["data"]["fill_percent"] == 12

    assert after_uncomplete.status_code == 200, after_uncomplete.text
    assert after_uncomplete.json()["data"]["completed_units"] == 0
    assert after_uncomplete.json()["data"]["total_units"] == 8
    assert after_uncomplete.json()["data"]["fill_percent"] == 0


def test_second_user_does_not_see_first_users_bottle_progress(client):
    user_one_headers = login(client)
    client.post(f"/api/v1/progress/lessons/{LESSON_SLUG}/complete", headers=user_one_headers)

    set_dev_user(telegram_id="200002", username="core_second_user", first_name="Second")
    user_two_headers = login(client)
    response = client.get("/api/v1/bottle/progress", headers=user_two_headers)

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["completed_units"] == 0
    assert data["total_units"] == 8
    assert data["fill_percent"] == 0


def test_unpublished_lessons_are_not_counted_in_bottle_total(client):
    headers = login(client)
    db = SessionLocal()
    try:
        project = ensure_default_project(db)
        hidden_lesson = Lesson(
            project_id=project.id,
            slug="hidden-bottle-lesson",
            title="Hidden bottle lesson",
            summary="Hidden summary",
            body="Hidden body",
            lesson_type="article",
            difficulty="beginner",
            is_published=False,
        )
        db.add(hidden_lesson)
        db.commit()
    finally:
        db.close()

    response = client.get("/api/v1/bottle/progress", headers=headers)

    assert response.status_code == 200, response.text
    assert response.json()["data"]["breakdown"]["learning"]["available_lessons_count"] == 5
    assert response.json()["data"]["total_units"] == 8


def test_home_includes_bottle_preview(client):
    headers = login(client)
    complete_onboarding(client, headers)
    client.post(f"/api/v1/progress/lessons/{LESSON_SLUG}/complete", headers=headers)

    response = client.get("/api/v1/home", headers=headers)

    assert response.status_code == 200, response.text
    sections = {section["key"]: section for section in response.json()["data"]["sections"]}
    assert sections["bottle"]["title"] == "Моя бутылка"
    assert sections["bottle"]["href"] == "/bottle"
    assert sections["bottle"]["stats"] == {
        "fill_percent": 12,
        "completed_units": 1,
        "total_units": 8,
    }


def test_bottle_combines_learning_and_diary_progress(client):
    headers = login(client)
    note = client.post(
        "/api/v1/diary/notes",
        headers=headers,
        json={
            "wine_name": "Sprint 11 Wine",
            "rating": 4,
            "wine_color": "red",
            "sweetness": "dry",
        },
    )
    assert note.status_code == 200, note.text
    client.post(f"/api/v1/progress/lessons/{LESSON_SLUG}/complete", headers=headers)

    response = client.get("/api/v1/bottle/progress", headers=headers)

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["completed_units"] == 2
    assert data["total_units"] == 8
    assert data["fill_percent"] == 25
    assert data["breakdown"]["learning"] == {
        "completed_lessons_count": 1,
        "available_lessons_count": 5,
    }
    assert data["breakdown"]["diary"] == {
        "notes_count": 1,
        "target_notes_count": 3,
        "contributed_units": 1,
    }
    assert len(data["activity_preview"]) == 2
    assert {item["title"] for item in data["activity_preview"]} == {"Урок завершён", "Заметка добавлена"}


def test_deleting_diary_note_reduces_current_bottle_diary_contribution(client):
    headers = login(client)
    note = client.post(
        "/api/v1/diary/notes",
        headers=headers,
        json={
            "wine_name": "Delete Me",
            "rating": 3,
            "wine_color": "white",
            "sweetness": "dry",
        },
    )
    note_id = note.json()["data"]["id"]
    before_delete = client.get("/api/v1/bottle/progress", headers=headers)

    delete_response = client.delete(f"/api/v1/diary/notes/{note_id}", headers=headers)
    after_delete = client.get("/api/v1/bottle/progress", headers=headers)

    assert delete_response.status_code == 200, delete_response.text
    assert before_delete.json()["data"]["breakdown"]["diary"]["notes_count"] == 1
    assert before_delete.json()["data"]["completed_units"] == 1
    assert after_delete.json()["data"]["breakdown"]["diary"]["notes_count"] == 0
    assert after_delete.json()["data"]["completed_units"] == 0


def test_bottle_activity_preview_returns_max_three_items(client):
    headers = login(client)
    _complete_first_lessons(client, headers, count=4)
    client.post(
        "/api/v1/diary/notes",
        headers=headers,
        json={
            "wine_name": "Bottle Preview Wine",
            "rating": 4,
            "wine_color": "red",
            "sweetness": "dry",
        },
    )

    response = client.get("/api/v1/bottle/progress", headers=headers)

    assert response.status_code == 200, response.text
    activity_preview = response.json()["data"]["activity_preview"]
    assert len(activity_preview) == 3
    assert activity_preview[0]["title"] == "Заметка добавлена"
    assert activity_preview[0]["description"] == "Bottle Preview Wine"
    assert activity_preview[0]["occurred_at"]

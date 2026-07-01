import uuid

from app.database import SessionLocal
from app.progress.models import ProgressEvent
from app.projects.service import ensure_default_project
from app.quizzes.models import Quiz
from tests.conftest import login


def test_quiz_list_returns_seeded_published_quiz(client):
    headers = login(client)

    response = client.get("/api/v1/quizzes", headers=headers)

    assert response.status_code == 200, response.text
    items = response.json()["data"]["items"]
    assert len(items) == 1
    assert items[0]["slug"] == "wine-basics-check"
    assert items[0]["title"] == "Проверка винной базы"
    assert items[0]["difficulty"] == "beginner"
    assert items[0]["estimated_minutes"] == 4
    assert items[0]["questions_count"] == 5


def test_quiz_detail_returns_questions_without_correct_option_key(client):
    headers = login(client)

    response = client.get("/api/v1/quizzes/wine-basics-check", headers=headers)

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["slug"] == "wine-basics-check"
    assert len(data["questions"]) == 5
    assert data["questions"][0]["question_type"] == "single_choice"
    assert data["questions"][0]["options"][0] == {
        "key": "a",
        "label": "Вино без сахара или почти без сахара",
    }
    for question in data["questions"]:
        assert "correct_option_key" not in question
        assert "explanation" not in question


def test_quiz_check_returns_result_and_explanations(client):
    headers = login(client)
    detail = client.get("/api/v1/quizzes/wine-basics-check", headers=headers).json()["data"]
    answers = [
        {"question_id": detail["questions"][0]["id"], "selected_option_key": "a"},
        {"question_id": detail["questions"][1]["id"], "selected_option_key": "a"},
        {"question_id": detail["questions"][2]["id"], "selected_option_key": "a"},
        {"question_id": detail["questions"][3]["id"], "selected_option_key": "b"},
        {"question_id": detail["questions"][4]["id"], "selected_option_key": "b"},
    ]

    response = client.post("/api/v1/quizzes/wine-basics-check/check", headers=headers, json={"answers": answers})

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["quiz_slug"] == "wine-basics-check"
    assert data["total_questions"] == 5
    assert data["correct_count"] == 4
    assert len(data["items"]) == 5
    assert data["items"][0]["is_correct"] is True
    assert data["items"][1]["is_correct"] is False
    assert data["items"][1]["correct_option_key"] == "b"
    assert data["items"][1]["explanation"]


def test_quiz_check_rejects_unknown_question_id(client):
    headers = login(client)

    response = client.post(
        "/api/v1/quizzes/wine-basics-check/check",
        headers=headers,
        json={"answers": [{"question_id": str(uuid.uuid4()), "selected_option_key": "a"}]},
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


def test_unpublished_quiz_is_not_visible(client):
    headers = login(client)
    db = SessionLocal()
    try:
        project = ensure_default_project(db)
        hidden_quiz = Quiz(
            project_id=project.id,
            slug="hidden-quiz",
            title="Hidden quiz",
            summary="Hidden summary",
            difficulty="beginner",
            is_published=False,
        )
        db.add(hidden_quiz)
        db.commit()
    finally:
        db.close()

    response = client.get("/api/v1/quizzes/hidden-quiz", headers=headers)

    assert response.status_code == 404


def test_quiz_check_does_not_create_progress_event(client):
    headers = login(client)
    detail = client.get("/api/v1/quizzes/wine-basics-check", headers=headers).json()["data"]
    db = SessionLocal()
    try:
        before_count = db.query(ProgressEvent).count()
    finally:
        db.close()

    response = client.post(
        "/api/v1/quizzes/wine-basics-check/check",
        headers=headers,
        json={
            "answers": [
                {"question_id": question["id"], "selected_option_key": question["options"][0]["key"]}
                for question in detail["questions"]
            ]
        },
    )

    assert response.status_code == 200, response.text
    db = SessionLocal()
    try:
        after_count = db.query(ProgressEvent).count()
    finally:
        db.close()
    assert after_count == before_count

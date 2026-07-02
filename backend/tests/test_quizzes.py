import uuid

from app.database import SessionLocal
from app.progress.models import ProgressEvent
from app.progress.service import QUIZ_COMPLETED_EVENT, QUIZ_SOURCE_TYPE
from app.projects.service import ensure_default_project
from app.quizzes.models import Quiz
from tests.conftest import login, set_dev_user


QUIZ_SLUG = "wine-basics-check"
CORRECT_ANSWER_KEYS = ["a", "b", "a", "b", "b"]


def _quiz_detail(client, headers: dict[str, str]) -> dict:
    response = client.get(f"/api/v1/quizzes/{QUIZ_SLUG}", headers=headers)
    assert response.status_code == 200, response.text
    return response.json()["data"]


def _quiz_answers(detail: dict, answer_keys: list[str]) -> list[dict[str, str]]:
    return [
        {"question_id": question["id"], "selected_option_key": answer_keys[index]}
        for index, question in enumerate(detail["questions"])
    ]


def _count_quiz_completion_events() -> int:
    db = SessionLocal()
    try:
        return (
            db.query(ProgressEvent)
            .filter(
                ProgressEvent.event_type == QUIZ_COMPLETED_EVENT,
                ProgressEvent.source_type == QUIZ_SOURCE_TYPE,
            )
            .count()
        )
    finally:
        db.close()


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
    assert items[0]["is_completed"] is False
    assert items[0]["completed_at"] is None


def test_quiz_detail_returns_questions_without_correct_option_key(client):
    headers = login(client)

    response = client.get("/api/v1/quizzes/wine-basics-check", headers=headers)

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["slug"] == "wine-basics-check"
    assert data["is_completed"] is False
    assert data["completed_at"] is None
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
    detail = _quiz_detail(client, headers)
    answers = _quiz_answers(detail, ["a", "a", "a", "b", "b"])

    response = client.post("/api/v1/quizzes/wine-basics-check/check", headers=headers, json={"answers": answers})

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["quiz_slug"] == "wine-basics-check"
    assert data["total_questions"] == 5
    assert data["correct_count"] == 4
    assert data["is_completed"] is False
    assert data["completed_at"] is None
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


def test_partial_quiz_check_does_not_create_completion_event(client):
    headers = login(client)
    detail = _quiz_detail(client, headers)

    response = client.post(
        "/api/v1/quizzes/wine-basics-check/check",
        headers=headers,
        json={"answers": _quiz_answers(detail, ["a", "a", "a", "b", "b"])},
    )

    assert response.status_code == 200, response.text
    assert response.json()["data"]["is_completed"] is False
    assert response.json()["data"]["completed_at"] is None
    assert _count_quiz_completion_events() == 0


def test_perfect_quiz_check_creates_completion_event_without_attempt_history(client):
    headers = login(client)
    detail = _quiz_detail(client, headers)

    response = client.post(
        f"/api/v1/quizzes/{QUIZ_SLUG}/check",
        headers=headers,
        json={"answers": _quiz_answers(detail, CORRECT_ANSWER_KEYS)},
    )

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["correct_count"] == 5
    assert data["is_completed"] is True
    assert data["completed_at"]

    db = SessionLocal()
    try:
        events = (
            db.query(ProgressEvent)
            .filter(
                ProgressEvent.event_type == QUIZ_COMPLETED_EVENT,
                ProgressEvent.source_type == QUIZ_SOURCE_TYPE,
            )
            .all()
        )
    finally:
        db.close()
    assert len(events) == 1
    assert events[0].source_slug == QUIZ_SLUG
    assert events[0].metadata_json == {
        "quiz_title": "Проверка винной базы",
        "correct_count": 5,
        "total_questions": 5,
    }


def test_perfect_quiz_check_is_idempotent(client):
    headers = login(client)
    detail = _quiz_detail(client, headers)
    payload = {"answers": _quiz_answers(detail, CORRECT_ANSWER_KEYS)}

    first = client.post(f"/api/v1/quizzes/{QUIZ_SLUG}/check", headers=headers, json=payload)
    second = client.post(f"/api/v1/quizzes/{QUIZ_SLUG}/check", headers=headers, json=payload)

    assert first.status_code == 200, first.text
    assert second.status_code == 200, second.text
    assert first.json()["data"]["completed_at"] == second.json()["data"]["completed_at"]
    assert _count_quiz_completion_events() == 1


def test_quiz_list_and_detail_include_current_user_completion_state(client):
    headers = login(client)
    detail = _quiz_detail(client, headers)
    client.post(
        f"/api/v1/quizzes/{QUIZ_SLUG}/check",
        headers=headers,
        json={"answers": _quiz_answers(detail, CORRECT_ANSWER_KEYS)},
    )

    list_response = client.get("/api/v1/quizzes", headers=headers)
    detail_response = client.get(f"/api/v1/quizzes/{QUIZ_SLUG}", headers=headers)

    assert list_response.status_code == 200, list_response.text
    item = list_response.json()["data"]["items"][0]
    assert item["slug"] == QUIZ_SLUG
    assert item["is_completed"] is True
    assert item["completed_at"]

    assert detail_response.status_code == 200, detail_response.text
    data = detail_response.json()["data"]
    assert data["is_completed"] is True
    assert data["completed_at"] == item["completed_at"]


def test_second_user_does_not_see_first_users_quiz_completion(client):
    user_one_headers = login(client)
    detail = _quiz_detail(client, user_one_headers)
    client.post(
        f"/api/v1/quizzes/{QUIZ_SLUG}/check",
        headers=user_one_headers,
        json={"answers": _quiz_answers(detail, CORRECT_ANSWER_KEYS)},
    )

    set_dev_user(telegram_id="200002", username="core_second_user", first_name="Second")
    user_two_headers = login(client)
    list_response = client.get("/api/v1/quizzes", headers=user_two_headers)
    detail_response = client.get(f"/api/v1/quizzes/{QUIZ_SLUG}", headers=user_two_headers)

    assert list_response.status_code == 200, list_response.text
    assert list_response.json()["data"]["items"][0]["is_completed"] is False
    assert list_response.json()["data"]["items"][0]["completed_at"] is None
    assert detail_response.status_code == 200, detail_response.text
    assert detail_response.json()["data"]["is_completed"] is False
    assert detail_response.json()["data"]["completed_at"] is None
    assert _count_quiz_completion_events() == 1

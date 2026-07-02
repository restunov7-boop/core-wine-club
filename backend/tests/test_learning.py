from app.database import SessionLocal
from app.learning.models import LearningPath, Lesson
from app.projects.service import ensure_default_project
from tests.conftest import login, set_dev_user


QUIZ_SLUG = "wine-basics-check"
CORRECT_ANSWER_KEYS = ["a", "b", "a", "b", "b"]


def _complete_all_lessons(client, headers: dict[str, str]) -> list[str]:
    path_response = client.get("/api/v1/learning/paths/wine-basics", headers=headers)
    assert path_response.status_code == 200, path_response.text
    lesson_slugs = [lesson["slug"] for lesson in path_response.json()["data"]["lessons"]]
    for slug in lesson_slugs:
        response = client.post(f"/api/v1/progress/lessons/{slug}/complete", headers=headers)
        assert response.status_code == 200, response.text
    return lesson_slugs


def _complete_quiz(client, headers: dict[str, str]) -> None:
    detail_response = client.get(f"/api/v1/quizzes/{QUIZ_SLUG}", headers=headers)
    assert detail_response.status_code == 200, detail_response.text
    questions = detail_response.json()["data"]["questions"]
    response = client.post(
        f"/api/v1/quizzes/{QUIZ_SLUG}/check",
        headers=headers,
        json={
            "answers": [
                {"question_id": question["id"], "selected_option_key": CORRECT_ANSWER_KEYS[index]}
                for index, question in enumerate(questions)
            ]
        },
    )
    assert response.status_code == 200, response.text
    assert response.json()["data"]["is_completed"] is True


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
    assert items[0]["recommended_quizzes_count"] == 1
    assert items[0]["completed_recommended_quizzes_count"] == 0


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
    assert len(data["recommended_quizzes"]) == 1
    recommended_quiz = data["recommended_quizzes"][0]
    assert recommended_quiz["slug"] == QUIZ_SLUG
    assert recommended_quiz["questions_count"] == 5
    assert recommended_quiz["href"] == f"/quizzes/{QUIZ_SLUG}"
    assert recommended_quiz["is_completed"] is False
    assert recommended_quiz["completed_at"] is None
    assert "questions" not in recommended_quiz
    assert "correct_option_key" not in recommended_quiz
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
    assert data["next_step"] is None


def test_learning_recommended_quiz_completion_is_user_scoped(client):
    user_one_headers = login(client)
    _complete_quiz(client, user_one_headers)

    user_one_response = client.get("/api/v1/learning/paths/wine-basics", headers=user_one_headers)

    assert user_one_response.status_code == 200, user_one_response.text
    recommended_quiz = user_one_response.json()["data"]["recommended_quizzes"][0]
    assert recommended_quiz["slug"] == QUIZ_SLUG
    assert recommended_quiz["is_completed"] is True
    assert recommended_quiz["completed_at"]

    set_dev_user(telegram_id="200002", username="core_second_user", first_name="Second")
    user_two_headers = login(client)
    user_two_response = client.get("/api/v1/learning/paths/wine-basics", headers=user_two_headers)

    assert user_two_response.status_code == 200, user_two_response.text
    second_user_quiz = user_two_response.json()["data"]["recommended_quizzes"][0]
    assert second_user_quiz["is_completed"] is False
    assert second_user_quiz["completed_at"] is None


def test_lesson_next_step_appears_after_all_path_lessons_are_completed(client):
    headers = login(client)

    before_response = client.get("/api/v1/learning/lessons/wine-with-food-basics", headers=headers)
    assert before_response.status_code == 200, before_response.text
    assert before_response.json()["data"]["next_step"] is None

    _complete_all_lessons(client, headers)
    after_response = client.get("/api/v1/learning/lessons/wine-with-food-basics", headers=headers)

    assert after_response.status_code == 200, after_response.text
    next_step = after_response.json()["data"]["next_step"]
    assert next_step["type"] == "quiz"
    assert next_step["href"] == f"/quizzes/{QUIZ_SLUG}"
    assert next_step["quiz_slug"] == QUIZ_SLUG


def test_lesson_next_step_points_to_my_path_after_recommended_quiz_completed(client):
    headers = login(client)
    _complete_all_lessons(client, headers)
    _complete_quiz(client, headers)

    response = client.get("/api/v1/learning/lessons/wine-with-food-basics", headers=headers)

    assert response.status_code == 200, response.text
    next_step = response.json()["data"]["next_step"]
    assert next_step["type"] == "my_path"
    assert next_step["href"] == "/my-path"
    assert next_step["quiz_slug"] is None


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

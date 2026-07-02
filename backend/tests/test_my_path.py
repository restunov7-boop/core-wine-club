from tests.conftest import create_note, login, set_dev_user


LESSON_SLUG = "how-wine-is-made"


def _action_keys(payload: dict) -> list[str]:
    return [item["key"] for item in payload["next_actions"]]


def _complete_all_lessons(client, headers: dict[str, str]) -> None:
    path_response = client.get("/api/v1/learning/paths/wine-basics", headers=headers)
    assert path_response.status_code == 200, path_response.text
    for lesson in path_response.json()["data"]["lessons"]:
        response = client.post(f"/api/v1/progress/lessons/{lesson['slug']}/complete", headers=headers)
        assert response.status_code == 200, response.text


def test_my_path_requires_auth(client):
    response = client.get("/api/v1/my-path")

    assert response.status_code == 401, response.text


def test_fresh_user_receives_start_learning_and_first_diary_actions(client):
    headers = login(client)

    response = client.get("/api/v1/my-path", headers=headers)

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["summary"] == {
        "completed_lessons_count": 0,
        "available_lessons_count": 5,
        "completed_quizzes_count": 0,
        "available_quizzes_count": 1,
        "diary_notes_count": 0,
        "diary_target_notes_count": 3,
        "bottle_fill_percent": 0,
        "recent_activity_count": 0,
    }
    assert _action_keys(data) == ["start_learning", "add_first_diary_note"]
    assert data["next_actions"][0]["href"] == "/learn"


def test_my_path_changes_to_continue_learning_after_lesson(client):
    headers = login(client)
    client.post(f"/api/v1/progress/lessons/{LESSON_SLUG}/complete", headers=headers)

    response = client.get("/api/v1/my-path", headers=headers)

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["summary"]["completed_lessons_count"] == 1
    assert data["summary"]["completed_quizzes_count"] == 0
    assert data["summary"]["available_quizzes_count"] == 1
    assert data["summary"]["bottle_fill_percent"] == 11
    keys = _action_keys(data)
    assert "continue_learning" in keys
    assert "start_learning" not in keys
    assert "try_quiz" not in keys
    assert "view_bottle" in keys
    assert "view_activity" in keys


def test_my_path_suggests_quiz_after_all_lessons_are_completed(client):
    headers = login(client)
    _complete_all_lessons(client, headers)

    response = client.get("/api/v1/my-path", headers=headers)

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["summary"]["completed_lessons_count"] == 5
    assert data["summary"]["available_lessons_count"] == 5
    assert data["summary"]["completed_quizzes_count"] == 0
    keys = _action_keys(data)
    assert "continue_learning" not in keys
    assert "try_quiz" in keys


def test_my_path_diary_actions_change_after_notes(client):
    headers = login(client)
    create_note(client, headers, wine_name="First My Path Wine")

    one_note_response = client.get("/api/v1/my-path", headers=headers)

    assert one_note_response.status_code == 200, one_note_response.text
    assert "add_diary_note" in _action_keys(one_note_response.json()["data"])
    assert "add_first_diary_note" not in _action_keys(one_note_response.json()["data"])

    create_note(client, headers, wine_name="Second My Path Wine")
    create_note(client, headers, wine_name="Third My Path Wine")

    three_notes_response = client.get("/api/v1/my-path", headers=headers)

    assert three_notes_response.status_code == 200, three_notes_response.text
    keys = _action_keys(three_notes_response.json()["data"])
    assert "add_diary_note" not in keys
    assert "view_taste_profile" in keys


def test_my_path_returns_max_four_actions(client):
    headers = login(client)
    _complete_all_lessons(client, headers)
    create_note(client, headers, wine_name="One")
    create_note(client, headers, wine_name="Two")
    create_note(client, headers, wine_name="Three")

    response = client.get("/api/v1/my-path", headers=headers)

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert len(data["next_actions"]) == 4
    assert _action_keys(data) == [
        "try_quiz",
        "view_bottle",
        "view_taste_profile",
        "view_activity",
    ]


def test_second_user_does_not_see_first_users_my_path_state(client):
    user_one_headers = login(client)
    client.post(f"/api/v1/progress/lessons/{LESSON_SLUG}/complete", headers=user_one_headers)
    create_note(client, user_one_headers, wine_name="Private State Wine")

    set_dev_user(telegram_id="200002", username="core_second_user", first_name="Second")
    user_two_headers = login(client)
    response = client.get("/api/v1/my-path", headers=user_two_headers)

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["summary"]["completed_lessons_count"] == 0
    assert data["summary"]["completed_quizzes_count"] == 0
    assert data["summary"]["available_quizzes_count"] == 1
    assert data["summary"]["diary_notes_count"] == 0
    assert data["summary"]["bottle_fill_percent"] == 0
    assert data["summary"]["recent_activity_count"] == 0
    assert _action_keys(data) == ["start_learning", "add_first_diary_note"]

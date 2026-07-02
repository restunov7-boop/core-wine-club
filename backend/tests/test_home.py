from tests.conftest import complete_onboarding, create_note, login


def _sections_by_key(payload: dict) -> dict:
    return {section["key"]: section for section in payload["sections"]}


def _complete_first_lessons(client, headers: dict[str, str], count: int) -> None:
    path_response = client.get("/api/v1/learning/paths/wine-basics", headers=headers)
    assert path_response.status_code == 200, path_response.text
    for lesson in path_response.json()["data"]["lessons"][:count]:
        response = client.post(f"/api/v1/progress/lessons/{lesson['slug']}/complete", headers=headers)
        assert response.status_code == 200, response.text


def test_home_returns_previews_and_empty_stats(client):
    headers = login(client)
    complete_onboarding(client, headers)

    response = client.get("/api/v1/home", headers=headers)

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["project"]["slug"] == "doch-vinodela"
    assert data["onboarding_completed"] is True

    sections = _sections_by_key(data)
    assert {"discoveries", "learning", "quizzes", "bottle", "activity", "my_path", "diary", "taste_profile"}.issubset(sections)
    assert len(sections["discoveries"]["items"]) == 3
    assert sections["learning"]["items"][0]["slug"] == "wine-basics"
    assert sections["learning"]["items"][0]["lessons_count"] == 5
    assert sections["learning"]["items"][0]["completed_lessons_count"] == 0
    assert sections["learning"]["items"][0]["estimated_minutes"] == 25
    assert sections["learning"]["stats"]["completed_lessons_count"] == 0
    assert sections["learning"]["stats"]["available_lessons_count"] == 5
    assert sections["quizzes"]["href"] == "/quizzes"
    assert sections["quizzes"]["stats"] == {
        "completed_quizzes_count": 0,
        "available_quizzes_count": 1,
    }
    assert sections["bottle"]["href"] == "/bottle"
    assert sections["bottle"]["stats"] == {
        "fill_percent": 0,
        "completed_units": 0,
        "total_units": 9,
    }
    assert sections["activity"]["href"] == "/progress"
    assert sections["activity"]["items"] == []
    assert sections["my_path"]["href"] == "/my-path"
    assert len(sections["my_path"]["items"]) == 2
    assert sections["my_path"]["items"][0]["title"] == "Начать с первого урока"
    assert sections["my_path"]["items"][1]["title"] == "Добавить первую заметку"
    assert sections["diary"]["stats"]["notes_count"] == 0
    assert sections["taste_profile"]["stats"]["notes_count"] == 0


def test_home_stats_update_after_diary_note(client):
    headers = login(client)
    complete_onboarding(client, headers)
    create_note(client, headers, rating=4)

    response = client.get("/api/v1/home", headers=headers)

    assert response.status_code == 200, response.text
    sections = _sections_by_key(response.json()["data"])
    assert sections["diary"]["stats"]["notes_count"] == 1
    assert sections["taste_profile"]["stats"]["notes_count"] == 1
    assert sections["taste_profile"]["stats"]["average_rating"] == 4.0
    assert sections["activity"]["items"][0]["title"] == "Заметка добавлена"
    assert sections["activity"]["items"][0]["description"] == "Chianti Classico"


def test_home_activity_preview_returns_max_three_items(client):
    headers = login(client)
    complete_onboarding(client, headers)
    _complete_first_lessons(client, headers, count=4)
    create_note(client, headers, wine_name="Home Preview Wine")

    response = client.get("/api/v1/home", headers=headers)

    assert response.status_code == 200, response.text
    activity = _sections_by_key(response.json()["data"])["activity"]
    assert activity["href"] == "/progress"
    assert len(activity["items"]) == 3
    assert activity["items"][0]["title"] == "Заметка добавлена"
    assert activity["items"][0]["description"] == "Home Preview Wine"
    assert activity["items"][0]["occurred_at"]


def test_home_my_path_preview_returns_max_two_actions(client):
    headers = login(client)
    complete_onboarding(client, headers)
    _complete_first_lessons(client, headers, count=1)
    create_note(client, headers, wine_name="Home Path One")
    create_note(client, headers, wine_name="Home Path Two")
    create_note(client, headers, wine_name="Home Path Three")

    response = client.get("/api/v1/home", headers=headers)

    assert response.status_code == 200, response.text
    my_path = _sections_by_key(response.json()["data"])["my_path"]
    assert my_path["href"] == "/my-path"
    assert len(my_path["items"]) == 2
    assert [item["href"] for item in my_path["items"]] == ["/learn", "/quizzes"]

from tests.conftest import complete_onboarding, create_note, login, set_dev_user


def test_taste_profile_empty_state_for_current_user(client):
    headers = login(client)
    complete_onboarding(client, headers)

    response = client.get("/api/v1/taste-profile", headers=headers)

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["stats"]["notes_count"] == 0
    assert data["stats"]["average_rating"] is None
    assert data["insights"]


def test_taste_profile_computes_stats_from_owned_notes(client):
    headers = login(client)
    complete_onboarding(client, headers)
    create_note(
        client,
        headers,
        wine_name="Chianti Classico",
        country="Italy",
        region="Tuscany",
        wine_color="red",
        sweetness="dry",
        rating=4,
        aroma_notes=["cherry", "spice"],
        taste_notes=["fresh", "structured"],
        would_buy_again=True,
    )
    create_note(
        client,
        headers,
        wine_name="Barbera",
        country="Italy",
        region="Piedmont",
        wine_color="red",
        sweetness="dry",
        rating=5,
        aroma_notes=["cherry", "violet"],
        taste_notes=["fresh", "juicy"],
        would_buy_again=True,
    )
    create_note(
        client,
        headers,
        wine_name="Loire Sparkling",
        country="France",
        region="Loire",
        wine_color="sparkling",
        sweetness="semi_dry",
        rating=3,
        aroma_notes=["apple", "cherry"],
        taste_notes=["fresh", "light"],
        would_buy_again=False,
    )

    response = client.get("/api/v1/taste-profile", headers=headers)

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    stats = data["stats"]
    assert stats["notes_count"] == 3
    assert stats["average_rating"] == 4.0
    assert stats["would_buy_again_ratio"] == 0.67
    assert stats["favorite_wine_colors"][0] == {"key": "red", "count": 2}
    assert stats["top_aroma_notes"][0] == {"key": "cherry", "count": 3}
    assert len(data["insights"]) <= 4


def test_taste_profile_uses_only_current_user_notes(client):
    user_one_headers = login(client)
    complete_onboarding(client, user_one_headers)
    create_note(client, user_one_headers)

    set_dev_user(telegram_id="200002", username="second_user", first_name="Second")
    user_two_headers = login(client)
    complete_onboarding(client, user_two_headers)

    response = client.get("/api/v1/taste-profile", headers=user_two_headers)

    assert response.status_code == 200, response.text
    assert response.json()["data"]["stats"]["notes_count"] == 0

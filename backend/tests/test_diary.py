from tests.conftest import complete_onboarding, create_note, login, set_dev_user


def test_diary_crud_for_current_user(client):
    headers = login(client)
    complete_onboarding(client, headers)

    note = create_note(client, headers)
    assert note["wine_name"] == "Chianti Classico"
    assert note["rating"] == 4

    note_id = note["id"]
    notes = client.get("/api/v1/diary/notes", headers=headers)
    assert notes.status_code == 200, notes.text
    assert notes.json()["data"]["total"] == 1

    detail = client.get(f"/api/v1/diary/notes/{note_id}", headers=headers)
    assert detail.status_code == 200, detail.text
    assert detail.json()["data"]["id"] == note_id

    patched = client.patch(
        f"/api/v1/diary/notes/{note_id}",
        headers=headers,
        json={"rating": 5, "personal_note": "Even better on day two."},
    )
    assert patched.status_code == 200, patched.text
    assert patched.json()["data"]["rating"] == 5
    assert patched.json()["data"]["personal_note"] == "Even better on day two."

    deleted = client.delete(f"/api/v1/diary/notes/{note_id}", headers=headers)
    assert deleted.status_code == 200, deleted.text
    assert deleted.json()["data"]["deleted"] is True

    missing = client.get(f"/api/v1/diary/notes/{note_id}", headers=headers)
    assert missing.status_code == 404


def test_diary_notes_are_owned_by_current_project_user(client):
    user_one_headers = login(client)
    complete_onboarding(client, user_one_headers)
    note = create_note(client, user_one_headers)

    set_dev_user(telegram_id="200002", username="second_user", first_name="Second")
    user_two_headers = login(client)
    complete_onboarding(client, user_two_headers)

    notes = client.get("/api/v1/diary/notes", headers=user_two_headers)
    assert notes.status_code == 200, notes.text
    assert notes.json()["data"]["total"] == 0

    detail = client.get(f"/api/v1/diary/notes/{note['id']}", headers=user_two_headers)
    assert detail.status_code == 404

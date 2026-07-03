import uuid

from app.database import SessionLocal
from app.projects.models import Project, ProjectUser
from app.wine_shelf.models import WineShelfItem
from tests.conftest import complete_onboarding, create_note, login, set_dev_user


def shelf_payload(**overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "wine_name": "Etna Rosso",
        "country": "Italy",
        "region": "Sicily",
        "grape": "Nerello Mascalese",
        "style": "Red",
        "status": "want_to_try",
        "personal_note": "Looks like a good next bottle.",
    }
    payload.update(overrides)
    return payload


def create_shelf_item(client, headers: dict[str, str], **overrides: object) -> dict:
    response = client.post("/api/v1/wine-shelf/items", headers=headers, json=shelf_payload(**overrides))
    assert response.status_code == 200, response.text
    return response.json()["data"]


def test_wine_shelf_crud_for_current_project_user(client):
    headers = login(client)
    complete_onboarding(client, headers)
    note = create_note(client, headers)

    item = create_shelf_item(client, headers, diary_note_id=note["id"])
    assert item["wine_name"] == "Etna Rosso"
    assert item["status"] == "want_to_try"
    assert item["diary_note_id"] == note["id"]

    item_id = item["id"]
    items = client.get("/api/v1/wine-shelf/items", headers=headers)
    assert items.status_code == 200, items.text
    assert items.json()["data"]["total"] == 1

    filtered = client.get("/api/v1/wine-shelf/items?status=want_to_try", headers=headers)
    assert filtered.status_code == 200, filtered.text
    assert filtered.json()["data"]["total"] == 1

    detail = client.get(f"/api/v1/wine-shelf/items/{item_id}", headers=headers)
    assert detail.status_code == 200, detail.text
    assert detail.json()["data"]["id"] == item_id

    patched = client.patch(
        f"/api/v1/wine-shelf/items/{item_id}",
        headers=headers,
        json={"status": "buy_again", "personal_note": "Great with dinner."},
    )
    assert patched.status_code == 200, patched.text
    assert patched.json()["data"]["status"] == "buy_again"
    assert patched.json()["data"]["personal_note"] == "Great with dinner."

    deleted = client.delete(f"/api/v1/wine-shelf/items/{item_id}", headers=headers)
    assert deleted.status_code == 200, deleted.text
    assert deleted.json()["data"]["deleted"] is True

    missing = client.get(f"/api/v1/wine-shelf/items/{item_id}", headers=headers)
    assert missing.status_code == 404


def test_wine_shelf_rejects_invalid_status(client):
    headers = login(client)
    complete_onboarding(client, headers)

    response = client.post(
        "/api/v1/wine-shelf/items",
        headers=headers,
        json=shelf_payload(status="favorite"),
    )
    assert response.status_code == 422


def test_wine_shelf_items_are_owned_by_current_project_user(client):
    user_one_headers = login(client)
    complete_onboarding(client, user_one_headers)
    item = create_shelf_item(client, user_one_headers)

    set_dev_user(telegram_id="200002", username="second_user", first_name="Second")
    user_two_headers = login(client)
    complete_onboarding(client, user_two_headers)

    items = client.get("/api/v1/wine-shelf/items", headers=user_two_headers)
    assert items.status_code == 200, items.text
    assert items.json()["data"]["total"] == 0

    detail = client.get(f"/api/v1/wine-shelf/items/{item['id']}", headers=user_two_headers)
    assert detail.status_code == 404


def test_wine_shelf_cannot_link_another_users_diary_note(client):
    user_one_headers = login(client)
    complete_onboarding(client, user_one_headers)
    note = create_note(client, user_one_headers)

    set_dev_user(telegram_id="200002", username="second_user", first_name="Second")
    user_two_headers = login(client)
    complete_onboarding(client, user_two_headers)

    response = client.post(
        "/api/v1/wine-shelf/items",
        headers=user_two_headers,
        json=shelf_payload(diary_note_id=note["id"]),
    )
    assert response.status_code == 404


def test_wine_shelf_prevents_cross_project_access(client):
    headers = login(client)
    complete_onboarding(client, headers)

    db = SessionLocal()
    try:
        current_project_user = db.query(ProjectUser).one()
        other_project = Project(
            id=uuid.uuid4(),
            slug="other-project",
            name="Other Project",
            is_active=True,
        )
        db.add(other_project)
        db.flush()
        other_project_user = ProjectUser(
            id=uuid.uuid4(),
            user_id=current_project_user.user_id,
            project_id=other_project.id,
            role="member",
            status="active",
        )
        db.add(other_project_user)
        db.flush()
        other_item = WineShelfItem(
            project_id=other_project.id,
            project_user_id=other_project_user.id,
            wine_name="Other Project Wine",
            status="liked",
        )
        db.add(other_item)
        db.commit()
        other_item_id = other_item.id
    finally:
        db.close()

    detail = client.get(f"/api/v1/wine-shelf/items/{other_item_id}", headers=headers)
    assert detail.status_code == 404

    items = client.get("/api/v1/wine-shelf/items", headers=headers)
    assert items.status_code == 200, items.text
    assert items.json()["data"]["total"] == 0

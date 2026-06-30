from tests.conftest import login


def test_discoveries_list_and_detail(client):
    headers = login(client)

    response = client.get("/api/v1/discoveries", headers=headers)

    assert response.status_code == 200, response.text
    items = response.json()["data"]["items"]
    assert len(items) == 7
    assert items[0]["slug"] == "how-to-read-wine-label"

    detail = client.get("/api/v1/discoveries/how-to-read-wine-label", headers=headers)
    assert detail.status_code == 200, detail.text
    data = detail.json()["data"]
    assert data["slug"] == "how-to-read-wine-label"
    assert data["body"]


def test_discoveries_can_filter_by_category(client):
    headers = login(client)

    response = client.get("/api/v1/discoveries?category=basics", headers=headers)

    assert response.status_code == 200, response.text
    items = response.json()["data"]["items"]
    assert [item["category"] for item in items] == ["basics", "basics"]

from tests.conftest import login


def test_dev_auth_login_returns_member_project_access(client):
    response = client.post("/api/v1/auth/telegram", json={"init_data": "dev_mock_init_data"})

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["access_token"]
    assert data["project_user"]["project_slug"] == "doch-vinodela"
    assert data["project_user"]["role"] == "member"
    assert data["project_user"]["status"] == "active"
    assert data["project_user"]["capabilities"] == ["view_app"]


def test_auth_me_returns_current_user_and_project_user(client):
    headers = login(client)

    response = client.get("/api/v1/auth/me", headers=headers)

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["user"]["display_name"] == "CORE"
    assert data["project_user"]["project_slug"] == "doch-vinodela"
    assert data["project_user"]["role"] == "member"
    assert data["project_user"]["status"] == "active"
    assert "view_app" in data["project_user"]["capabilities"]
    assert "access_admin" not in data["project_user"]["capabilities"]

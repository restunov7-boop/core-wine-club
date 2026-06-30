from tests.conftest import complete_onboarding, login


def test_onboarding_status_complete_and_reset_dev(client):
    headers = login(client)

    initial = client.get("/api/v1/onboarding/status", headers=headers)
    assert initial.status_code == 200, initial.text
    assert initial.json()["data"]["is_completed"] is False

    completed = complete_onboarding(client, headers)
    assert completed["is_completed"] is True
    assert completed["onboarding_data"]["display_name"] == "Test User"
    assert completed["user"]["display_name"] == "Test User"

    status = client.get("/api/v1/onboarding/status", headers=headers)
    assert status.status_code == 200, status.text
    assert status.json()["data"]["is_completed"] is True

    reset = client.post("/api/v1/onboarding/reset-dev", headers=headers)
    assert reset.status_code == 200, reset.text
    assert reset.json()["data"]["is_completed"] is False

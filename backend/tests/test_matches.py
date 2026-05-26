def test_matches_endpoint_responds(client):
    response = client.get("/api/v1/matches")

    assert response.status_code in [200, 401, 403]


def test_matches_response_is_json_when_authorized_or_public(client):
    response = client.get("/api/v1/matches")

    if response.status_code == 200:
        assert response.is_json
        data = response.get_json()
        assert isinstance(data, list)
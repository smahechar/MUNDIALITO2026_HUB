def test_nations_endpoint_responds(client):
    response = client.get("/api/v1/nations")

    assert response.status_code in [200, 401, 403]


def test_nations_groups_endpoint_responds(client):
    response = client.get("/api/v1/nations/groups")

    assert response.status_code in [200, 401, 403]


def test_nations_response_shape_if_public(client):
    response = client.get("/api/v1/nations")

    if response.status_code == 200:
        data = response.get_json()

        assert isinstance(data, list)

        if len(data) > 0:
            nation = data[0]
            assert "code" in nation
            assert "name" in nation
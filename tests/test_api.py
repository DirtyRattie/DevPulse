"""Tests for the FastAPI endpoints."""

from unittest.mock import patch, MagicMock

from fastapi.testclient import TestClient

from api import app


client = TestClient(app)


def test_health():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "version" in data


def test_list_subreddits():
    resp = client.get("/api/subreddits")
    assert resp.status_code == 200
    subs = resp.json()
    assert len(subs) >= 6
    assert any(s["name"] == "LocalLLaMA" for s in subs)


def test_pulse():
    with patch("api.run_pulse") as mock_pulse:
        mock_pulse.return_value = []
        resp = client.post("/api/pulse")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 0
        assert "duration_s" in data


def test_draft_lifecycle():
    # Create
    resp = client.post("/api/drafts", json={
        "draft_type": "post",
        "subreddit": "test_sub",
        "title": "Test",
        "body": "Hello world",
    })
    assert resp.status_code == 201
    draft = resp.json()
    draft_id = draft["id"]
    assert draft["status"] == "pending"

    # List
    resp = client.get("/api/drafts")
    assert resp.status_code == 200
    assert len(resp.json()) >= 1

    # Update
    resp = client.put(f"/api/drafts/{draft_id}", json={"body": "Updated body"})
    assert resp.status_code == 200
    assert resp.json()["body"] == "Updated body"

    # Approve
    resp = client.post(f"/api/drafts/{draft_id}/approve?reviewer=alice")
    assert resp.status_code == 200
    assert resp.json()["status"] == "approved"

    # Cannot edit after approval
    resp = client.put(f"/api/drafts/{draft_id}", json={"body": "Nope"})
    assert resp.status_code == 400


def test_draft_reject():
    resp = client.post("/api/drafts", json={
        "draft_type": "comment",
        "subreddit": "test_sub",
        "body": "Nice",
        "parent_id": "t3_abc",
    })
    draft_id = resp.json()["id"]

    resp = client.post(f"/api/drafts/{draft_id}/reject?reviewer=bob")
    assert resp.status_code == 200
    assert resp.json()["status"] == "rejected"


def test_draft_delete():
    resp = client.post("/api/drafts", json={
        "draft_type": "post",
        "subreddit": "s",
        "title": "T",
        "body": "B",
    })
    draft_id = resp.json()["id"]

    resp = client.delete(f"/api/drafts/{draft_id}")
    assert resp.status_code == 204

    resp = client.get(f"/api/drafts/{draft_id}")
    assert resp.status_code == 404


def test_draft_submit_requires_token():
    resp = client.post("/api/drafts", json={
        "draft_type": "post",
        "subreddit": "s",
        "title": "T",
        "body": "B",
    })
    draft_id = resp.json()["id"]
    client.post(f"/api/drafts/{draft_id}/approve?reviewer=alice")

    # Without REDDIT_USER_REFRESH_TOKEN set, should fail
    with patch.dict("os.environ", {}, clear=False):
        resp = client.post(f"/api/drafts/{draft_id}/submit")
        assert resp.status_code == 503


def test_audit_log():
    resp = client.get("/api/audit")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_list_reports():
    resp = client.get("/api/reports")
    assert resp.status_code == 200
    assert "reports" in resp.json()

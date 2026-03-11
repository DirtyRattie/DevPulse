"""Tests for writer module — draft lifecycle and submission."""

import tempfile
from pathlib import Path

from models import DraftCreate, DraftType, DraftStatus
from writer import DraftStore, WriterService
from audit import AuditLogger
from rate_limiter import RateLimiter


def _make_service(tmp_path: Path | None = None) -> WriterService:
    audit_dir = tmp_path or Path(tempfile.mkdtemp())
    return WriterService(
        draft_store=DraftStore(),
        audit=AuditLogger(audit_dir=audit_dir),
        rate_limiter=RateLimiter(),
    )


def test_create_draft():
    svc = _make_service()
    req = DraftCreate(
        draft_type=DraftType.POST,
        subreddit="test_sub",
        title="Test Title",
        body="Test body content",
    )
    draft = svc.create_draft(req)
    assert draft.status == DraftStatus.PENDING
    assert draft.subreddit == "test_sub"
    assert draft.title == "Test Title"


def test_approve_draft():
    svc = _make_service()
    req = DraftCreate(draft_type=DraftType.POST, subreddit="s", title="T", body="B")
    draft = svc.create_draft(req)

    approved = svc.approve_draft(draft.id, "reviewer_alice")
    assert approved is not None
    assert approved.status == DraftStatus.APPROVED
    assert approved.reviewed_by == "reviewer_alice"


def test_reject_draft():
    svc = _make_service()
    req = DraftCreate(draft_type=DraftType.POST, subreddit="s", title="T", body="B")
    draft = svc.create_draft(req)

    rejected = svc.reject_draft(draft.id, "reviewer_bob")
    assert rejected is not None
    assert rejected.status == DraftStatus.REJECTED


def test_cannot_approve_non_pending():
    svc = _make_service()
    req = DraftCreate(draft_type=DraftType.POST, subreddit="s", title="T", body="B")
    draft = svc.create_draft(req)
    svc.reject_draft(draft.id, "bob")

    # Try to approve a rejected draft
    result = svc.approve_draft(draft.id, "alice")
    assert result is None


def test_list_drafts_filter():
    svc = _make_service()
    req = DraftCreate(draft_type=DraftType.POST, subreddit="s", title="T", body="B")
    svc.create_draft(req)
    svc.create_draft(req)
    d3 = svc.create_draft(req)
    svc.approve_draft(d3.id, "alice")

    all_drafts = svc.drafts.list_all()
    assert len(all_drafts) == 3

    pending = svc.drafts.list_all(status=DraftStatus.PENDING)
    assert len(pending) == 2

    approved = svc.drafts.list_all(status=DraftStatus.APPROVED)
    assert len(approved) == 1


def test_delete_draft():
    svc = _make_service()
    req = DraftCreate(draft_type=DraftType.POST, subreddit="s", title="T", body="B")
    draft = svc.create_draft(req)

    assert svc.drafts.delete(draft.id) is True
    assert svc.drafts.get(draft.id) is None


def test_comment_draft():
    svc = _make_service()
    req = DraftCreate(
        draft_type=DraftType.COMMENT,
        subreddit="test_sub",
        body="Great post, thanks for sharing!",
        parent_id="t3_abc123",
    )
    draft = svc.create_draft(req)
    assert draft.draft_type == DraftType.COMMENT
    assert draft.parent_id == "t3_abc123"

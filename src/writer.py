"""
DevPulse - Writer module
Submits posts and comments to Reddit on behalf of authenticated users.
All submissions require human review (draft → approve → submit workflow).
"""

import logging
import time
import uuid
from datetime import datetime, timezone
from typing import Optional

import praw
import prawcore

from rate_limiter import RateLimiter, MAX_RETRIES, BASE_RETRY_DELAY, MAX_RETRY_DELAY
from models import DraftStatus, DraftType, DraftCreate, DraftResponse
from audit import AuditLogger, AuditAction

log = logging.getLogger(__name__)


class DraftStore:
    """
    In-memory draft store. For production, swap with a database backend.
    Provides the interface that the API layer consumes.
    """

    def __init__(self):
        self._drafts: dict[str, DraftResponse] = {}

    def create(self, req: DraftCreate, actor: str = "operator") -> DraftResponse:
        now = datetime.now(timezone.utc)
        draft = DraftResponse(
            id=uuid.uuid4().hex[:12],
            draft_type=req.draft_type,
            status=DraftStatus.PENDING,
            subreddit=req.subreddit,
            title=req.title,
            body=req.body,
            parent_id=req.parent_id,
            created_at=now,
            updated_at=now,
            reviewed_by=None,
        )
        self._drafts[draft.id] = draft
        return draft

    def get(self, draft_id: str) -> Optional[DraftResponse]:
        return self._drafts.get(draft_id)

    def list_all(self, status: Optional[DraftStatus] = None) -> list[DraftResponse]:
        drafts = list(self._drafts.values())
        if status is not None:
            drafts = [d for d in drafts if d.status == status]
        return sorted(drafts, key=lambda d: d.created_at, reverse=True)

    def update(self, draft_id: str, **kwargs) -> Optional[DraftResponse]:
        draft = self._drafts.get(draft_id)
        if draft is None:
            return None
        data = draft.model_dump()
        data.update(kwargs)
        data["updated_at"] = datetime.now(timezone.utc)
        self._drafts[draft_id] = DraftResponse(**data)
        return self._drafts[draft_id]

    def delete(self, draft_id: str) -> bool:
        return self._drafts.pop(draft_id, None) is not None


def build_user_reddit_client(
    client_id: str,
    client_secret: str,
    refresh_token: str,
    user_agent: str,
) -> praw.Reddit:
    """
    Build a Reddit client authenticated as a specific user (for write ops).
    Uses refresh_token from OAuth2 authorization code flow.
    """
    client = praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        refresh_token=refresh_token,
        user_agent=user_agent,
    )
    # This client is NOT read-only — it can submit content
    log.info("User Reddit client initialized (read_only: %s)", client.read_only)
    return client


def submit_to_reddit(
    reddit: praw.Reddit,
    draft: DraftResponse,
    rate_limiter: RateLimiter,
) -> str:
    """
    Submit an approved draft to Reddit. Returns the URL of the new submission.
    Raises on failure.
    """
    for attempt in range(MAX_RETRIES + 1):
        rate_limiter.wait_if_needed()
        try:
            if draft.draft_type == DraftType.POST:
                subreddit = reddit.subreddit(draft.subreddit)
                submission = subreddit.submit(
                    title=draft.title,
                    selftext=draft.body,
                )
                rate_limiter.record_request()
                url = f"https://www.reddit.com{submission.permalink}"
                log.info("Post submitted to r/%s: %s", draft.subreddit, url)
                return url

            elif draft.draft_type == DraftType.COMMENT:
                parent = reddit.submission(id=draft.parent_id.replace("t3_", ""))
                comment = parent.reply(draft.body)
                rate_limiter.record_request()
                url = f"https://www.reddit.com{comment.permalink}"
                log.info("Comment submitted on %s: %s", draft.parent_id, url)
                return url

            else:
                raise ValueError(f"Unknown draft type: {draft.draft_type}")

        except prawcore.exceptions.TooManyRequests:
            if attempt >= MAX_RETRIES:
                raise
            delay = min(BASE_RETRY_DELAY * (2 ** attempt), MAX_RETRY_DELAY)
            log.warning(
                "429 Too Many Requests on write — retrying in %.1fs (attempt %d/%d)",
                delay, attempt + 1, MAX_RETRIES,
            )
            time.sleep(delay)

    raise RuntimeError("Exhausted retries for Reddit submission")


class WriterService:
    """
    High-level service coordinating draft lifecycle and Reddit submission.
    Intended to be used by the API layer.
    """

    def __init__(
        self,
        draft_store: DraftStore,
        audit: AuditLogger,
        rate_limiter: RateLimiter,
    ):
        self.drafts = draft_store
        self.audit = audit
        self.rate_limiter = rate_limiter

    def create_draft(self, req: DraftCreate, actor: str = "operator") -> DraftResponse:
        draft = self.drafts.create(req, actor)
        self.audit.record(
            AuditAction.DRAFT_CREATE,
            actor=actor,
            detail=f"draft={draft.id} type={draft.draft_type.value} sub={draft.subreddit}",
        )
        return draft

    def approve_draft(self, draft_id: str, reviewer: str) -> Optional[DraftResponse]:
        draft = self.drafts.get(draft_id)
        if draft is None or draft.status != DraftStatus.PENDING:
            return None
        updated = self.drafts.update(
            draft_id,
            status=DraftStatus.APPROVED,
            reviewed_by=reviewer,
        )
        self.audit.record(
            AuditAction.DRAFT_APPROVE,
            actor=reviewer,
            detail=f"draft={draft_id}",
        )
        return updated

    def reject_draft(self, draft_id: str, reviewer: str) -> Optional[DraftResponse]:
        draft = self.drafts.get(draft_id)
        if draft is None or draft.status != DraftStatus.PENDING:
            return None
        updated = self.drafts.update(
            draft_id,
            status=DraftStatus.REJECTED,
            reviewed_by=reviewer,
        )
        self.audit.record(
            AuditAction.DRAFT_REJECT,
            actor=reviewer,
            detail=f"draft={draft_id}",
        )
        return updated

    def submit_draft(
        self,
        draft_id: str,
        reddit: praw.Reddit,
        actor: str = "system",
    ) -> Optional[DraftResponse]:
        """Submit an approved draft to Reddit."""
        draft = self.drafts.get(draft_id)
        if draft is None or draft.status != DraftStatus.APPROVED:
            return None

        try:
            url = submit_to_reddit(reddit, draft, self.rate_limiter)
            updated = self.drafts.update(
                draft_id,
                status=DraftStatus.SUBMITTED,
                submitted_at=datetime.now(timezone.utc),
                reddit_url=url,
            )
            self.audit.record(
                AuditAction.DRAFT_SUBMIT,
                actor=actor,
                detail=f"draft={draft_id} url={url}",
            )
            return updated
        except Exception as e:
            self.drafts.update(draft_id, status=DraftStatus.FAILED)
            self.audit.record(
                AuditAction.DRAFT_SUBMIT,
                actor=actor,
                detail=f"draft={draft_id} error={e}",
                success=False,
            )
            raise

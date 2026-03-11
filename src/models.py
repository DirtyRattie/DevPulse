"""
Shared Pydantic models for API request/response schemas.
Used by the FastAPI backend and available for frontend contract generation.
"""

from __future__ import annotations

import enum
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class DraftStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUBMITTED = "submitted"
    FAILED = "failed"


class DraftType(str, enum.Enum):
    POST = "post"
    COMMENT = "comment"


class AuditAction(str, enum.Enum):
    READ_PULSE = "read_pulse"
    DRAFT_CREATE = "draft_create"
    DRAFT_UPDATE = "draft_update"
    DRAFT_APPROVE = "draft_approve"
    DRAFT_REJECT = "draft_reject"
    DRAFT_SUBMIT = "draft_submit"
    DRAFT_DELETE = "draft_delete"
    EXPORT_JSON = "export_json"
    EXPORT_MARKDOWN = "export_markdown"


# ---------------------------------------------------------------------------
# Reader / Aggregator responses
# ---------------------------------------------------------------------------

class PostSummaryResponse(BaseModel):
    id: str
    subreddit: str
    title: str
    score: int
    num_comments: int
    created_utc: float
    url: str
    top_comments: list[str] = Field(default_factory=list)
    relevance_score: float = 0.0


class EntityMentionResponse(BaseModel):
    entity: str
    mention_count: int
    avg_post_score: float
    positive_signals: int
    negative_signals: int
    representative_titles: list[str] = Field(default_factory=list)


class TrendReportResponse(BaseModel):
    generated_at: str
    total_posts_analyzed: int
    subreddits_covered: list[str]
    entity_mentions: list[EntityMentionResponse]
    top_posts: list[dict]


class PulseResult(BaseModel):
    posts: list[PostSummaryResponse]
    total: int
    subreddits_scanned: list[str]
    duration_s: float


# ---------------------------------------------------------------------------
# Writer / Draft models
# ---------------------------------------------------------------------------

class DraftCreate(BaseModel):
    """Request body: create a new draft for human review."""
    draft_type: DraftType
    subreddit: str
    title: Optional[str] = None  # required for posts, ignored for comments
    body: str
    parent_id: Optional[str] = None  # required for comments (e.g. "t3_abc123")


class DraftUpdate(BaseModel):
    """Request body: update a draft before approval."""
    title: Optional[str] = None
    body: Optional[str] = None


class DraftResponse(BaseModel):
    id: str
    draft_type: DraftType
    status: DraftStatus
    subreddit: str
    title: Optional[str] = None
    body: str
    parent_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime] = None
    reddit_url: Optional[str] = None
    reviewed_by: Optional[str] = None


# ---------------------------------------------------------------------------
# Audit models
# ---------------------------------------------------------------------------

class AuditEntry(BaseModel):
    id: str
    timestamp: datetime
    action: AuditAction
    actor: str  # system or operator identifier
    detail: str = ""
    success: bool = True


# ---------------------------------------------------------------------------
# Subreddit config
# ---------------------------------------------------------------------------

class SubredditConfig(BaseModel):
    name: str
    enabled: bool = True
    mode: str = "hot"
    limit: int = 25
    min_score: int = 5

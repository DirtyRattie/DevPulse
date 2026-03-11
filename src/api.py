"""
DevPulse - FastAPI backend
Provides REST API for the frontend to consume.
"""

import os
import time
import logging
from contextlib import asynccontextmanager
from typing import Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query, Request, Header
from fastapi.middleware.cors import CORSMiddleware

from models import (
    PostSummaryResponse,
    PulseResult,
    TrendReportResponse,
    EntityMentionResponse,
    DraftCreate,
    DraftUpdate,
    DraftResponse,
    DraftStatus,
    AuditEntry,
    SubredditConfig,
)
from reader import run_pulse, PostSummary, TARGET_SUBREDDITS, __version__
from aggregator import aggregate, report_to_dict
from exporter import export_json, export_markdown
from audit import AuditLogger, AuditAction
from writer import DraftStore, WriterService
from rate_limiter import RateLimiter

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Application state
# ---------------------------------------------------------------------------
audit_logger = AuditLogger()
draft_store = DraftStore()
shared_rate_limiter = RateLimiter()
writer_service = WriterService(draft_store, audit_logger, shared_rate_limiter)

# Cached pulse result (B-3)
_latest_pulse: Optional[PulseResult] = None

REQUIRED_ENV_VARS = ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # B-2: Validate required environment variables at startup
    missing = [v for v in REQUIRED_ENV_VARS if not os.environ.get(v)]
    if missing:
        log.error("Missing required environment variables: %s", ", ".join(missing))
        raise SystemExit(f"Missing required env vars: {', '.join(missing)}")
    log.info("DevPulse API started (version=%s)", __version__)
    yield
    log.info("DevPulse API shutting down")


app = FastAPI(
    title="DevPulse API",
    version=__version__,
    description="Reddit community intelligence backend for AI product teams.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _post_to_response(p: PostSummary) -> PostSummaryResponse:
    return PostSummaryResponse(
        id=p.id,
        subreddit=p.subreddit,
        title=p.title,
        score=p.score,
        num_comments=p.num_comments,
        created_utc=p.created_utc,
        url=p.url,
        top_comments=p.top_comments,
        relevance_score=p.relevance_score,
    )


# ---------------------------------------------------------------------------
# Read endpoints
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health():
    return {"status": "ok", "version": __version__}


@app.get("/api/subreddits", response_model=list[SubredditConfig])
def list_subreddits():
    """List all monitored subreddits and their config."""
    return [SubredditConfig(name=s) for s in TARGET_SUBREDDITS]


@app.post("/api/pulse", response_model=PulseResult)
def trigger_pulse(
    subreddits: Optional[list[str]] = None,
    limit: int = Query(default=25, ge=1, le=100),
    x_operator: Optional[str] = Header(default=None),
):
    """Trigger a read pulse across target subreddits."""
    global _latest_pulse
    actor = x_operator or "system"
    start = time.monotonic()
    targets = subreddits or TARGET_SUBREDDITS
    posts = run_pulse(subreddits=targets, limit_per_sub=limit)
    duration = time.monotonic() - start

    audit_logger.record(
        AuditAction.READ_PULSE,
        actor=actor,
        detail=f"subreddits={len(targets)} posts={len(posts)} duration_s={duration:.2f}",
    )

    result = PulseResult(
        posts=[_post_to_response(p) for p in posts],
        total=len(posts),
        subreddits_scanned=targets,
        duration_s=round(duration, 2),
    )
    _latest_pulse = result
    return result


@app.get("/api/pulse/latest", response_model=Optional[PulseResult])
def get_latest_pulse():
    """Return the most recent cached pulse result without triggering a new one."""
    if _latest_pulse is None:
        return PulseResult(posts=[], total=0, subreddits_scanned=[], duration_s=0)
    return _latest_pulse


@app.get("/api/trends", response_model=TrendReportResponse)
def get_trends(
    subreddits: Optional[list[str]] = Query(default=None),
    limit: int = Query(default=25, ge=1, le=100),
):
    """Run a pulse and return aggregated trend report."""
    targets = subreddits or TARGET_SUBREDDITS
    posts = run_pulse(subreddits=targets, limit_per_sub=limit)
    report = aggregate(posts)
    report_dict = report_to_dict(report)
    return TrendReportResponse(
        generated_at=report_dict["generated_at"],
        total_posts_analyzed=report_dict["total_posts_analyzed"],
        subreddits_covered=report_dict["subreddits_covered"],
        entity_mentions=[EntityMentionResponse(**m) for m in report_dict["entity_mentions"]],
        top_posts=report_dict["top_posts"],
    )


@app.post("/api/export/{fmt}")
def export_report(
    fmt: str,
    subreddits: Optional[list[str]] = Query(default=None),
    limit: int = Query(default=25, ge=1, le=100),
    x_operator: Optional[str] = Header(default=None),
):
    """Export a trend report to JSON or Markdown."""
    if fmt not in ("json", "markdown"):
        raise HTTPException(400, f"Unsupported format: {fmt}. Use 'json' or 'markdown'.")

    posts = run_pulse(subreddits=subreddits, limit_per_sub=limit)
    report = aggregate(posts)

    actor = x_operator or "system"
    if fmt == "json":
        path = export_json(report)
        audit_logger.record(AuditAction.EXPORT_JSON, actor=actor, detail=str(path))
    else:
        path = export_markdown(report)
        audit_logger.record(AuditAction.EXPORT_MARKDOWN, actor=actor, detail=str(path))

    return {"status": "exported", "path": str(path)}


# ---------------------------------------------------------------------------
# Reports (list previously exported files)
# ---------------------------------------------------------------------------

@app.get("/api/reports")
def list_reports():
    """List all previously exported report files."""
    output_dir = Path(__file__).parent.parent / "output"
    if not output_dir.exists():
        return {"reports": []}
    files = sorted(output_dir.glob("devpulse_report_*"), reverse=True)
    return {
        "reports": [
            {"filename": f.name, "size_bytes": f.stat().st_size, "path": str(f)}
            for f in files
        ]
    }


# ---------------------------------------------------------------------------
# Draft / Write endpoints
# ---------------------------------------------------------------------------

@app.post("/api/drafts", response_model=DraftResponse, status_code=201)
def create_draft(req: DraftCreate, x_operator: Optional[str] = Header(default=None)):
    """Create a new draft for human review before submission."""
    actor = x_operator or "operator"
    draft = writer_service.create_draft(req, actor=actor)
    return draft


@app.get("/api/drafts", response_model=list[DraftResponse])
def list_drafts(status: Optional[DraftStatus] = None):
    """List all drafts, optionally filtered by status."""
    return writer_service.drafts.list_all(status=status)


@app.get("/api/drafts/{draft_id}", response_model=DraftResponse)
def get_draft(draft_id: str):
    draft = writer_service.drafts.get(draft_id)
    if draft is None:
        raise HTTPException(404, "Draft not found")
    return draft


@app.put("/api/drafts/{draft_id}", response_model=DraftResponse)
def update_draft(draft_id: str, req: DraftUpdate, x_operator: Optional[str] = Header(default=None)):
    """Update a pending draft's title or body."""
    actor = x_operator or "operator"
    draft = writer_service.drafts.get(draft_id)
    if draft is None:
        raise HTTPException(404, "Draft not found")
    if draft.status != DraftStatus.PENDING:
        raise HTTPException(400, f"Cannot edit draft in '{draft.status}' status")

    updates = req.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(400, "No fields to update")

    audit_logger.record(
        AuditAction.DRAFT_UPDATE,
        actor=actor,
        detail=f"draft={draft_id} fields={list(updates.keys())}",
    )
    updated = writer_service.drafts.update(draft_id, **updates)
    return updated


@app.post("/api/drafts/{draft_id}/approve", response_model=DraftResponse)
def approve_draft(draft_id: str, reviewer: str = Query(...)):
    """Approve a draft for submission. Requires reviewer name."""
    result = writer_service.approve_draft(draft_id, reviewer)
    if result is None:
        raise HTTPException(400, "Draft not found or not in pending status")
    return result


@app.post("/api/drafts/{draft_id}/reject", response_model=DraftResponse)
def reject_draft(draft_id: str, reviewer: str = Query(...)):
    """Reject a draft."""
    result = writer_service.reject_draft(draft_id, reviewer)
    if result is None:
        raise HTTPException(400, "Draft not found or not in pending status")
    return result


@app.post("/api/drafts/{draft_id}/submit", response_model=DraftResponse)
def submit_draft(draft_id: str, x_operator: Optional[str] = Header(default=None)):
    """
    Submit an approved draft to Reddit.
    Requires REDDIT_USER_REFRESH_TOKEN in environment for authenticated writes.
    """
    draft = writer_service.drafts.get(draft_id)
    if draft is None:
        raise HTTPException(404, "Draft not found")
    if draft.status != DraftStatus.APPROVED:
        raise HTTPException(400, f"Draft must be approved before submission (current: {draft.status})")

    # Build authenticated Reddit client for write operations
    from writer import build_user_reddit_client
    from reader import __version__ as version

    refresh_token = os.environ.get("REDDIT_USER_REFRESH_TOKEN")
    if not refresh_token:
        raise HTTPException(
            503,
            "Write operations require REDDIT_USER_REFRESH_TOKEN in environment",
        )

    reddit = build_user_reddit_client(
        client_id=os.environ["REDDIT_CLIENT_ID"],
        client_secret=os.environ["REDDIT_CLIENT_SECRET"],
        refresh_token=refresh_token,
        user_agent=os.environ.get("REDDIT_USER_AGENT", f"python:devpulse:v{version}"),
    )

    actor = x_operator or "system"
    try:
        result = writer_service.submit_draft(draft_id, reddit, actor=actor)
        if result is None:
            raise HTTPException(500, "Submission failed unexpectedly")
        return result
    except Exception as e:
        raise HTTPException(502, f"Reddit submission failed: {e}")


@app.delete("/api/drafts/{draft_id}", status_code=204)
def delete_draft(draft_id: str, x_operator: Optional[str] = Header(default=None)):
    """Delete a draft (only pending or rejected)."""
    draft = writer_service.drafts.get(draft_id)
    if draft is None:
        raise HTTPException(404, "Draft not found")
    if draft.status in (DraftStatus.APPROVED, DraftStatus.SUBMITTED):
        raise HTTPException(400, f"Cannot delete draft in '{draft.status}' status")

    actor = x_operator or "operator"
    writer_service.drafts.delete(draft_id)
    audit_logger.record(AuditAction.DRAFT_DELETE, actor=actor, detail=f"draft={draft_id}")


# ---------------------------------------------------------------------------
# Audit endpoints
# ---------------------------------------------------------------------------

@app.get("/api/audit", response_model=list[AuditEntry])
def get_audit_log(date: Optional[str] = Query(default=None)):
    """Retrieve audit log entries for a given date (YYYY-MM-DD). Defaults to today."""
    return audit_logger.read_entries(date)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)

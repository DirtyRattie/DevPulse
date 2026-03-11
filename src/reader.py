"""
DevPulse - Reddit community intelligence reader
Read-only. No write operations of any kind.
"""

__version__ = "0.2.0"

import os
import re
import time
import logging
from datetime import datetime, timezone
from dataclasses import dataclass, field
from typing import Optional

import praw
import prawcore
from dotenv import load_dotenv

from rate_limiter import RateLimiter

load_dotenv()
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S%z",
)
log = logging.getLogger(__name__)

# Subreddits to monitor
TARGET_SUBREDDITS = [
    "LocalLLaMA",
    "vibecoding",
    "ClaudeCode",
    "AI_Agents",
    "MachineLearning",
    "singularity",
]

# Keywords to filter relevant posts
FOCUS_KEYWORDS = [
    "api", "model", "inference", "latency", "context window",
    "agent", "tool use", "function calling", "benchmark",
    "vs", "compare", "better than", "worse than", "switched",
    "disappointed", "impressed", "works well", "broken",
]

from rate_limiter import MAX_RETRIES, BASE_RETRY_DELAY, MAX_RETRY_DELAY


_USERNAME_PATTERN = re.compile(r"/u/\w+", re.IGNORECASE)


def _sanitize_for_log(text: str) -> str:
    """Remove Reddit usernames from text before logging."""
    return _USERNAME_PATTERN.sub("/u/[redacted]", text)


@dataclass
class PostSummary:
    id: str
    subreddit: str
    title: str
    score: int
    num_comments: int
    created_utc: float
    url: str
    top_comments: list[str] = field(default_factory=list)
    relevance_score: float = 0.0


def build_reddit_client() -> praw.Reddit:
    """
    Application-only OAuth2 client (read-only).
    No username or password — this client cannot write anything.
    """
    default_ua = f"python:devpulse:v{__version__}"
    client = praw.Reddit(
        client_id=os.environ["REDDIT_CLIENT_ID"],
        client_secret=os.environ["REDDIT_CLIENT_SECRET"],
        user_agent=os.environ.get("REDDIT_USER_AGENT", default_ua),
    )
    # Confirm read-only mode
    assert client.read_only, "Client must be read-only"
    log.info("Reddit client initialized (read_only: %s, version: %s)", client.read_only, __version__)
    return client


def score_relevance(text: str) -> float:
    """
    Simple keyword-based relevance scoring.
    Returns a float between 0.0 and 1.0.
    """
    text_lower = text.lower()
    hits = sum(1 for kw in FOCUS_KEYWORDS if kw in text_lower)
    return min(hits / 5.0, 1.0)


def _fetch_with_retry(func, rate_limiter: RateLimiter, **kwargs):
    """Call a PRAW listing function with exponential backoff on 429."""
    for attempt in range(MAX_RETRIES + 1):
        rate_limiter.wait_if_needed()
        try:
            result = list(func(**kwargs))
            rate_limiter.record_request()
            return result
        except prawcore.exceptions.TooManyRequests:
            if attempt >= MAX_RETRIES:
                raise
            delay = min(BASE_RETRY_DELAY * (2 ** attempt), MAX_RETRY_DELAY)
            log.warning("429 Too Many Requests — retrying in %.1fs (attempt %d/%d)",
                        delay, attempt + 1, MAX_RETRIES)
            time.sleep(delay)
    return []


def fetch_subreddit_posts(
    reddit: praw.Reddit,
    subreddit_name: str,
    rate_limiter: RateLimiter,
    limit: int = 25,
    mode: str = "hot",
    min_score: int = 5,
) -> list[PostSummary]:
    """
    Fetch top posts from a subreddit.
    mode: 'hot' | 'new' | 'top'
    """
    start_time = time.monotonic()
    log.info("Fetching %s posts from r/%s (limit=%d)", mode, subreddit_name, limit)
    subreddit = reddit.subreddit(subreddit_name)

    listing_func = {
        "hot": subreddit.hot,
        "new": subreddit.new,
        "top": subreddit.top,
    }.get(mode, subreddit.hot)

    submissions = _fetch_with_retry(listing_func, rate_limiter, limit=limit)

    total_fetched = len(submissions)
    filtered_count = 0
    results = []

    for submission in submissions:
        if submission.score < min_score:
            filtered_count += 1
            continue

        relevance = score_relevance(submission.title)
        if relevance == 0.0:
            filtered_count += 1
            continue

        # Fetch top 3 comments (read-only)
        rate_limiter.wait_if_needed()
        submission.comment_sort = "top"
        submission.comments.replace_more(limit=0)
        rate_limiter.record_request()
        top_comments = [
            c.body[:300]
            for c in submission.comments.list()[:3]
            if hasattr(c, "body")
        ]

        results.append(PostSummary(
            id=submission.id,
            subreddit=subreddit_name,
            title=submission.title,
            score=submission.score,
            num_comments=submission.num_comments,
            created_utc=submission.created_utc,
            url=f"https://www.reddit.com{submission.permalink}",
            top_comments=top_comments,
            relevance_score=relevance,
        ))

    duration = time.monotonic() - start_time
    log.info("subreddit=%s fetched=%d filtered=%d kept=%d duration_s=%.2f rate=%d/min",
             subreddit_name, total_fetched, filtered_count, len(results),
             duration, rate_limiter.recent_count)
    return results


def run_pulse(
    subreddits: Optional[list[str]] = None,
    limit_per_sub: int = 25,
) -> list[PostSummary]:
    """
    Main entry point. Reads posts across all target subreddits.
    Returns a flat list of PostSummary objects sorted by relevance.
    """
    pulse_start = time.monotonic()
    reddit = build_reddit_client()
    rate_limiter = RateLimiter()
    targets = subreddits or TARGET_SUBREDDITS
    all_posts: list[PostSummary] = []
    success_count = 0
    fail_count = 0

    for sub in targets:
        try:
            posts = fetch_subreddit_posts(reddit, sub, rate_limiter, limit=limit_per_sub)
            all_posts.extend(posts)
            success_count += 1
        except prawcore.exceptions.TooManyRequests:
            log.warning("Skipping r/%s — max retries exceeded for 429", sub)
            fail_count += 1
        except Exception as e:
            log.warning("Failed to fetch r/%s: %s", sub, _sanitize_for_log(str(e)))
            fail_count += 1

    all_posts.sort(key=lambda p: (p.relevance_score, p.score), reverse=True)
    pulse_duration = time.monotonic() - pulse_start
    log.info("Pulse complete. posts=%d success=%d failed=%d duration_s=%.2f",
             len(all_posts), success_count, fail_count, pulse_duration)
    return all_posts


if __name__ == "__main__":
    posts = run_pulse()
    print(f"\n{'='*60}")
    print(f"DevPulse Report — {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"{'='*60}\n")
    for p in posts[:20]:
        print(f"[r/{p.subreddit}] {p.title}")
        print(f"  score={p.score}  comments={p.num_comments}  relevance={p.relevance_score:.2f}")
        print(f"  {p.url}\n")

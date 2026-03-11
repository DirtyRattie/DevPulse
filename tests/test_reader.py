"""Tests for reader module — GAP 1 (429 retry), GAP 3 (logging), GAP 4 (sanitize)."""

import logging
from unittest.mock import MagicMock, patch

import prawcore.exceptions

from reader import (
    _sanitize_for_log,
    _fetch_with_retry,
    score_relevance,
    fetch_subreddit_posts,
    run_pulse,
)
from rate_limiter import RateLimiter


# --- GAP 4: sanitize ---

def test_sanitize_removes_usernames():
    text = "Error from /u/someuser and /u/AnotherUser123"
    result = _sanitize_for_log(text)
    assert "/u/someuser" not in result
    assert "/u/AnotherUser123" not in result
    assert "/u/[redacted]" in result


def test_sanitize_no_usernames():
    text = "Normal error message"
    assert _sanitize_for_log(text) == text


# --- GAP 1: 429 exponential backoff ---

def test_fetch_with_retry_success():
    mock_func = MagicMock(return_value=[1, 2, 3])
    rl = RateLimiter()
    result = _fetch_with_retry(mock_func, rl, limit=10)
    assert result == [1, 2, 3]
    mock_func.assert_called_once_with(limit=10)


def test_fetch_with_retry_429_then_success():
    mock_func = MagicMock(
        side_effect=[prawcore.exceptions.TooManyRequests(MagicMock()), [1, 2]]
    )
    rl = RateLimiter()
    with patch("reader.time.sleep"):
        result = _fetch_with_retry(mock_func, rl, limit=5)
    assert result == [1, 2]
    assert mock_func.call_count == 2


def test_fetch_with_retry_exhausted():
    mock_func = MagicMock(
        side_effect=prawcore.exceptions.TooManyRequests(MagicMock())
    )
    rl = RateLimiter()
    try:
        with patch("reader.time.sleep"):
            _fetch_with_retry(mock_func, rl, limit=5)
        assert False, "Should have raised"
    except prawcore.exceptions.TooManyRequests:
        pass
    # 1 initial + MAX_RETRIES retries = 6 total calls
    assert mock_func.call_count == 6


# --- score_relevance ---

def test_score_relevance_no_keywords():
    assert score_relevance("hello world") == 0.0


def test_score_relevance_with_keywords():
    assert score_relevance("this api has better latency than the model") > 0.0


def test_score_relevance_capped_at_1():
    text = " ".join(["api", "model", "inference", "latency", "context window", "agent", "benchmark"])
    assert score_relevance(text) == 1.0


# --- GAP 3: structured logging in run_pulse ---

def test_run_pulse_logs_structured(caplog):
    """Verify that run_pulse emits structured log lines."""
    with patch("reader.build_reddit_client") as mock_client, \
         patch("reader.fetch_subreddit_posts") as mock_fetch:
        mock_fetch.return_value = []
        with caplog.at_level(logging.INFO):
            run_pulse(subreddits=["test_sub"], limit_per_sub=5)

    # Should contain structured pulse-complete log
    assert any("Pulse complete." in r.message for r in caplog.records)
    assert any("posts=" in r.message for r in caplog.records)
    assert any("success=" in r.message for r in caplog.records)


# --- GAP 4: sanitize in run_pulse exception handler ---

def test_run_pulse_sanitizes_errors(caplog):
    """Verify that exceptions containing usernames are sanitized in logs."""
    with patch("reader.build_reddit_client"), \
         patch("reader.fetch_subreddit_posts") as mock_fetch:
        mock_fetch.side_effect = RuntimeError("Error from /u/secretuser")
        with caplog.at_level(logging.WARNING):
            posts = run_pulse(subreddits=["test_sub"])

    assert posts == []
    log_text = " ".join(r.message for r in caplog.records)
    assert "/u/secretuser" not in log_text
    assert "/u/[redacted]" in log_text

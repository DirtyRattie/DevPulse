"""Tests for the shared RateLimiter."""

import time
from unittest.mock import patch

from rate_limiter import RateLimiter


def test_record_and_count():
    rl = RateLimiter(max_requests=10, window=60)
    assert rl.recent_count == 0
    rl.record_request()
    rl.record_request()
    assert rl.recent_count == 2


def test_wait_not_triggered_under_limit():
    rl = RateLimiter(max_requests=10, window=60)
    for _ in range(5):
        rl.record_request()
    with patch("rate_limiter.time.sleep") as mock_sleep:
        rl.wait_if_needed()
        mock_sleep.assert_not_called()


def test_wait_triggered_at_limit():
    rl = RateLimiter(max_requests=3, window=60)
    for _ in range(3):
        rl.record_request()
    with patch("rate_limiter.time.sleep") as mock_sleep:
        rl.wait_if_needed()
        mock_sleep.assert_called_once()
        # Wait time should be positive and ≤ window + margin
        wait_time = mock_sleep.call_args[0][0]
        assert 0 < wait_time <= 61


def test_old_timestamps_evicted():
    rl = RateLimiter(max_requests=3, window=1)
    for _ in range(3):
        rl.record_request()
    assert rl.recent_count == 3
    time.sleep(1.1)
    assert rl.recent_count == 0

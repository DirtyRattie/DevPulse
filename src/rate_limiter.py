"""
Shared sliding-window rate limiter for Reddit API compliance.
Ensures ≤60 requests/min per OAuth client across all modules.
"""

import time
import logging
import collections

log = logging.getLogger(__name__)

RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX_REQUESTS = 55  # stay safely under 60 req/min
MAX_RETRIES = 5
BASE_RETRY_DELAY = 2.0
MAX_RETRY_DELAY = 60.0


class RateLimiter:
    """Sliding-window rate limiter to stay under Reddit's 60 req/min."""

    def __init__(
        self,
        max_requests: int = RATE_LIMIT_MAX_REQUESTS,
        window: int = RATE_LIMIT_WINDOW,
    ):
        self._max_requests = max_requests
        self._window = window
        self._timestamps: collections.deque[float] = collections.deque()

    def _evict_old(self, now: float) -> None:
        while self._timestamps and self._timestamps[0] <= now - self._window:
            self._timestamps.popleft()

    def wait_if_needed(self) -> None:
        now = time.monotonic()
        self._evict_old(now)

        if len(self._timestamps) >= self._max_requests:
            oldest = self._timestamps[0]
            wait_time = self._window - (now - oldest) + 0.1
            if wait_time > 0:
                log.info(
                    "Rate limiter: waiting %.1fs to stay under %d req/min",
                    wait_time,
                    self._max_requests,
                )
                time.sleep(wait_time)

    def record_request(self) -> None:
        self._timestamps.append(time.monotonic())

    @property
    def recent_count(self) -> int:
        self._evict_old(time.monotonic())
        return len(self._timestamps)

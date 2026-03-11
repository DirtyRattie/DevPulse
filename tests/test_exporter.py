"""Tests for exporter module — GAP 6 (username guard)."""

import json
import tempfile
from pathlib import Path

from exporter import _assert_no_usernames, export_json, export_markdown
from aggregator import TrendReport, EntityMention


def test_assert_no_usernames_clean():
    _assert_no_usernames("This is clean content with no usernames", Path("test.json"))


def test_assert_no_usernames_detects():
    try:
        _assert_no_usernames("Post by /u/someone about AI", Path("test.json"))
        assert False, "Should have raised ValueError"
    except ValueError as e:
        assert "/u/someone" in str(e)


def test_assert_no_usernames_case_insensitive():
    try:
        _assert_no_usernames("Post by /U/Someone", Path("test.json"))
        assert False, "Should have raised ValueError"
    except ValueError:
        pass


def _make_report():
    return TrendReport(
        generated_at="2026-03-12T00:00:00+00:00",
        total_posts_analyzed=10,
        subreddits_covered=["LocalLLaMA", "ClaudeCode"],
        entity_mentions=[
            EntityMention(
                entity="claude",
                mention_count=5,
                avg_post_score=42.0,
                positive_signals=3,
                negative_signals=1,
                representative_titles=["Claude is great"],
            ),
        ],
        top_posts=[
            {
                "subreddit": "LocalLLaMA",
                "title": "New model comparison",
                "score": 100,
                "comments": 50,
                "url": "https://www.reddit.com/r/LocalLLaMA/comments/abc/test",
            }
        ],
    )


def test_export_json_writes_file():
    report = _make_report()
    with tempfile.TemporaryDirectory() as tmpdir:
        path = export_json(report, output_dir=Path(tmpdir))
        assert path.exists()
        data = json.loads(path.read_text(encoding="utf-8"))
        assert data["total_posts_analyzed"] == 10
        # Verify no usernames in output
        content = path.read_text(encoding="utf-8")
        assert "/u/" not in content.lower()


def test_export_markdown_writes_file():
    report = _make_report()
    with tempfile.TemporaryDirectory() as tmpdir:
        path = export_markdown(report, output_dir=Path(tmpdir))
        assert path.exists()
        content = path.read_text(encoding="utf-8")
        assert "DevPulse Weekly Report" in content
        # Verify no usernames in output
        assert "/u/" not in content.lower()

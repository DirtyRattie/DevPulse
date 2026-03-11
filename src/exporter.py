"""
DevPulse - Exporter
Writes aggregated trend reports to local JSON files.
No raw Reddit user data is written. Only anonymized aggregates.
"""

import json
import re
import os
from datetime import datetime, timezone
from pathlib import Path

from aggregator import TrendReport, report_to_dict

_USERNAME_PATTERN = re.compile(r"/u/\w+", re.IGNORECASE)


def _assert_no_usernames(content: str, filepath: Path) -> None:
    """Raise ValueError if Reddit usernames are found in export content."""
    matches = _USERNAME_PATTERN.findall(content)
    if matches:
        raise ValueError(
            f"Export to {filepath} blocked: found Reddit username(s) in content: {matches}"
        )

OUTPUT_DIR = Path(__file__).parent.parent / "output"


def export_json(report: TrendReport, output_dir: Path = OUTPUT_DIR) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    filename = output_dir / f"devpulse_report_{timestamp}.json"
    content = json.dumps(report_to_dict(report), indent=2, ensure_ascii=False)
    _assert_no_usernames(content, filename)
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Report written to: {filename}")
    return filename


def export_markdown(report: TrendReport, output_dir: Path = OUTPUT_DIR) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    filename = output_dir / f"devpulse_report_{timestamp}.md"

    lines = [
        f"# DevPulse Weekly Report",
        f"**Generated**: {report.generated_at}",
        f"**Posts analyzed**: {report.total_posts_analyzed}",
        f"**Subreddits**: {', '.join(f'r/{s}' for s in report.subreddits_covered)}",
        "",
        "---",
        "",
        "## Entity Mentions",
        "",
        "| Tool / Project | Mentions | Avg Score | 👍 Signals | 👎 Signals |",
        "|---|---|---|---|---|",
    ]

    for m in report.entity_mentions[:15]:
        lines.append(
            f"| {m.entity} | {m.mention_count} | {m.avg_post_score} "
            f"| {m.positive_signals} | {m.negative_signals} |"
        )

    lines += [
        "",
        "---",
        "",
        "## Top Posts This Week",
        "",
    ]

    for i, post in enumerate(report.top_posts, 1):
        lines.append(f"**{i}. [{post['title']}]({post['url']})**")
        lines.append(f"r/{post['subreddit']} · score: {post['score']} · comments: {post['comments']}")
        lines.append("")

    content = "\n".join(lines)
    _assert_no_usernames(content, filename)
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Markdown report written to: {filename}")
    return filename


if __name__ == "__main__":
    from reader import run_pulse
    from aggregator import aggregate

    posts = run_pulse()
    report = aggregate(posts)
    export_json(report)
    export_markdown(report)

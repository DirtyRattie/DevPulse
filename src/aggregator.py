"""
DevPulse - Aggregator
Groups posts by topic cluster and surfaces trending discussions.
No user-identifying information is retained at any stage.
"""

import json
import re
from collections import defaultdict, Counter
from dataclasses import dataclass, field
from datetime import datetime, timezone

from reader import PostSummary


# Tool/product names to track mentions of
TRACKED_ENTITIES = [
    "claude", "gpt", "gemini", "llama", "mistral", "qwen",
    "deepseek", "grok", "copilot", "cursor", "windsurf",
    "openai", "anthropic", "google", "meta", "minimax",
    "mcp", "langchain", "dspy", "pydantic", "crew",
]

SENTIMENT_POSITIVE = ["impressed", "love", "great", "fast", "works", "solved", "better", "recommend"]
SENTIMENT_NEGATIVE = ["broken", "slow", "fails", "disappointed", "worse", "regressed", "annoying", "buggy"]


@dataclass
class EntityMention:
    entity: str
    mention_count: int
    avg_post_score: float
    positive_signals: int
    negative_signals: int
    representative_titles: list[str] = field(default_factory=list)


@dataclass
class TrendReport:
    generated_at: str
    total_posts_analyzed: int
    subreddits_covered: list[str]
    entity_mentions: list[EntityMention]
    top_posts: list[dict]


def extract_entities(text: str) -> list[str]:
    text_lower = text.lower()
    return [e for e in TRACKED_ENTITIES if re.search(r'\b' + re.escape(e) + r'\b', text_lower)]


def score_sentiment(text: str) -> tuple[int, int]:
    text_lower = text.lower()
    pos = sum(1 for w in SENTIMENT_POSITIVE if w in text_lower)
    neg = sum(1 for w in SENTIMENT_NEGATIVE if w in text_lower)
    return pos, neg


def aggregate(posts: list[PostSummary]) -> TrendReport:
    entity_posts: dict[str, list[PostSummary]] = defaultdict(list)
    entity_pos: Counter = Counter()
    entity_neg: Counter = Counter()

    for post in posts:
        full_text = post.title + " " + " ".join(post.top_comments)
        entities = extract_entities(full_text)
        pos, neg = score_sentiment(full_text)
        for e in entities:
            entity_posts[e].append(post)
            entity_pos[e] += pos
            entity_neg[e] += neg

    entity_mentions = []
    for entity, ep in sorted(entity_posts.items(), key=lambda x: len(x[1]), reverse=True):
        scores = [p.score for p in ep]
        entity_mentions.append(EntityMention(
            entity=entity,
            mention_count=len(ep),
            avg_post_score=round(sum(scores) / len(scores), 1),
            positive_signals=entity_pos[entity],
            negative_signals=entity_neg[entity],
            representative_titles=[p.title for p in sorted(ep, key=lambda p: p.score, reverse=True)[:3]],
        ))

    top_posts = [
        {
            "subreddit": p.subreddit,
            "title": p.title,
            "score": p.score,
            "comments": p.num_comments,
            "url": p.url,
        }
        for p in sorted(posts, key=lambda p: p.score, reverse=True)[:10]
    ]

    return TrendReport(
        generated_at=datetime.now(timezone.utc).isoformat(),
        total_posts_analyzed=len(posts),
        subreddits_covered=sorted(set(p.subreddit for p in posts)),
        entity_mentions=entity_mentions,
        top_posts=top_posts,
    )


def report_to_dict(report: TrendReport) -> dict:
    return {
        "generated_at": report.generated_at,
        "total_posts_analyzed": report.total_posts_analyzed,
        "subreddits_covered": report.subreddits_covered,
        "entity_mentions": [
            {
                "entity": m.entity,
                "mention_count": m.mention_count,
                "avg_post_score": m.avg_post_score,
                "positive_signals": m.positive_signals,
                "negative_signals": m.negative_signals,
                "representative_titles": m.representative_titles,
            }
            for m in report.entity_mentions
        ],
        "top_posts": report.top_posts,
    }


if __name__ == "__main__":
    from reader import run_pulse
    posts = run_pulse()
    report = aggregate(posts)
    print(json.dumps(report_to_dict(report), indent=2, ensure_ascii=False))

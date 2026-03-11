# DevPulse

**DevPulse** is a read-only community intelligence tool that monitors AI developer tool discussions across relevant subreddits.

It is designed for AI product teams who want to understand real developer sentiment — what tools are gaining traction, what pain points recur, and what features are being requested — based on organic community discussion rather than surveys or focus groups.

---

## What it does

DevPulse exclusively reads public post and comment data from subreddits including:

- r/LocalLLaMA
- r/vibecoding
- r/ClaudeCode
- r/AI_Agents
- r/MachineLearning
- r/singularity

It aggregates this data to:

- Track discussion trends around AI tools and models over time
- Surface recurring pain points, feature requests, and comparative benchmarks
- Generate structured weekly summaries for product research purposes

**DevPulse makes zero write operations.** It does not post, comment, vote, send messages, or interact with any Reddit content in any way. All data accessed is already publicly visible to any logged-out visitor.

---

## Architecture

```
reddit API (read-only OAuth2)
        │
        ▼
  src/reader.py        ← fetches posts + comments via PRAW
        │
        ▼
  src/aggregator.py    ← deduplicates, scores by engagement
        │
        ▼
  src/exporter.py      ← outputs structured JSON / weekly report
        │
        ▼
  output/              ← local report files (not committed)
```

---

## API usage

- **Authentication**: OAuth2, application-only (no user credentials required)
- **Access type**: Read-only (`read` scope only)
- **Rate limiting**: Strictly self-limited to ≤60 requests/minute per OAuth client, with automatic backoff on 429 responses
- **User-Agent format**: `python:devpulse:v0.1 (by /u/<operator_username>)`
- **Data retention**: Raw API responses are not persisted. Only aggregated, anonymized trend summaries are stored.

---

## Setup

```bash
# Install dependencies
pip install praw python-dotenv

# Configure credentials
cp .env.example .env
# Fill in your CLIENT_ID and CLIENT_SECRET from https://www.reddit.com/prefs/apps
```

---

## Environment variables

```
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USER_AGENT=python:devpulse:v0.1 (by /u/your_username)
```

---

## Compliance

- Complies with [Reddit's Responsible Builder Policy](https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy)
- Complies with [Reddit Data API Terms](https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki)
- No user data is collected, stored, or sold. See [PRIVACY.md](./PRIVACY.md) for full policy.

---

## License

MIT

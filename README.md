# DevPulse

**DevPulse** is a community intelligence tool that monitors AI developer tool discussions across relevant subreddits and surfaces trends, sentiment, and top posts through a web dashboard.

It is designed for AI product teams who want to understand real developer sentiment — what tools are gaining traction, what pain points recur, and what features are being requested — based on organic community discussion rather than surveys or focus groups.

---

## Features

- **Pulse** — fetch and cache the latest posts across monitored subreddits
- **Trends** — aggregate entity mentions, sentiment, and engagement metrics
- **Posts** — browse and filter fetched posts with relevance scoring
- **Drafts** — create, review, approve/reject, and submit Reddit posts through a human-in-the-loop workflow
- **Audit log** — immutable record of all read pulses, exports, and draft actions
- **Export** — save trend reports to JSON or Markdown files

---

## Monitored subreddits

- r/LocalLLaMA
- r/vibecoding
- r/ClaudeCode
- r/AI_Agents
- r/MachineLearning
- r/singularity

---

## Architecture

```
                    Browser (React + Vite)
                           │  :3000
                           │  /api  →  proxy
                           ▼
                  FastAPI backend  :8000
                    src/api.py
                  ┌────────────────────┐
                  │  reader.py         │  ← PRAW, read-only OAuth2
                  │  aggregator.py     │  ← entity mentions, scoring
                  │  exporter.py       │  ← JSON / Markdown reports
                  │  writer.py         │  ← draft store + submission
                  │  audit.py          │  ← append-only audit log
                  │  rate_limiter.py   │  ← ≤60 req/min, auto-backoff
                  └────────────────────┘
                           │
                        output/          ← exported report files
```

---

## Setup

### 1. Backend

```bash
# Install Python dependencies
pip install fastapi uvicorn praw python-dotenv

# Configure environment
cp .env.example .env
# Edit .env with your Reddit credentials (see Environment variables below)

# Start the API server
cd src
python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload
# or
python -m src
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev        # development server on :3000
npm run build      # production build
```

Open `http://localhost:3000` in your browser. The dev server proxies all `/api` requests to `http://localhost:8000`.

---

## Environment variables

```dotenv
# Required
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret

# Recommended
REDDIT_USER_AGENT=python:devpulse:v0.2 (by /u/your_username)

# Required only for draft submission (write operations)
REDDIT_USER_REFRESH_TOKEN=your_refresh_token

# Optional
CORS_ORIGINS=http://localhost:3000        # comma-separated list of allowed origins
```

Obtain `CLIENT_ID` and `CLIENT_SECRET` from <https://www.reddit.com/prefs/apps> (script app type).
Obtain `REDDIT_USER_REFRESH_TOKEN` via OAuth2 authorization code flow with the `submit` scope.

---

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/subreddits` | List monitored subreddits |
| POST | `/api/pulse` | Trigger a read pulse; caches result |
| GET | `/api/pulse/latest` | Return cached pulse without re-fetching |
| GET | `/api/trends` | Run pulse and return aggregated trend report |
| POST | `/api/export/{fmt}` | Export trend report (`json` or `markdown`) |
| GET | `/api/reports` | List previously exported report files |
| POST | `/api/drafts` | Create a new draft |
| GET | `/api/drafts` | List drafts (optional `?status=` filter) |
| GET | `/api/drafts/{id}` | Get a single draft |
| PUT | `/api/drafts/{id}` | Update a pending draft |
| POST | `/api/drafts/{id}/approve` | Approve a draft (requires `?reviewer=`) |
| POST | `/api/drafts/{id}/reject` | Reject a draft (requires `?reviewer=`) |
| POST | `/api/drafts/{id}/submit` | Submit an approved draft to Reddit |
| DELETE | `/api/drafts/{id}` | Delete a pending or rejected draft |
| GET | `/api/audit` | Retrieve audit log entries (`?date=YYYY-MM-DD`) |

Pass `X-Operator: <username>` header on mutating requests to identify the actor in the audit log.

---

## Draft workflow

```
create (PENDING) → approve → (APPROVED) → submit → (SUBMITTED)
                 ↘ reject  → (REJECTED)
```

Drafts are stored in-memory and reset on server restart. Submission requires `REDDIT_USER_REFRESH_TOKEN`.

---

## Tests

```bash
cd src
pytest ../tests -v      # 37 tests
```

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11+, FastAPI, PRAW, Uvicorn |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS 4 |
| Data fetching | TanStack Query v5 |
| Routing | React Router v7 |

---

## Compliance

- Complies with [Reddit's Responsible Builder Policy](https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy)
- Complies with [Reddit Data API Terms](https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki)
- Read operations use application-only OAuth2 (`read` scope); no user credentials required for reading
- Rate-limited to ≤60 requests/minute with automatic backoff on 429 responses
- No user data is collected, stored, or sold. See [PRIVACY.md](./PRIVACY.md) for full policy.

---

## License

MIT

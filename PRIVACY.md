# Privacy Policy

**Project**: DevPulse
**Last updated**: March 2026

---

## What this tool does

DevPulse is a read-only research tool that fetches publicly visible posts and comments from Reddit via the official Reddit Data API. It is used to identify discussion trends around AI developer tools across a defined set of subreddits.

---

## What data is accessed

DevPulse accesses only data that is already publicly visible to any unauthenticated visitor on Reddit, including:

- Post titles, scores, and comment counts
- Top-level comment text (first 3 comments per post, truncated to 300 characters)
- Subreddit name and post URL

---

## What data is NOT collected or stored

DevPulse does not collect, store, or process:

- Reddit usernames or account identifiers of any kind
- User profile data, karma, or account history
- Private messages or content from private subreddits
- Voting history or behavioral patterns of individual users
- Any information that could be used to identify a specific person

Raw API responses (which may contain username fields) are processed in memory and immediately discarded. They are never written to disk, logged, or transmitted to any third party.

---

## What data is retained

Only anonymized, aggregated output is stored locally:

- **Entity mention counts**: how many posts in a given week mentioned a given AI tool (e.g. "claude mentioned in 14 posts")
- **Sentiment signals**: aggregate counts of positive/negative language in posts mentioning a given entity
- **Post titles and URLs**: retained in weekly report files as representative examples of discussion topics

No information that identifies individual Reddit users is retained at any stage.

---

## Data sharing

Aggregated trend reports may be shared internally within the development team for product research purposes. No data — raw or aggregated — is sold, licensed, or shared with any third party.

---

## Compliance

This tool is operated in compliance with:

- [Reddit's Responsible Builder Policy](https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy)
- [Reddit Data API Terms of Service](https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki)

Reddit's rate limits are strictly observed. The tool self-limits to ≤60 requests per minute and implements automatic backoff on rate-limit responses.

---

## Contact

For questions about data handling, contact the project maintainer via the GitHub repository.

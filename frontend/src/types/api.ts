// Mirrors backend models.py

export type DraftStatus = "pending" | "approved" | "rejected" | "submitted" | "failed";
export type DraftType = "post" | "comment";

export interface PostSummaryResponse {
  id: string;
  subreddit: string;
  title: string;
  score: number;
  num_comments: number;
  created_utc: number;
  url: string;
  top_comments: string[];
  relevance_score: number;
}

export interface EntityMentionResponse {
  entity: string;
  mention_count: number;
  avg_post_score: number;
  positive_signals: number;
  negative_signals: number;
  representative_titles: string[];
}

export interface TrendReportResponse {
  generated_at: string;
  total_posts_analyzed: number;
  subreddits_covered: string[];
  entity_mentions: EntityMentionResponse[];
  top_posts: Record<string, unknown>[];
}

export interface PulseResult {
  posts: PostSummaryResponse[];
  total: number;
  subreddits_scanned: string[];
  duration_s: number;
}

export interface DraftCreate {
  draft_type: DraftType;
  subreddit: string;
  title?: string;
  body: string;
  parent_id?: string;
}

export interface DraftUpdate {
  title?: string;
  body?: string;
}

export interface DraftResponse {
  id: string;
  draft_type: DraftType;
  status: DraftStatus;
  subreddit: string;
  title: string | null;
  body: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  reddit_url: string | null;
  reviewed_by: string | null;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  detail: string;
  success: boolean;
}

export interface SubredditConfig {
  name: string;
  enabled: boolean;
  mode: string;
  limit: number;
  min_score: number;
}

export interface HealthResponse {
  status: string;
  version: string;
}

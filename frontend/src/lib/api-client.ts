import type {
  HealthResponse,
  PulseResult,
  TrendReportResponse,
  SubredditConfig,
  DraftResponse,
  DraftCreate,
  DraftUpdate,
  AuditEntry,
} from "@/types/api";

const BASE = import.meta.env.VITE_API_BASE_URL || "";

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status}: ${body || res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Health
export const getHealth = () => fetchJSON<HealthResponse>("/api/health");

// Subreddits
export const getSubreddits = () => fetchJSON<SubredditConfig[]>("/api/subreddits");

// Pulse
export const getLatestPulse = () => fetchJSON<PulseResult>("/api/pulse/latest");

export const triggerPulse = (subreddits?: string[], limit = 25) =>
  fetchJSON<PulseResult>("/api/pulse", {
    method: "POST",
    body: JSON.stringify({ subreddits, limit }),
  });

// Trends
export const getTrends = (subreddits?: string[], limit = 25) => {
  const params = new URLSearchParams();
  if (subreddits?.length) subreddits.forEach((s) => params.append("subreddits", s));
  if (limit !== 25) params.set("limit", String(limit));
  const qs = params.toString();
  return fetchJSON<TrendReportResponse>(`/api/trends${qs ? `?${qs}` : ""}`);
};

// Export
export const exportReport = (fmt: "json" | "markdown") =>
  fetchJSON<{ status: string; path: string }>(`/api/export/${fmt}`, { method: "POST" });

// Drafts
export const getDrafts = (status?: string) => {
  const qs = status ? `?status=${status}` : "";
  return fetchJSON<DraftResponse[]>(`/api/drafts${qs}`);
};

export const getDraft = (id: string) => fetchJSON<DraftResponse>(`/api/drafts/${id}`);

export const createDraft = (data: DraftCreate) =>
  fetchJSON<DraftResponse>("/api/drafts", { method: "POST", body: JSON.stringify(data) });

export const updateDraft = (id: string, data: DraftUpdate) =>
  fetchJSON<DraftResponse>(`/api/drafts/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const approveDraft = (id: string, reviewer: string) =>
  fetchJSON<DraftResponse>(`/api/drafts/${id}/approve?reviewer=${encodeURIComponent(reviewer)}`, {
    method: "POST",
  });

export const rejectDraft = (id: string, reviewer: string) =>
  fetchJSON<DraftResponse>(`/api/drafts/${id}/reject?reviewer=${encodeURIComponent(reviewer)}`, {
    method: "POST",
  });

export const submitDraft = (id: string) =>
  fetchJSON<DraftResponse>(`/api/drafts/${id}/submit`, { method: "POST" });

export const deleteDraft = (id: string) =>
  fetchJSON<void>(`/api/drafts/${id}`, { method: "DELETE" });

// Audit
export const getAuditLog = (date?: string) => {
  const qs = date ? `?date=${date}` : "";
  return fetchJSON<AuditEntry[]>(`/api/audit${qs}`);
};

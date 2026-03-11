export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  submitted: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  rejected: "bg-rose-500/15 text-rose-500 border-rose-500/30",
  failed: "bg-rose-500/15 text-rose-500 border-rose-500/30",
};

export const SENTIMENT_COLORS = {
  positive: "bg-emerald-500",
  negative: "bg-rose-500",
  neutral: "bg-slate-500",
} as const;

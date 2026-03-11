import type { DraftResponse } from "@/types/api";
import { StatusChip } from "@/components/shared/StatusChip";
import { SubredditBadge } from "@/components/shared/SubredditBadge";
import { DraftActions } from "./DraftActions";
import { relativeTime } from "@/lib/utils";

interface DraftCardProps {
  draft: DraftResponse;
  onEdit: () => void;
  onApprove: () => void;
  onReject: () => void;
  onSubmit: () => void;
  onDelete: () => void;
}

export function DraftCard({ draft, onEdit, onApprove, onReject, onSubmit, onDelete }: DraftCardProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-xs font-medium text-slate-400">
              {draft.draft_type}
            </span>
            <SubredditBadge name={draft.subreddit} />
            <StatusChip status={draft.status} />
            <span className="font-mono text-xs text-slate-600">
              {relativeTime(draft.created_at)}
            </span>
          </div>
          {draft.title && (
            <p className="text-sm font-medium text-slate-200">{draft.title}</p>
          )}
          <p className="mt-1 text-sm text-slate-400 line-clamp-2">{draft.body}</p>
          {draft.reviewed_by && (
            <p className="mt-1 font-mono text-xs text-slate-600">
              Reviewed by: {draft.reviewed_by}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3">
        <DraftActions
          status={draft.status}
          onEdit={onEdit}
          onApprove={onApprove}
          onReject={onReject}
          onSubmit={onSubmit}
          onDelete={onDelete}
          redditUrl={draft.reddit_url}
        />
      </div>
    </div>
  );
}

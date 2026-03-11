import { Check, X, Send, ExternalLink, Trash2, Pencil } from "lucide-react";
import type { DraftStatus } from "@/types/api";

interface DraftActionsProps {
  status: DraftStatus;
  onEdit?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onSubmit?: () => void;
  onDelete?: () => void;
  redditUrl?: string | null;
}

export function DraftActions({
  status,
  onEdit,
  onApprove,
  onReject,
  onSubmit,
  onDelete,
  redditUrl,
}: DraftActionsProps) {
  const btn =
    "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors";

  return (
    <div className="flex flex-wrap gap-1.5">
      {status === "pending" && (
        <>
          {onEdit && (
            <button onClick={onEdit} className={`${btn} text-slate-400 hover:bg-slate-800`}>
              <Pencil className="h-3 w-3" /> Edit
            </button>
          )}
          {onApprove && (
            <button
              onClick={onApprove}
              className={`${btn} text-emerald-500 hover:bg-emerald-500/10`}
            >
              <Check className="h-3 w-3" /> Approve
            </button>
          )}
          {onReject && (
            <button onClick={onReject} className={`${btn} text-rose-500 hover:bg-rose-500/10`}>
              <X className="h-3 w-3" /> Reject
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className={`${btn} text-slate-500 hover:bg-slate-800`}>
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          )}
        </>
      )}
      {status === "approved" && onSubmit && (
        <button onClick={onSubmit} className={`${btn} text-indigo-400 hover:bg-indigo-500/10`}>
          <Send className="h-3 w-3" /> Submit to Reddit
        </button>
      )}
      {status === "submitted" && redditUrl && (
        <a
          href={redditUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn} text-indigo-400 hover:bg-indigo-500/10`}
        >
          <ExternalLink className="h-3 w-3" /> View on Reddit
        </a>
      )}
      {status === "rejected" && onDelete && (
        <button onClick={onDelete} className={`${btn} text-slate-500 hover:bg-slate-800`}>
          <Trash2 className="h-3 w-3" /> Delete
        </button>
      )}
    </div>
  );
}

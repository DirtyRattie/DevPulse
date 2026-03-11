import { useState } from "react";
import {
  useDrafts,
  useCreateDraft,
  useUpdateDraft,
  useApproveDraft,
  useRejectDraft,
  useSubmitDraft,
  useDeleteDraft,
} from "@/hooks/use-drafts";
import { DraftsHeader } from "@/components/drafts/DraftsHeader";
import { StatusFilterTabs } from "@/components/drafts/StatusFilterTabs";
import { DraftList } from "@/components/drafts/DraftList";
import { DraftFormDialog } from "@/components/drafts/DraftFormDialog";
import { ReviewDialog } from "@/components/drafts/ReviewDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PenSquare, AlertTriangle } from "lucide-react";
import type { DraftResponse } from "@/types/api";

export function DraftsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState<DraftResponse | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ draft: DraftResponse; action: "approve" | "reject" } | null>(null);

  const { data: drafts, isLoading, error } = useDrafts(statusFilter || undefined);
  const createDraft = useCreateDraft();
  const updateDraft = useUpdateDraft();
  const approveDraft = useApproveDraft();
  const rejectDraft = useRejectDraft();
  const submitDraft = useSubmitDraft();
  const deleteDraft = useDeleteDraft();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <DraftsHeader onCreateNew={() => { setEditingDraft(null); setFormOpen(true); }} />

      <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-500">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        Drafts are stored in memory. They will be lost when the server restarts.
      </div>

      <StatusFilterTabs value={statusFilter} onChange={setStatusFilter} />

      {error && <ErrorCard message={String(error)} />}

      {!isLoading && drafts?.length === 0 && (
        <EmptyState
          icon={PenSquare}
          message="No drafts yet."
          action={
            <button
              onClick={() => { setEditingDraft(null); setFormOpen(true); }}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Create your first draft
            </button>
          }
        />
      )}

      <DraftList
        drafts={drafts || []}
        isLoading={isLoading}
        onEdit={(draft) => { setEditingDraft(draft); setFormOpen(true); }}
        onApprove={(draft) => setReviewTarget({ draft, action: "approve" })}
        onReject={(draft) => setReviewTarget({ draft, action: "reject" })}
        onSubmit={(draft) => submitDraft.mutate(draft.id)}
        onDelete={(draft) => deleteDraft.mutate(draft.id)}
      />

      <DraftFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingDraft(null); }}
        editingDraft={editingDraft}
        onSubmit={(data) => createDraft.mutate(data)}
        onUpdate={(data) => {
          if (editingDraft) {
            updateDraft.mutate({ id: editingDraft.id, data });
          }
        }}
      />

      <ReviewDialog
        open={!!reviewTarget}
        action={reviewTarget?.action || "approve"}
        onClose={() => setReviewTarget(null)}
        onConfirm={(reviewer) => {
          if (!reviewTarget) return;
          if (reviewTarget.action === "approve") {
            approveDraft.mutate({ id: reviewTarget.draft.id, reviewer });
          } else {
            rejectDraft.mutate({ id: reviewTarget.draft.id, reviewer });
          }
        }}
      />
    </div>
  );
}

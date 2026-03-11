import type { DraftResponse } from "@/types/api";
import { DraftCard } from "./DraftCard";

interface DraftListProps {
  drafts: DraftResponse[];
  isLoading: boolean;
  onEdit: (draft: DraftResponse) => void;
  onApprove: (draft: DraftResponse) => void;
  onReject: (draft: DraftResponse) => void;
  onSubmit: (draft: DraftResponse) => void;
  onDelete: (draft: DraftResponse) => void;
}

export function DraftList({
  drafts,
  isLoading,
  onEdit,
  onApprove,
  onReject,
  onSubmit,
  onDelete,
}: DraftListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {drafts.map((draft) => (
        <DraftCard
          key={draft.id}
          draft={draft}
          onEdit={() => onEdit(draft)}
          onApprove={() => onApprove(draft)}
          onReject={() => onReject(draft)}
          onSubmit={() => onSubmit(draft)}
          onDelete={() => onDelete(draft)}
        />
      ))}
    </div>
  );
}

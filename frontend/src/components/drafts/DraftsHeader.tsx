import { Plus } from "lucide-react";

interface DraftsHeaderProps {
  onCreateNew: () => void;
}

export function DraftsHeader({ onCreateNew }: DraftsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-lg font-semibold text-slate-100">Drafts</h1>
      <button
        onClick={onCreateNew}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
      >
        <Plus className="h-4 w-4" />
        New Draft
      </button>
    </div>
  );
}

import { useState } from "react";
import { X } from "lucide-react";

interface ReviewDialogProps {
  open: boolean;
  action: "approve" | "reject";
  onClose: () => void;
  onConfirm: (reviewer: string) => void;
}

export function ReviewDialog({ open, action, onClose, onConfirm }: ReviewDialogProps) {
  const [reviewer, setReviewer] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewer.trim()) {
      onConfirm(reviewer.trim());
      setReviewer("");
      onClose();
    }
  };

  const isApprove = action === "approve";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="mx-4 w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-200">
            {isApprove ? "Approve Draft" : "Reject Draft"}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <input
            type="text"
            placeholder="Your name (reviewer)"
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
            required
            autoFocus
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                isApprove
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-rose-600 hover:bg-rose-500"
              }`}
            >
              {isApprove ? "Approve" : "Reject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { DraftResponse, DraftType } from "@/types/api";

interface DraftFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    draft_type: DraftType;
    subreddit: string;
    title?: string;
    body: string;
    parent_id?: string;
  }) => void;
  editingDraft?: DraftResponse | null;
  onUpdate?: (data: { title?: string; body?: string }) => void;
}

export function DraftFormDialog({ open, onClose, onSubmit, editingDraft, onUpdate }: DraftFormDialogProps) {
  const [draftType, setDraftType] = useState<DraftType>("post");
  const [subreddit, setSubreddit] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [parentId, setParentId] = useState("");

  useEffect(() => {
    if (editingDraft) {
      setDraftType(editingDraft.draft_type);
      setSubreddit(editingDraft.subreddit);
      setTitle(editingDraft.title || "");
      setBody(editingDraft.body);
      setParentId(editingDraft.parent_id || "");
    } else {
      setDraftType("post");
      setSubreddit("");
      setTitle("");
      setBody("");
      setParentId("");
    }
  }, [editingDraft, open]);

  if (!open) return null;

  const isEditing = !!editingDraft;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && onUpdate) {
      onUpdate({ title: title || undefined, body });
    } else {
      onSubmit({
        draft_type: draftType,
        subreddit,
        title: draftType === "post" ? title : undefined,
        body,
        parent_id: draftType === "comment" ? parentId : undefined,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="mx-4 w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-200">
            {isEditing ? "Edit Draft" : "New Draft"}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {!isEditing && (
            <>
              <div className="flex gap-2">
                {(["post", "comment"] as DraftType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDraftType(t)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      draftType === t
                        ? "bg-indigo-500/15 text-indigo-400"
                        : "text-slate-500 hover:text-slate-400"
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Subreddit (e.g. LocalLLaMA)"
                value={subreddit}
                onChange={(e) => setSubreddit(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500"
              />
              {draftType === "comment" && (
                <input
                  type="text"
                  placeholder="Parent ID (e.g. t3_abc123)"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500"
                />
              )}
            </>
          )}
          {(draftType === "post" || isEditing) && (
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500"
            />
          )}
          <textarea
            placeholder="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={5}
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
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              {isEditing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

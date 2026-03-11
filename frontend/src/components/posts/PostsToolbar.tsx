import { SubredditFilter } from "@/components/trends/SubredditFilter";

interface PostsToolbarProps {
  subreddits: string[];
  selectedSubs: string[];
  onSubsChange: (subs: string[]) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "score", label: "Score" },
  { value: "date", label: "Date" },
];

export function PostsToolbar({
  subreddits,
  selectedSubs,
  onSubsChange,
  sortBy,
  onSortChange,
}: PostsToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-indigo-500"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {subreddits.length > 0 && (
        <SubredditFilter
          subreddits={subreddits}
          selected={selectedSubs}
          onChange={onSubsChange}
        />
      )}
    </div>
  );
}

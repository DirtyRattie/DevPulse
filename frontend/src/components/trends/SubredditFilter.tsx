import { cn } from "@/lib/utils";

interface SubredditFilterProps {
  subreddits: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function SubredditFilter({ subreddits, selected, onChange }: SubredditFilterProps) {
  const toggle = (sub: string) => {
    if (selected.includes(sub)) {
      onChange(selected.filter((s) => s !== sub));
    } else {
      onChange([...selected, sub]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {subreddits.map((sub) => {
        const active = selected.includes(sub);
        return (
          <button
            key={sub}
            onClick={() => toggle(sub)}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-xs transition-colors",
              active
                ? "border-indigo-500/50 bg-indigo-500/15 text-indigo-400"
                : "border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400"
            )}
          >
            r/{sub}
          </button>
        );
      })}
    </div>
  );
}

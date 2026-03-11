import { cn } from "@/lib/utils";

interface SubredditBadgeProps {
  name: string;
  className?: string;
}

export function SubredditBadge({ name, className }: SubredditBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded bg-indigo-500/10 px-1.5 py-0.5 font-mono text-xs text-indigo-400",
        className
      )}
    >
      r/{name}
    </span>
  );
}

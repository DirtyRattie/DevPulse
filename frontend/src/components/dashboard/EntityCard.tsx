import { cn, sentimentLabel } from "@/lib/utils";
import { SentimentDot } from "@/components/shared/SentimentDot";

interface EntityCardProps {
  name: string;
  count: number;
  positive: number;
  negative: number;
  onClick?: () => void;
}

export function EntityCard({ name, count, positive, negative, onClick }: EntityCardProps) {
  const sentiment = sentimentLabel(positive, negative);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5",
        "text-left transition-colors hover:border-slate-700 hover:bg-slate-800/70"
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-200">{name}</p>
        <p className="font-mono text-xs text-slate-500">{count} mentions</p>
      </div>
      <SentimentDot type={sentiment} />
    </button>
  );
}

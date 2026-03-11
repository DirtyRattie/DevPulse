interface RelevanceIndicatorProps {
  score: number; // 0.0 - 1.0
}

export function RelevanceIndicator({ score }: RelevanceIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-16 overflow-hidden rounded-full bg-slate-700">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${score * 100}%` }}
        />
      </div>
    </div>
  );
}

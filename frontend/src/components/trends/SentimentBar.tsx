interface SentimentBarProps {
  positive: number;
  negative: number;
}

export function SentimentBar({ positive, negative }: SentimentBarProps) {
  const total = positive + negative;
  if (total === 0) {
    return <div className="h-2 w-full rounded-full bg-slate-700" />;
  }
  const posPct = (positive / total) * 100;
  const negPct = (negative / total) * 100;

  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-700">
      {posPct > 0 && (
        <div className="bg-emerald-500 transition-all" style={{ width: `${posPct}%` }} />
      )}
      {negPct > 0 && (
        <div className="bg-rose-500 transition-all" style={{ width: `${negPct}%` }} />
      )}
    </div>
  );
}

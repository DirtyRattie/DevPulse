interface TrendsHeaderProps {
  generatedAt?: string;
  totalPosts?: number;
}

export function TrendsHeader({ generatedAt, totalPosts }: TrendsHeaderProps) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <h1 className="text-lg font-semibold text-slate-100">Trends</h1>
      {generatedAt && (
        <span className="font-mono text-xs text-slate-500">
          Generated: {new Date(generatedAt).toLocaleString()}
        </span>
      )}
      {totalPosts !== undefined && (
        <span className="text-xs text-slate-500">{totalPosts} posts analyzed</span>
      )}
    </div>
  );
}

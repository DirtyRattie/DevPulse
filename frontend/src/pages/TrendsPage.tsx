import { useState } from "react";
import { useTrends } from "@/hooks/use-trends";
import { useSubreddits } from "@/hooks/use-subreddits";
import { TrendsHeader } from "@/components/trends/TrendsHeader";
import { SubredditFilter } from "@/components/trends/SubredditFilter";
import { EntityMentionTable } from "@/components/trends/EntityMentionTable";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { TrendingUp, Loader2 } from "lucide-react";

export function TrendsPage() {
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const { data: subreddits } = useSubreddits();
  const { data: trends, isLoading, error, refetch, isFetching } = useTrends(
    selectedSubs.length > 0 ? selectedSubs : undefined
  );

  const subNames = subreddits?.map((s) => s.name) || [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <TrendsHeader
        generatedAt={trends?.generated_at}
        totalPosts={trends?.total_posts_analyzed}
      />

      <div className="flex items-center gap-4">
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
        >
          {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
          Analyze Trends
        </button>
      </div>

      <SubredditFilter
        subreddits={subNames}
        selected={selectedSubs}
        onChange={setSelectedSubs}
      />

      {error && <ErrorCard message={String(error)} onRetry={() => refetch()} />}

      {!trends && !isLoading && !error && (
        <EmptyState
          icon={TrendingUp}
          message="Click 'Analyze Trends' to generate a trend report."
        />
      )}

      {trends && (
        <EntityMentionTable entities={trends.entity_mentions} isLoading={isLoading} />
      )}
    </div>
  );
}

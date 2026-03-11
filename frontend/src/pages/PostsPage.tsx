import { useState, useMemo } from "react";
import { useLatestPulse } from "@/hooks/use-pulse";
import { useSubreddits } from "@/hooks/use-subreddits";
import { PostsToolbar } from "@/components/posts/PostsToolbar";
import { PostList } from "@/components/posts/PostList";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { FileText } from "lucide-react";

export function PostsPage() {
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("relevance");
  const { data: pulse, isLoading, error } = useLatestPulse();
  const { data: subreddits } = useSubreddits();

  const subNames = subreddits?.map((s) => s.name) || [];

  const filteredAndSorted = useMemo(() => {
    let posts = pulse?.posts || [];
    if (selectedSubs.length > 0) {
      posts = posts.filter((p) => selectedSubs.includes(p.subreddit));
    }
    const sorted = [...posts];
    switch (sortBy) {
      case "score":
        sorted.sort((a, b) => b.score - a.score);
        break;
      case "date":
        sorted.sort((a, b) => b.created_utc - a.created_utc);
        break;
      default: // relevance
        sorted.sort((a, b) => b.relevance_score - a.relevance_score);
    }
    return sorted;
  }, [pulse?.posts, selectedSubs, sortBy]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-lg font-semibold text-slate-100">Posts</h1>

      <PostsToolbar
        subreddits={subNames}
        selectedSubs={selectedSubs}
        onSubsChange={setSelectedSubs}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {error && <ErrorCard message={String(error)} />}

      {!isLoading && filteredAndSorted.length === 0 && (
        <EmptyState
          icon={FileText}
          message="No posts yet. Run a Pulse from the Dashboard to get started."
        />
      )}

      <PostList posts={filteredAndSorted} isLoading={isLoading} />
    </div>
  );
}

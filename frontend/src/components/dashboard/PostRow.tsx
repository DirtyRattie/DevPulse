import type { PostSummaryResponse } from "@/types/api";
import { SubredditBadge } from "@/components/shared/SubredditBadge";
import { formatNumber } from "@/lib/utils";

interface PostRowProps {
  post: PostSummaryResponse;
  onClick?: () => void;
}

export function PostRow({ post, onClick }: PostRowProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-800/50"
    >
      <SubredditBadge name={post.subreddit} />
      <span className="min-w-0 flex-1 truncate text-sm text-slate-200">{post.title}</span>
      <span className="shrink-0 font-mono text-xs text-slate-500">{formatNumber(post.score)}</span>
    </button>
  );
}

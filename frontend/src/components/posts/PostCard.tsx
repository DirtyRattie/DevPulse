import { useState } from "react";
import { MessageSquare, ChevronDown, ExternalLink } from "lucide-react";
import type { PostSummaryResponse } from "@/types/api";
import { SubredditBadge } from "@/components/shared/SubredditBadge";
import { RelevanceIndicator } from "./RelevanceIndicator";
import { CommentDrawer } from "./CommentDrawer";
import { formatNumber, relativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: PostSummaryResponse;
}

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 transition-colors hover:border-slate-700">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center gap-2">
              <SubredditBadge name={post.subreddit} />
              <span className="font-mono text-xs text-slate-600">
                {relativeTime(post.created_utc)}
              </span>
            </div>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-start gap-1 text-sm font-medium text-slate-200 hover:text-indigo-400"
            >
              <span>{post.title}</span>
              <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="font-mono text-sm font-medium text-slate-300">
              {formatNumber(post.score)}
            </span>
            <RelevanceIndicator score={post.relevance_score} />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => setShowComments(!showComments)}
            className={cn(
              "inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-400",
              showComments && "bg-slate-800 text-slate-400"
            )}
          >
            <MessageSquare className="h-3 w-3" />
            {post.num_comments}
            <ChevronDown
              className={cn("h-3 w-3 transition-transform", showComments && "rotate-180")}
            />
          </button>
        </div>
      </div>

      {showComments && <CommentDrawer comments={post.top_comments} />}
    </div>
  );
}

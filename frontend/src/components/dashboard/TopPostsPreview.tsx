import type { PostSummaryResponse } from "@/types/api";
import { PostRow } from "./PostRow";
import { useNavigate } from "react-router-dom";

interface TopPostsPreviewProps {
  posts: PostSummaryResponse[];
  isLoading: boolean;
}

export function TopPostsPreview({ posts, isLoading }: TopPostsPreviewProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-10" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) return null;

  const top5 = posts.slice(0, 5);

  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
        Top Posts
      </p>
      <div className="rounded-lg border border-slate-800 bg-slate-900 divide-y divide-slate-800/50">
        {top5.map((post) => (
          <PostRow
            key={post.id}
            post={post}
            onClick={() => navigate(`/posts?id=${post.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

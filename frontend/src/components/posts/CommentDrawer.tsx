interface CommentDrawerProps {
  comments: string[];
}

export function CommentDrawer({ comments }: CommentDrawerProps) {
  if (comments.length === 0) {
    return <p className="px-4 py-3 text-xs text-slate-500">No comments available</p>;
  }

  return (
    <div className="space-y-2 border-t border-slate-800/50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Top Comments</p>
      {comments.map((comment, i) => (
        <p key={i} className="text-sm leading-relaxed text-slate-400">
          {comment}
        </p>
      ))}
    </div>
  );
}

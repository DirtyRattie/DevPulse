import { AlertTriangle } from "lucide-react";

interface ErrorCardProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorCard({ message, onRetry }: ErrorCardProps) {
  return (
    <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4">
      <div className="flex items-center gap-2 text-rose-400">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">Error</span>
      </div>
      <p className="mt-1 text-sm text-rose-300/80">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded-md bg-rose-500/15 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/25 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

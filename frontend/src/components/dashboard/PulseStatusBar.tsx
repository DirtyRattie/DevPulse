import type { PulseResult } from "@/types/api";
import { relativeTime } from "@/lib/utils";
import { Radio } from "lucide-react";

interface PulseStatusBarProps {
  pulse: PulseResult | undefined;
  isLoading: boolean;
}

export function PulseStatusBar({ pulse, isLoading }: PulseStatusBarProps) {
  if (isLoading) {
    return <div className="skeleton h-8 w-full max-w-lg" />;
  }

  if (!pulse || pulse.total === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Radio className="h-4 w-4" />
        <span>No pulse data yet. Run a pulse to get started.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
      <div className="flex items-center gap-1.5">
        <Radio className="h-3.5 w-3.5 text-emerald-500" />
        <span>Last pulse: {pulse.duration_s}s</span>
      </div>
      <span className="text-slate-600">|</span>
      <span>{pulse.total} posts</span>
      <span className="text-slate-600">|</span>
      <span>{pulse.subreddits_scanned.length} subs</span>
      <span className="text-slate-600">|</span>
      <span>{pulse.duration_s}s</span>
    </div>
  );
}

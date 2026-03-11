import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";
import type { DraftStatus } from "@/types/api";

interface StatusChipProps {
  status: DraftStatus;
  className?: string;
}

export function StatusChip({ status, className }: StatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        STATUS_COLORS[status] || "bg-slate-500/15 text-slate-400 border-slate-500/30",
        className
      )}
    >
      {status}
    </span>
  );
}

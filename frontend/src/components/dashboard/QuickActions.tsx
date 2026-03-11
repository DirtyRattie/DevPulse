import { Zap, Download, Loader2 } from "lucide-react";

interface QuickActionsProps {
  onRunPulse: () => void;
  onExport: () => void;
  isPulseLoading: boolean;
  isExportLoading: boolean;
}

export function QuickActions({ onRunPulse, onExport, isPulseLoading, isExportLoading }: QuickActionsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onRunPulse}
        disabled={isPulseLoading}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
      >
        {isPulseLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Zap className="h-4 w-4" />
        )}
        Run Pulse
      </button>
      <button
        onClick={onExport}
        disabled={isExportLoading}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 disabled:opacity-50"
      >
        {isExportLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Export
      </button>
    </div>
  );
}

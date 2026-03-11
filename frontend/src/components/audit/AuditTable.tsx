import type { AuditEntry } from "@/types/api";
import { CheckCircle2, XCircle } from "lucide-react";

interface AuditTableProps {
  entries: AuditEntry[];
  isLoading: boolean;
}

export function AuditTable({ entries, isLoading }: AuditTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-10" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/80">
            <th className="px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-500">
              Time
            </th>
            <th className="px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-500">
              Action
            </th>
            <th className="px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-500">
              Actor
            </th>
            <th className="px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-500">
              Detail
            </th>
            <th className="px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-500">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className="border-b border-slate-800/50 transition-colors hover:bg-slate-800/30"
            >
              <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-slate-400">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </td>
              <td className="px-3 py-2.5 text-sm text-slate-300">{entry.action}</td>
              <td className="px-3 py-2.5 font-mono text-xs text-slate-400">{entry.actor}</td>
              <td className="max-w-xs truncate px-3 py-2.5 text-sm text-slate-500">
                {entry.detail}
              </td>
              <td className="px-3 py-2.5">
                {entry.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-500" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

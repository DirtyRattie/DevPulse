import { useState, useMemo } from "react";
import type { EntityMentionResponse } from "@/types/api";
import { EntityMentionRow } from "./EntityMentionRow";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey = "entity" | "mention_count" | "avg_post_score" | "positive_signals" | "negative_signals";

interface EntityMentionTableProps {
  entities: EntityMentionResponse[];
  isLoading: boolean;
}

const COLUMNS: { key: SortKey; label: string; align?: string }[] = [
  { key: "entity", label: "Entity" },
  { key: "mention_count", label: "Mentions", align: "text-center" },
  { key: "avg_post_score", label: "Avg Score", align: "text-center" },
  { key: "positive_signals", label: "+Signals", align: "text-center" },
  { key: "negative_signals", label: "-Signals", align: "text-center" },
];

export function EntityMentionTable({ entities, isLoading }: EntityMentionTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("mention_count");
  const [sortDesc, setSortDesc] = useState(true);

  const sorted = useMemo(() => {
    const copy = [...entities];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
        return sortDesc ? bv.localeCompare(av) : av.localeCompare(bv);
      }
      return sortDesc ? (bv as number) - (av as number) : (av as number) - (bv as number);
    });
    return copy;
  }, [entities, sortKey, sortDesc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
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
            <th className="w-8" />
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={cn(
                  "cursor-pointer select-none px-2 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-500 hover:text-slate-300",
                  col.align
                )}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
            ))}
            <th className="px-2 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-500">
              Sentiment
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((entity) => (
            <EntityMentionRow key={entity.entity} entity={entity} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

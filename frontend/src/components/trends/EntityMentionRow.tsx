import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { EntityMentionResponse } from "@/types/api";
import { SentimentBar } from "./SentimentBar";
import { cn } from "@/lib/utils";

interface EntityMentionRowProps {
  entity: EntityMentionResponse;
}

export function EntityMentionRow({ entity }: EntityMentionRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer border-b border-slate-800/50 transition-colors hover:bg-slate-800/30"
      >
        <td className="py-2.5 pl-3 pr-2">
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 text-slate-500 transition-transform",
              expanded && "rotate-90"
            )}
          />
        </td>
        <td className="py-2.5 text-sm font-medium text-slate-200">{entity.entity}</td>
        <td className="py-2.5 text-center font-mono text-sm text-slate-300">
          {entity.mention_count}
        </td>
        <td className="py-2.5 text-center font-mono text-sm text-slate-400">
          {entity.avg_post_score.toFixed(0)}
        </td>
        <td className="py-2.5 text-center font-mono text-xs text-emerald-500">
          +{entity.positive_signals}
        </td>
        <td className="py-2.5 text-center font-mono text-xs text-rose-500">
          -{entity.negative_signals}
        </td>
        <td className="w-32 py-2.5 pr-3">
          <SentimentBar
            positive={entity.positive_signals}
            negative={entity.negative_signals}
          />
        </td>
      </tr>
      {expanded && entity.representative_titles.length > 0 && (
        <tr className="border-b border-slate-800/50 bg-slate-900/50">
          <td colSpan={7} className="px-10 py-3">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
              Representative Titles
            </p>
            <ul className="space-y-1">
              {entity.representative_titles.map((title, i) => (
                <li key={i} className="text-sm text-slate-400">
                  {title}
                </li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </>
  );
}

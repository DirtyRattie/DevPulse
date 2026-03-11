import type { EntityMentionResponse } from "@/types/api";
import { EntityCard } from "./EntityCard";
import { useNavigate } from "react-router-dom";

interface EntityHeatGridProps {
  entities: EntityMentionResponse[];
  isLoading: boolean;
}

export function EntityHeatGrid({ entities, isLoading }: EntityHeatGridProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="skeleton h-16" />
        ))}
      </div>
    );
  }

  if (entities.length === 0) return null;

  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
        Entity Mentions
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {entities.map((e) => (
          <EntityCard
            key={e.entity}
            name={e.entity}
            count={e.mention_count}
            positive={e.positive_signals}
            negative={e.negative_signals}
            onClick={() => navigate(`/trends?entity=${encodeURIComponent(e.entity)}`)}
          />
        ))}
      </div>
    </div>
  );
}

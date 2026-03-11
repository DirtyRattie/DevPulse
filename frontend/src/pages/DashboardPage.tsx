import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLatestPulse, useTriggerPulse } from "@/hooks/use-pulse";
import { PulseStatusBar } from "@/components/dashboard/PulseStatusBar";
import { EntityHeatGrid } from "@/components/dashboard/EntityHeatGrid";
import { TopPostsPreview } from "@/components/dashboard/TopPostsPreview";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { exportReport } from "@/lib/api-client";
import { getTrends } from "@/lib/api-client";
import type { EntityMentionResponse } from "@/types/api";

export function DashboardPage() {
  const { data: pulse, isLoading: pulseLoading, error: pulseError } = useLatestPulse();
  const triggerPulse = useTriggerPulse();
  const [entities, setEntities] = useState<EntityMentionResponse[]>([]);

  const exportMutation = useMutation({
    mutationFn: () => exportReport("json"),
  });

  const handleRunPulse = async () => {
    const result = await triggerPulse.mutateAsync({});
    // After pulse, fetch trends to get entity data for the grid
    if (result.total > 0) {
      try {
        const trends = await getTrends();
        setEntities(trends.entity_mentions);
      } catch {
        // Trends fetch is best-effort for dashboard
      }
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-100">Dashboard</h1>
        <QuickActions
          onRunPulse={handleRunPulse}
          onExport={() => exportMutation.mutate()}
          isPulseLoading={triggerPulse.isPending}
          isExportLoading={exportMutation.isPending}
        />
      </div>

      <PulseStatusBar pulse={pulse} isLoading={pulseLoading} />

      {pulseError && (
        <ErrorCard
          message={String(pulseError)}
          onRetry={() => triggerPulse.mutate({})}
        />
      )}

      {triggerPulse.error && (
        <ErrorCard message={String(triggerPulse.error)} />
      )}

      {exportMutation.isSuccess && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-400">
          Export completed successfully.
        </div>
      )}

      <EntityHeatGrid
        entities={entities}
        isLoading={triggerPulse.isPending}
      />

      <TopPostsPreview
        posts={pulse?.posts || []}
        isLoading={pulseLoading}
      />
    </div>
  );
}

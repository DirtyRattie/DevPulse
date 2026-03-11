import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLatestPulse, triggerPulse } from "@/lib/api-client";

export function useLatestPulse() {
  return useQuery({
    queryKey: ["pulse", "latest"],
    queryFn: getLatestPulse,
    staleTime: Infinity,
  });
}

export function useTriggerPulse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: { subreddits?: string[]; limit?: number }) =>
      triggerPulse(params?.subreddits, params?.limit),
    onSuccess: (data) => {
      qc.setQueryData(["pulse", "latest"], data);
    },
  });
}

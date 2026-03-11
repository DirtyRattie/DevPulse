import { useQuery } from "@tanstack/react-query";
import { getTrends } from "@/lib/api-client";

export function useTrends(subreddits?: string[]) {
  return useQuery({
    queryKey: ["trends", subreddits],
    queryFn: () => getTrends(subreddits),
    staleTime: Infinity,
    enabled: false,
  });
}

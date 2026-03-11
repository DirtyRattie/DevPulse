import { useQuery } from "@tanstack/react-query";
import { getSubreddits } from "@/lib/api-client";

export function useSubreddits() {
  return useQuery({
    queryKey: ["subreddits"],
    queryFn: getSubreddits,
    staleTime: Infinity,
  });
}

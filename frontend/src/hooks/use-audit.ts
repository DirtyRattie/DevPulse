import { useQuery } from "@tanstack/react-query";
import { getAuditLog } from "@/lib/api-client";

export function useAuditLog(date?: string) {
  return useQuery({
    queryKey: ["audit", date],
    queryFn: () => getAuditLog(date),
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDrafts,
  createDraft,
  updateDraft,
  approveDraft,
  rejectDraft,
  submitDraft,
  deleteDraft,
} from "@/lib/api-client";
import type { DraftCreate, DraftUpdate } from "@/types/api";

export function useDrafts(status?: string) {
  return useQuery({
    queryKey: ["drafts", status],
    queryFn: () => getDrafts(status),
    refetchInterval: 10_000,
  });
}

export function useCreateDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DraftCreate) => createDraft(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drafts"] }),
  });
}

export function useUpdateDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DraftUpdate }) => updateDraft(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drafts"] }),
  });
}

export function useApproveDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewer }: { id: string; reviewer: string }) => approveDraft(id, reviewer),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drafts"] }),
  });
}

export function useRejectDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewer }: { id: string; reviewer: string }) => rejectDraft(id, reviewer),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drafts"] }),
  });
}

export function useSubmitDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => submitDraft(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drafts"] }),
  });
}

export function useDeleteDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDraft(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drafts"] }),
  });
}

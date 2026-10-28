import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  approveMilestone,
  requestMilestoneChanges,
  submitArtifact,
} from "../utils/escrows";

export const useMilestones = (escrowId) =>
  useQuery({
    queryKey: ["milestones", escrowId],
    queryFn: () => getMilestones(escrowId),
    enabled: !!escrowId,
  });

export const useCreateMilestone = (escrowId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fields) => createMilestone(escrowId, fields),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["milestones", escrowId] }),
  });
};

export const useUpdateMilestone = (escrowId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ milestoneId, fields }) =>
      updateMilestone(escrowId, milestoneId, fields),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["milestones", escrowId] }),
  });
};

export const useDeleteMilestone = (escrowId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (milestoneId) => deleteMilestone(escrowId, milestoneId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["milestones", escrowId] }),
  });
};

export const useApproveMilestone = (escrowId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (milestoneId) => approveMilestone(escrowId, milestoneId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["milestones", escrowId] });
      qc.invalidateQueries({ queryKey: ["escrow", escrowId] });
      qc.invalidateQueries({ queryKey: ["escrowEvents", escrowId] });
    },
  });
};

export const useRequestChanges = (escrowId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ milestoneId, note }) =>
      requestMilestoneChanges(escrowId, milestoneId, { note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["milestones", escrowId] });
      qc.invalidateQueries({ queryKey: ["escrow", escrowId] });
      qc.invalidateQueries({ queryKey: ["escrowEvents", escrowId] });
    },
  });
};

export const useSubmitArtifact = (escrowId, milestoneId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => submitArtifact(escrowId, milestoneId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["milestones", escrowId] });
      qc.invalidateQueries({ queryKey: ["escrow", escrowId] });
      qc.invalidateQueries({ queryKey: ["escrowEvents", escrowId] });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEscrowById,
  getArtifactsByEscrow,
  finalizeEscrow,
} from "../utils/escrows";

export const useEscrowDetail = (escrowId) =>
  useQuery({
    queryKey: ["escrow", escrowId],
    queryFn: () => getEscrowById(escrowId),
    enabled: !!escrowId,
    // Response shape:
    // { ...escrowFields, milestones: Milestone[], progress: { total, approved } }
    // Each milestone has a latestArtifact sub-object (or null).
  });

// Returns { [milestoneId]: artifact[], unlinked: artifact[] }
export const useArtifacts = (escrowId) =>
  useQuery({
    queryKey: ["artifacts", escrowId],
    queryFn: () => getArtifactsByEscrow(escrowId),
    enabled: !!escrowId,
  });

export const useFinalizeEscrow = (escrowId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => finalizeEscrow(escrowId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["escrow", escrowId] });
      qc.invalidateQueries({ queryKey: ["escrows", "me"] });
      qc.invalidateQueries({ queryKey: ["escrowEvents", escrowId] });
    },
  });
};

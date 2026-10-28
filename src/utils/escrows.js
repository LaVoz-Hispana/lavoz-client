import { makeRequest } from "../axios";

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await makeRequest.post("/upload", formData);
  return res.data; // returns the fileUrl string
};

// ── Escrow ────────────────────────────────────────────────────────────────────

export const getEscrowById = (escrowId) =>
  makeRequest.get(`/escrows/${escrowId}`).then((res) => res.data);

export const getMyEscrows = () =>
  makeRequest.get("/escrows/me").then((res) => res.data);

// ── Milestones ────────────────────────────────────────────────────────────────

export const createMilestone = (
  escrowId,
  { title, description, dueDate, order },
) =>
  makeRequest
    .post(`/escrows/${escrowId}/milestones`, {
      title,
      description,
      dueDate,
      order,
    })
    .then((res) => res.data);

export const getMilestones = (escrowId) =>
  makeRequest.get(`/escrows/${escrowId}/milestones`).then((res) => res.data);

// Partial update — only provided fields are overwritten. Only allowed while escrow is pending.
export const updateMilestone = (escrowId, milestoneId, fields) =>
  makeRequest
    .put(`/escrows/${escrowId}/milestones/${milestoneId}`, fields)
    .then((res) => res.data);

// Only allowed while escrow is pending.
export const deleteMilestone = (escrowId, milestoneId) =>
  makeRequest
    .delete(`/escrows/${escrowId}/milestones/${milestoneId}`)
    .then((res) => res.data);

// Returns { approved: boolean, escrowCompleted: boolean }.
// escrowCompleted: true means all milestones are done and the escrow was auto-completed.
export const approveMilestone = (escrowId, milestoneId) =>
  makeRequest
    .put(`/escrows/${escrowId}/milestones/${milestoneId}/approve`)
    .then((res) => res.data);

// note is required — backend returns 400 if missing.
// Resets milestone → revision_requested, escrow → active.
export const requestMilestoneChanges = (escrowId, milestoneId, { note }) =>
  makeRequest
    .put(`/escrows/${escrowId}/milestones/${milestoneId}/request-changes`, {
      note,
    })
    .then((res) => res.data);

// ── Artifact submission (milestone-scoped) ────────────────────────────────────

export const submitArtifact = (
  escrowId,
  milestoneId,
  { fileUrl, description },
) => {
  const body = { description };
  if (fileUrl) body.fileUrl = fileUrl;
  return makeRequest
    .post(`/escrows/${escrowId}/milestones/${milestoneId}/submit`, body)
    .then((res) => res.data);
};

// ── Artifacts (grouped by milestone) ─────────────────────────────────────────

// Returns { [milestoneId]: artifact[], unlinked: artifact[] }.
// Use artifacts[milestoneId] for per-milestone history.
// "unlinked" holds pre-milestone-system artifacts — ignore in per-card views.
export const getArtifactsByEscrow = (escrowId) =>
  makeRequest.get(`/artifacts/${escrowId}`).then((res) => res.data);

// ── Finalize escrow ───────────────────────────────────────────────────────────

export const finalizeEscrow = (escrowId) =>
  makeRequest.post(`/escrows/${escrowId}/finalize`).then((res) => res.data);

// ── Event ledger ──────────────────────────────────────────────────────────────

// Returns chronological array of event objects:
// { id, escrowId, milestoneId, artifactId, actorId, actorRole, eventType,
//   note, createdAt, actorUsername, actorProfilePic, milestoneTitle, artifactDescription }
export const getEscrowEvents = (escrowId) =>
  makeRequest.get(`/escrows/${escrowId}/events`).then((res) => res.data);

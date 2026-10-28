import "./milestoneCard.scss";
import { useState } from "react";
import moment from "moment";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MilestoneForm from "./MilestoneForm";
import {
  useUpdateMilestone,
  useDeleteMilestone,
  useSubmitArtifact,
  useApproveMilestone,
  useRequestChanges,
} from "../../hooks/useMilestones";
import { useArtifacts } from "../../hooks/useEscrowDetail";
import { uploadFile } from "../../utils/escrows";
import { ESCROW_STATUS } from "../../utils/escrowStatus";

export const MILESTONE_STATUS_COLORS = {
  pending: "#888",
  active: "#2980b9",
  submitted: "#8e44ad",
  revision_requested: "#e67e22",
  approved: "#27ae60",
};

const MILESTONE_STATUS_LABELS = {
  pending: "Pending",
  active: "Active",
  submitted: "Submitted",
  revision_requested: "Revision Requested",
  approved: "Approved",
};

const SUBMIT_STATUSES = new Set(["pending", "active", "revision_requested"]);
const MAX_FILE_MB = 100;

const MilestoneCard = ({ milestone, escrow, isLocal, isStudent }) => {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);

  // Submission form state
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Edit/delete error
  const [editError, setEditError] = useState(null);

  // Request-changes state
  const [requestingChanges, setRequestingChanges] = useState(false);
  const [note, setNote] = useState("");
  const [requestError, setRequestError] = useState(null);

  const canEdit =
    isLocal &&
    (escrow.status === ESCROW_STATUS.PENDING || milestone.status === "pending");
  const isOverdue =
    milestone.dueDate &&
    milestone.status !== "approved" &&
    moment(milestone.dueDate).isBefore(moment(), "day");

  const updateMutation = useUpdateMilestone(escrow.id);
  const deleteMutation = useDeleteMilestone(escrow.id);
  const submitMutation = useSubmitArtifact(escrow.id, milestone.id);
  const approveMutation = useApproveMilestone(escrow.id);
  const requestMutation = useRequestChanges(escrow.id);

  const { data: artifactsMap } = useArtifacts(escrow.id);
  const artifactHistory = artifactsMap?.[String(milestone.id)] ?? [];

  const handleUpdate = (fields) => {
    setEditError(null);
    updateMutation.mutate(
      { milestoneId: milestone.id, fields },
      {
        onSuccess: () => setEditing(false),
        onError: (err) => {
          const data = err?.response?.data;
          setEditError(
            typeof data === "string"
              ? data
              : data?.message || "Failed to update milestone.",
          );
          setEditing(false);
        },
      },
    );
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete milestone "${milestone.title}"?`)) return;
    setEditError(null);
    deleteMutation.mutate(milestone.id, {
      onError: (err) => {
        const data = err?.response?.data;
        setEditError(
          typeof data === "string"
            ? data
            : data?.message || "Failed to delete milestone.",
        );
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!desc.trim()) {
      setSubmitError("Description is required.");
      return;
    }
    if (file && file.size > MAX_FILE_MB * 1024 * 1024) {
      setSubmitError(`File exceeds ${MAX_FILE_MB} MB limit.`);
      return;
    }
    setSubmitError(null);

    let fileUrl = null;
    if (file) {
      setUploading(true);
      try {
        fileUrl = await uploadFile(file);
      } catch {
        setSubmitError("File upload failed.");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    submitMutation.mutate(
      { description: desc.trim(), fileUrl },
      {
        onSuccess: () => {
          setDesc("");
          setFile(null);
          setSubmitSuccess(true);
          setTimeout(() => setSubmitSuccess(false), 3000);
        },
        onError: (err) => {
          const data = err?.response?.data;
          setSubmitError(
            typeof data === "string"
              ? data
              : data?.message || "Submission failed.",
          );
        },
      },
    );
  };

  const handleApprove = () => {
    if (!window.confirm(`Approve "${milestone.title}"? This cannot be undone.`))
      return;
    approveMutation.mutate(milestone.id, {
      onError: (err) => {
        const data = err?.response?.data;
        setRequestError(
          typeof data === "string" ? data : data?.message || "Approval failed.",
        );
      },
    });
  };

  const handleRequestChanges = (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    requestMutation.mutate(
      { milestoneId: milestone.id, note: note.trim() },
      {
        onSuccess: () => {
          setRequestingChanges(false);
          setNote("");
          setRequestError(null);
        },
        onError: (err) => {
          const data = err?.response?.data;
          setRequestError(
            typeof data === "string"
              ? data
              : data?.message || "Request failed.",
          );
        },
      },
    );
  };

  if (editing) {
    return (
      <div className="milestone-card">
        <MilestoneForm
          initialValues={{
            title: milestone.title,
            description: milestone.description ?? "",
            dueDate: milestone.dueDate
              ? moment(milestone.dueDate).format("YYYY-MM-DD")
              : "",
          }}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          isPending={updateMutation.isPending}
        />
      </div>
    );
  }

  const isBusy = uploading || submitMutation.isPending;

  return (
    <div className={`milestone-card ${isOverdue ? "overdue" : ""}`}>
      {/* ── Header row ── */}
      <div
        className="card-main"
        onClick={() => setExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="card-left">
          <span
            className="status-badge"
            style={{
              backgroundColor:
                MILESTONE_STATUS_COLORS[milestone.status] || "#888",
            }}
            aria-label={`Status: ${MILESTONE_STATUS_LABELS[milestone.status] || milestone.status}`}
          >
            {MILESTONE_STATUS_LABELS[milestone.status] || milestone.status}
          </span>
          <span className="title">{milestone.title}</span>
        </div>

        <div className="card-right">
          {isOverdue && (
            <span className="overdue-badge" aria-label="Overdue">
              Overdue
            </span>
          )}
          {milestone.dueDate && (
            <span className="due-date">
              Due {moment(milestone.dueDate).format("MMM D")}
            </span>
          )}
          {canEdit && (
            <div className="card-actions" onClick={(e) => e.stopPropagation()}>
              <button
                className="btn-icon"
                onClick={() => setEditing(true)}
                aria-label="Edit milestone"
                disabled={updateMutation.isPending}
              >
                Edit
              </button>
              <button
                className="btn-icon btn-danger"
                onClick={handleDelete}
                aria-label="Delete milestone"
                disabled={deleteMutation.isPending}
              >
                Delete
              </button>
            </div>
          )}
          <span className="chevron" aria-hidden="true">
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {editError && (
        <div className="edit-error" role="alert">
          {editError}
        </div>
      )}

      {/* ── Expanded body ── */}
      {expanded && (
        <div className="card-expanded">
          {milestone.description && (
            <p className="description">{milestone.description}</p>
          )}

          {/* ── Approved banner (Phase 4 task 3) ── */}
          {milestone.status === "approved" && (
            <div className="approved-banner" role="status">
              Approved
            </div>
          )}

          {/* ── Student submit form (Phase 4 task 1) ── */}
          {isStudent && SUBMIT_STATUSES.has(milestone.status) && (
            <form className="submit-form" onSubmit={handleSubmit}>
              <h4 className="form-heading">
                {milestone.status === "revision_requested"
                  ? "Resubmit with changes"
                  : "Submit deliverable"}
              </h4>
              <textarea
                rows={3}
                value={desc}
                onChange={(e) => {
                  setDesc(e.target.value);
                  setSubmitError(null);
                }}
                placeholder="Describe what you're submitting…"
                aria-label="Submission description"
              />
              <label
                className="file-label"
                htmlFor={`artifact-file-${milestone.id}`}
              >
                <CloudUploadIcon fontSize="small" />
                <span>{file ? file.name : "Attach a file (optional)"}</span>
              </label>
              <input
                id={`artifact-file-${milestone.id}`}
                type="file"
                accept=".png,.jpg,.jpeg,.gif,.svg,.webp,.pdf,.txt,.md,.csv,.docx,.xlsx,.pptx,.zip,.tar,.gz,.rar,.mp4,.mov,.js,.ts,.jsx,.tsx,.py,.java,.c,.cpp,.cs,.html,.css,.scss,.json,.yaml,.yml,.toml,.xml,.rb,.go,.rs,.php,.swift,.kt,.sql,.sh,.bash,.r,.m"
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files[0])}
              />
              {submitError && (
                <span className="msg msg-error" role="alert">
                  {submitError}
                </span>
              )}
              {submitSuccess && (
                <span className="msg msg-success" role="status">
                  Submitted!
                </span>
              )}
              <button
                type="submit"
                disabled={isBusy}
                aria-label="Submit deliverable"
              >
                {uploading ? "Uploading…" : isBusy ? "Submitting…" : "Submit"}
              </button>
            </form>
          )}

          {/* ── Local: approve / request-changes (Phase 5) ── */}
          {isLocal &&
            milestone.status === "submitted" &&
            escrow.status !== ESCROW_STATUS.COMPLETED && (
              <div className="local-actions">
                {requestingChanges ? (
                  <form
                    className="request-form"
                    onSubmit={handleRequestChanges}
                  >
                    <h4 className="form-heading">Request changes</h4>
                    <textarea
                      rows={3}
                      value={note}
                      onChange={(e) => {
                        setNote(e.target.value);
                        setRequestError(null);
                      }}
                      placeholder="Describe what needs to change… (required)"
                      aria-label="Change request note"
                      autoFocus
                    />
                    {requestError && (
                      <span className="msg msg-error" role="alert">
                        {requestError}
                      </span>
                    )}
                    <div className="request-form-actions">
                      <button
                        type="submit"
                        className="btn-changes"
                        disabled={!note.trim() || requestMutation.isPending}
                        aria-label="Send change request"
                      >
                        {requestMutation.isPending ? "Sending…" : "Send"}
                      </button>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => {
                          setRequestingChanges(false);
                          setNote("");
                          setRequestError(null);
                        }}
                        aria-label="Cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="action-row">
                    {requestError && (
                      <span className="msg msg-error" role="alert">
                        {requestError}
                      </span>
                    )}
                    <button
                      className="btn-approve"
                      onClick={handleApprove}
                      disabled={approveMutation.isPending}
                      aria-label="Approve milestone"
                    >
                      {approveMutation.isPending ? "Approving…" : "Approve"}
                    </button>
                    <button
                      className="btn-changes"
                      onClick={() => setRequestingChanges(true)}
                      aria-label="Request changes"
                    >
                      Request Changes
                    </button>
                  </div>
                )}
              </div>
            )}

          {/* ── Artifact history (Phase 4 task 2) ── */}
          {artifactHistory.length > 0 && (
            <div className="artifact-history">
              <span className="history-label">Submission history</span>
              <div className="history-list">
                {artifactHistory.map((a) => (
                  <div key={a.id} className="history-entry">
                    <p className="entry-desc">{a.description}</p>
                    <div className="entry-meta">
                      {a.fileUrl && (
                        <a
                          href={a.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="entry-link"
                          aria-label="View submitted file"
                        >
                          View file ↗
                        </a>
                      )}
                      <span className="entry-date">
                        {moment(a.createdAt).format("MMM D, YYYY h:mm A")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MilestoneCard;

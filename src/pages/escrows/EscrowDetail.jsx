import "./escrowDetail.scss";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useTranslation } from "react-i18next";
import { ESCROW_STATUS, STATUS_COLORS } from "../../utils/escrowStatus";
import moment from "moment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Comments from "../../components/comments/Comments";
import { useEscrowDetail, useFinalizeEscrow } from "../../hooks/useEscrowDetail";
import MilestoneList from "../../components/escrow/MilestoneList";
import MilestoneProgress from "../../components/escrow/MilestoneProgress";
import EscrowEventFeed from "../../components/escrow/EscrowEventFeed";
import ProviderBadge from "../../components/provider/ProviderBadge";
import EscrowReview from "../../components/review/EscrowReview";

const extractError = (err, fallback) => {
  const data = err?.response?.data;
  return typeof data === "string" ? data : data?.message || data?.error || fallback;
};

const EscrowDetail = () => {
  const { t } = useTranslation();
  const { id: rawId } = useParams();
  const id = Number(rawId);
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [actionError, setActionError] = useState(null);
  const [feedOpen, setFeedOpen] = useState(false);
  const [finalizeError, setFinalizeError] = useState(null);

  const { isLoading, error, data: escrow } = useEscrowDetail(id);
  const finalizeMutation = useFinalizeEscrow(id);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["escrow", id] });
    queryClient.invalidateQueries({ queryKey: ["escrows", "me"] });
  };

  const acceptMutation = useMutation({
    mutationFn: () => makeRequest.put(`/escrows/${id}/accept`),
    onSuccess: () => { invalidate(); setActionError(null); },
    onError: (err) => setActionError(extractError(err, "Action failed.")),
  });

  const declineMutation = useMutation({
    mutationFn: () => makeRequest.put(`/escrows/${id}/cancel`),
    onSuccess: () => { invalidate(); setActionError(null); },
    onError: (err) => setActionError(extractError(err, "Action failed.")),
  });

  if (isLoading) return <div className="escrow-detail"><span className="state">Loading…</span></div>;
  if (error || !escrow) return <div className="escrow-detail"><span className="state">Escrow not found.</span></div>;

  const isStudent = currentUser?.id === escrow.studentId;
  const isLocal   = currentUser?.id === escrow.localId;

  return (
    <div className="escrow-detail">
      <div className="back-row">
        <Link to="/escrows" style={{ textDecoration: "none", color: "inherit" }}>
          <ArrowBackIcon fontSize="small" />
          <span>{t("escrow.backToEscrows")}</span>
        </Link>
      </div>

      <div className="detail-wrapper">
        {/* ── Header ── */}
        <div className="card-header">
          <span
            className="status-badge"
            style={{ backgroundColor: STATUS_COLORS[escrow.status] || "#888" }}
          >
            {t(`escrow.${escrow.status}`)}
          </span>
          <h1>{escrow.projectTitle}</h1>
          <div className="parties">
            <span>{t("escrow.student")}: <strong>{escrow.studentUsername}</strong></span>
            <span>·</span>
            <span>{t("escrow.local")}: <strong>{escrow.localUsername}</strong> <ProviderBadge label={escrow.localProviderTypeLabel} /></span>
          </div>
          {escrow.progress && <MilestoneProgress progress={escrow.progress} />}
          <p className="updated-at">
            {t("escrow.lastUpdated")}: {moment(escrow.updatedAt).format("MMM D, YYYY h:mm A")}
          </p>
          {escrow.projectId && (
            <Link to={`/projects/${escrow.projectId}`} className="view-project-link">
              {t("escrow.viewProject")} →
            </Link>
          )}
        </div>

        {/* ── All-approved banner (Local only, escrow active) ── */}
        {isLocal &&
          escrow.status === ESCROW_STATUS.ACTIVE &&
          escrow.progress?.total > 0 &&
          escrow.progress?.approved === escrow.progress?.total && (
          <div className="all-approved-banner">
            <div className="all-approved-text">
              <strong>All milestones approved.</strong>
              <span>You can finalize the project or add another milestone.</span>
            </div>
            <div className="all-approved-actions">
              {finalizeError && <span className="finalize-error">{finalizeError}</span>}
              <button
                className="btn-finalize"
                onClick={() => {
                  if (!window.confirm("Finalize this project? This will mark it as complete and cannot be undone.")) return;
                  finalizeMutation.mutate(undefined, {
                    onError: (err) => {
                      const data = err?.response?.data;
                      setFinalizeError(typeof data === "string" ? data : data?.message || "Failed to finalize.");
                    },
                  });
                }}
                disabled={finalizeMutation.isPending}
              >
                {finalizeMutation.isPending ? "Finalizing…" : "Finalize Project →"}
              </button>
            </div>
          </div>
        )}

        {/* ── Two-panel body ── */}
        <div className="panels">

          {/* ── Milestones panel ── */}
          <div className="panel-milestones">
            <h3 className="panel-heading">{t("escrow.milestones") || "Milestones"}</h3>

            {/* Student: accept / decline when pending */}
            {isStudent && escrow.status === ESCROW_STATUS.PENDING && (
              <div className="pending-actions">
                <p className="pending-msg">{t("escrow.pendingMsg")}</p>
                {actionError && <span className="error-msg">{actionError}</span>}
                <div className="action-row">
                  <button
                    className="approve-btn"
                    onClick={() => acceptMutation.mutate()}
                    disabled={acceptMutation.isPending}
                  >
                    {t("escrow.accept")}
                  </button>
                  <button
                    className="changes-btn"
                    onClick={() => declineMutation.mutate()}
                    disabled={declineMutation.isPending}
                  >
                    {t("escrow.decline")}
                  </button>
                </div>
              </div>
            )}

            <MilestoneList
              escrowId={id}
              escrow={escrow}
              isLocal={isLocal}
              isStudent={isStudent}
            />
          </div>

          {/* ── Activity feed panel ── */}
          <div className={`panel-feed${feedOpen ? " open" : ""}`}>
            <button
              className="feed-toggle"
              onClick={() => setFeedOpen((v) => !v)}
              aria-expanded={feedOpen}
              aria-label={t("escrow.toggleActivity")}
            >
              {t("escrow.activity")} {feedOpen ? "▲" : "▼"}
            </button>
            <div className="feed-body">
              <EscrowEventFeed escrowId={id} escrowStatus={escrow.status} />
            </div>
          </div>
        </div>

        {escrow.status === ESCROW_STATUS.COMPLETED && (isStudent || isLocal) && <EscrowReview escrowId={id} />}

        {/* ── Comments (completed escrows only) ── */}
        {escrow.status === ESCROW_STATUS.COMPLETED && escrow.showcasePostId && (
          <div className="comments-section">
            <Comments post={{ id: escrow.showcasePostId, userId: escrow.studentId }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EscrowDetail;

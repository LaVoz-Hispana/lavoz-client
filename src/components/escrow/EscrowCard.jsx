import "./escrowCard.scss";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { STATUS_COLORS } from "../../utils/escrowStatus";
import moment from "moment";
import ProviderBadge from "../provider/ProviderBadge";

const EscrowCard = ({ escrow }) => {
  const { t } = useTranslation();

  const statusLabel = t(`escrow.${escrow.status}`) || escrow.status;

  const progress = escrow.progress ?? null;
  const hasProgress = progress && progress.total > 0;
  const progressPct = hasProgress
    ? Math.round((progress.approved / progress.total) * 100)
    : 0;

  const isOverdue =
    Array.isArray(escrow.milestones) &&
    escrow.milestones.some(
      (m) =>
        m.status !== "approved" &&
        m.dueDate &&
        moment(m.dueDate).isBefore(moment(), "day"),
    );

  return (
    <Link
      to={`/escrows/${escrow.id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div className={`escrow-card${isOverdue ? " has-overdue" : ""}`}>
        <div className="card-top">
          <div className="card-top-badges">
            <span
              className="status-badge"
              style={{
                backgroundColor: STATUS_COLORS[escrow.status] || "#888",
              }}
            >
              {statusLabel}
            </span>
            {isOverdue && (
              <span
                className="overdue-badge"
                aria-label="Has overdue milestones"
              >
                Overdue
              </span>
            )}
          </div>
          <h3>{escrow.projectTitle}</h3>
        </div>

        <div className="card-body">
          <div className="row">
            <span className="label">{t("escrow.student")}:</span>
            <span>{escrow.studentUsername}</span>
          </div>
          <div className="row">
            <span className="label">{t("escrow.local")}:</span>
            <span>
              {escrow.localUsername}{" "}
              <ProviderBadge label={escrow.localProviderTypeLabel} />
            </span>
          </div>
          <div className="row">
            <span className="label">{t("escrow.lastUpdated")}:</span>
            <span>{moment(escrow.updatedAt).fromNow()}</span>
          </div>

          {hasProgress && (
            <div className="milestone-progress">
              <div className="progress-label">
                <span>
                  {progress.approved} / {progress.total} milestones approved
                </span>
                <span>{progressPct}%</span>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuetext={`${progress.approved} of ${progress.total} milestones approved`}
              >
                <div
                  className="progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default EscrowCard;

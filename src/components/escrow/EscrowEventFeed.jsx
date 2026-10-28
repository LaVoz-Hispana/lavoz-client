import "./escrowEventFeed.scss";
import moment from "moment";
import { useEscrowEvents } from "../../hooks/useEscrowEvents";
import ProviderBadge from "../provider/ProviderBadge";
import { useTranslation } from "react-i18next";

const EVENT_LABELS = {
  escrow_created: "Escrow created",
  student_accepted: "Student accepted invitation",
  student_declined: "Student declined invitation",
  milestone_added: "Milestone added",
  milestone_updated: "Milestone updated",
  artifact_submitted: "Deliverable submitted",
  change_requested: "Changes requested",
  milestone_approved: "Milestone approved",
  escrow_completed: "Project completed",
  escrow_cancelled: "Escrow cancelled",
};

const EVENT_BORDER_COLORS = {
  escrow_created: "#888",
  student_accepted: "#888",
  student_declined: "#888",
  milestone_added: "#888",
  milestone_updated: "#888",
  artifact_submitted: "#8e44ad",
  change_requested: "#e67e22",
  milestone_approved: "#27ae60",
  escrow_completed: "#27ae60",
  escrow_cancelled: "#e74c3c",
};

const SkeletonRow = () => (
  <div className="event-row skeleton" aria-hidden="true">
    <div className="sk-avatar" />
    <div className="sk-body">
      <div className="sk-line sk-line--short" />
      <div className="sk-line sk-line--long" />
    </div>
  </div>
);

const EscrowEventFeed = ({ escrowId, escrowStatus }) => {
  const { t } = useTranslation();
  const {
    isLoading,
    error,
    data: events,
  } = useEscrowEvents(escrowId, escrowStatus);

  return (
    <div className="escrow-event-feed">
      <h3 className="feed-heading">Activity</h3>

      {isLoading && (
        <div className="feed-list">
          {[1, 2, 3, 4].map((n) => (
            <SkeletonRow key={n} />
          ))}
        </div>
      )}

      {error && <span className="feed-state">Failed to load activity.</span>}

      {!isLoading && !error && events?.length === 0 && (
        <span className="feed-state">No activity yet.</span>
      )}

      {!isLoading && !error && events?.length > 0 && (
        <ol className="feed-list" aria-label="Escrow activity feed">
          {[...events].reverse().map((event) => (
            <li
              key={event.id}
              className="event-row"
              style={{
                borderLeftColor: EVENT_BORDER_COLORS[event.eventType] || "#888",
              }}
            >
              {/* Avatar */}
              <div className="event-avatar">
                {event.actorProfilePic ? (
                  <img src={event.actorProfilePic} alt={event.actorUsername} />
                ) : (
                  <span className="avatar-fallback" aria-hidden="true">
                    {event.actorUsername?.[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="event-content">
                <div className="event-header">
                  <span className="actor-name">{event.actorUsername}</span>
                  <ProviderBadge label={event.actorProviderTypeLabel} />
                  {event.actorRole && (
                    <span className="role-badge" data-role={event.actorRole}>
                      {event.actorRole === "local"
                        ? t("register.local")
                        : event.actorRole === "student"
                          ? t("register.student")
                          : event.actorRole === "admin"
                            ? t("admin.dashboard")
                            : event.actorRole}
                    </span>
                  )}
                  <span className="event-type">
                    {EVENT_LABELS[event.eventType] ?? event.eventType}
                  </span>
                  <span
                    className="event-time"
                    title={moment(event.createdAt).format("MMM D, YYYY h:mm A")}
                  >
                    {moment(event.createdAt).fromNow()}
                  </span>
                </div>

                {event.milestoneTitle && (
                  <span className="event-milestone">
                    Milestone: {event.milestoneTitle}
                  </span>
                )}

                {event.note && <p className="event-note">{event.note}</p>}

                {event.artifactId && event.artifactDescription && (
                  <p className="event-artifact">{event.artifactDescription}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default EscrowEventFeed;

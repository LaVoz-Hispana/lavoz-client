import "./milestoneList.scss";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import MilestoneCard from "./MilestoneCard";
import MilestoneForm from "./MilestoneForm";
import { useMilestones, useCreateMilestone } from "../../hooks/useMilestones";
import { ESCROW_STATUS } from "../../utils/escrowStatus";

const MilestoneList = ({ escrowId, escrow, isLocal, isStudent }) => {
  const { t } = useTranslation();
  const [adding, setAdding] = useState(false);
  const [createError, setCreateError] = useState(null);

  const { isLoading, error, data: raw } = useMilestones(escrowId);

  // Sort by dueDate ascending; milestones without a date go to the end
  const milestones = raw
    ? [...raw].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      })
    : raw;
  const createMutation = useCreateMilestone(escrowId);

  const canAdd =
    isLocal &&
    (escrow.status === ESCROW_STATUS.PENDING ||
      escrow.status === ESCROW_STATUS.ACTIVE);

  const handleCreate = (fields) => {
    setCreateError(null);
    createMutation.mutate(fields, {
      onSuccess: () => setAdding(false),
      onError: (err) => {
        const data = err?.response?.data;
        setCreateError(
          typeof data === "string"
            ? data
            : data?.message || "Failed to create milestone.",
        );
      },
    });
  };

  if (isLoading) {
    return (
      <div className="milestone-list">
        {[1, 2, 3].map((n) => (
          <div key={n} className="skeleton-row" aria-hidden="true" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="milestone-list">
        <span className="list-state">{t("escrow.milestoneLoadError")}</span>
      </div>
    );
  }

  return (
    <div className="milestone-list">
      {milestones?.length === 0 && !adding && (
        <span className="list-state">{t("escrow.noMilestones")}</span>
      )}

      <div className="cards">
        {milestones?.map((milestone) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            escrow={escrow}
            isLocal={isLocal}
            isStudent={isStudent}
          />
        ))}
      </div>

      {createError && (
        <span className="list-error" role="alert">
          {createError}
        </span>
      )}

      {adding && (
        <MilestoneForm
          onSubmit={handleCreate}
          onCancel={() => {
            setAdding(false);
            setCreateError(null);
          }}
          isPending={createMutation.isPending}
        />
      )}

      {canAdd && !adding && (
        <button
          className="btn-add-milestone"
          onClick={() => setAdding(true)}
          aria-label="Add milestone"
        >
          + Add Milestone
        </button>
      )}
    </div>
  );
};

export default MilestoneList;

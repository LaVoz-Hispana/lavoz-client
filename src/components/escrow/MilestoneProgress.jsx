import "./milestoneProgress.scss";

const MilestoneProgress = ({ progress }) => {
  if (!progress || progress.total === 0) return null;

  const { total, approved } = progress;
  const pct = Math.round((approved / total) * 100);
  const allDone = approved === total;

  return (
    <div className="milestone-progress">
      {allDone ? (
        <div className="all-complete" role="status">
          All milestones complete
        </div>
      ) : (
        <>
          <div className="progress-label">
            <span>
              {approved} of {total} milestones approved
            </span>
            <span className="pct">{pct}%</span>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={approved}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuetext={`${approved} of ${total} milestones approved`}
          >
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </>
      )}
    </div>
  );
};

export default MilestoneProgress;

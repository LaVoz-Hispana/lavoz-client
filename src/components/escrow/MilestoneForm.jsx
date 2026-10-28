import "./milestoneForm.scss";
import { useState } from "react";

const empty = { title: "", description: "", dueDate: "" };

const MilestoneForm = ({
  initialValues = {},
  onSubmit,
  onCancel,
  isPending,
}) => {
  const [values, setValues] = useState({ ...empty, ...initialValues });
  const [error, setError] = useState(null);

  const set = (field) => (e) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!values.title.trim()) {
      setError("Title is required.");
      return;
    }
    setError(null);
    onSubmit({
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      dueDate: values.dueDate || undefined,
    });
  };

  return (
    <form className="milestone-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="ms-title">Title *</label>
        <input
          id="ms-title"
          type="text"
          value={values.title}
          onChange={set("title")}
          placeholder="Milestone title"
          aria-required="true"
        />
      </div>

      <div className="field">
        <label htmlFor="ms-desc">Description</label>
        <textarea
          id="ms-desc"
          rows={3}
          value={values.description}
          onChange={set("description")}
          placeholder="Optional details"
        />
      </div>

      <div className="field">
        <label htmlFor="ms-due">Due date</label>
        <input
          id="ms-due"
          type="date"
          value={values.dueDate}
          onChange={set("dueDate")}
        />
      </div>

      {error && (
        <span className="form-error" role="alert">
          {error}
        </span>
      )}

      <div className="form-actions">
        <button
          type="submit"
          className="btn-primary"
          disabled={isPending}
          aria-label="Save milestone"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={onCancel}
          aria-label="Cancel"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default MilestoneForm;

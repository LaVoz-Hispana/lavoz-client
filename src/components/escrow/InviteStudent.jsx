import "./inviteStudent.scss";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useTranslation } from "react-i18next";
import DisabledByDefaultIcon from "@mui/icons-material/DisabledByDefault";
import { featureError } from "../../utils/resumes";

const InviteStudent = ({ studentId, studentUsername, onClose }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState("");
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState(null);

  const { isLoading, data: projects } = useQuery({
    queryKey: ["projects", "mine"],
    queryFn: () => makeRequest.get("/projects/mine").then((res) => res.data),
  });

  const openProjects = projects ? projects.filter((p) => p.status === "open") : [];

  const mutation = useMutation({
    mutationFn: () =>
      makeRequest.post("/escrows/invite", { studentId, projectId: selectedProject }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows", "me"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", "mine"] });
      setServerError(null);
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    },
    onError: (err) => {
      const data = err?.response?.data;
      setServerError(
        data?.code ? featureError(err, t) : typeof data === "string" ? data : data?.message || data?.error || t("escrow.inviteError")
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    mutation.mutate();
  };

  return (
    <div className="invite-student">
      <div className="wrapper">
        <h2>{t("escrow.inviteTitle")}</h2>
        <p className="subtitle">
          <strong>{studentUsername}</strong>
        </p>

        {isLoading && <span className="state">Loading your projects...</span>}

        {!isLoading && openProjects.length === 0 && (
          <span className="empty">{t("escrow.noProjects")}</span>
        )}

        {!isLoading && openProjects.length > 0 && (
          <form onSubmit={handleSubmit}>
            <label>{t("escrow.selectProject")}</label>
            <select
              value={selectedProject}
              onChange={(e) => { setSelectedProject(e.target.value); setServerError(null); }}
              required
            >
              <option value="">—</option>
              {openProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>

            {serverError && <span className="error-msg">{serverError}</span>}
            {success && <span className="success-msg">{t("escrow.inviteSuccess")}</span>}

            <div className="footer">
              <button type="submit" disabled={!selectedProject || mutation.isPending}>
                {mutation.isPending ? "..." : t("escrow.confirm")}
              </button>
            </div>
          </form>
        )}

        <button className="close" onClick={onClose}>
          <DisabledByDefaultIcon style={{ color: "red" }} />
        </button>
      </div>
    </div>
  );
};

export default InviteStudent;

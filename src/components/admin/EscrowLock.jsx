import "./escrowLock.scss";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useTranslation } from "react-i18next";
import { featureError } from "../../utils/resumes";

const EscrowLock = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [studentId, setStudentId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState(null);

  const { data: users } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => makeRequest.get("/users/").then((res) => res.data),
  });

  const { data: projects } = useQuery({
    queryKey: ["adminProjects"],
    queryFn: () => makeRequest.get("/projects").then((res) => res.data),
  });

  const { data: escrows } = useQuery({
    queryKey: ["adminEscrows"],
    queryFn: () => makeRequest.get("/escrows").then((res) => res.data),
  });

  const students = users?.filter((u) => u.account_type === "student") ?? [];

  const projectsWithEscrow = new Set(
    (escrows ?? [])
      .filter((e) => e.status !== "cancelled")
      .map((e) => e.projectId)
  );

  const openProjects = (projects ?? []).filter(
    (p) => p.status === "open" && !projectsWithEscrow.has(p.id)
  );

  const selectedProjectObj = openProjects.find((p) => p.id === Number(projectId));

  const mutation = useMutation({
    mutationFn: () =>
      makeRequest.post("/escrows", {
        studentId: Number(studentId),
        projectId: Number(projectId),
        localId: selectedProjectObj?.userId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminEscrows"] });
      queryClient.invalidateQueries({ queryKey: ["escrows", "me"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      setStudentId("");
      setProjectId("");
      setServerError(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err) => {
      const data = err?.response?.data;
      setServerError(
        data?.code ? featureError(err, t) : typeof data === "string" ? data : data?.message || data?.error || t("admin.lockError")
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentId || !projectId) return;
    mutation.mutate();
  };

  return (
    <div className="escrow-lock">
      <h3>{t("admin.escrowLock")}</h3>
      <form onSubmit={handleSubmit}>
        <select
          value={studentId}
          onChange={(e) => { setStudentId(e.target.value); setServerError(null); }}
          required
        >
          <option value="">{t("admin.selectStudent")}</option>
          {students.map((u) => (
            <option key={u.id} value={u.id}>
              {u.username} {u.university ? `· ${u.university}` : ""}
            </option>
          ))}
        </select>

        <select
          value={projectId}
          onChange={(e) => { setProjectId(e.target.value); setServerError(null); }}
          required
        >
          <option value="">{t("admin.selectProject")}</option>
          {openProjects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} · {p.username}
            </option>
          ))}
        </select>

        {serverError && <span className="error-msg">{serverError}</span>}
        {success && <span className="success-msg">{t("admin.lockSuccess")}</span>}

        <button type="submit" disabled={!studentId || !projectId || mutation.isPending}>
          {t("admin.lockBtn")}
        </button>
      </form>
    </div>
  );
};

export default EscrowLock;

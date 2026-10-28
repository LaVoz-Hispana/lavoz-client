import ProfileLink from "../profile/ProfileLink";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";
import { useResumes } from "../../hooks/useResumes";
import ResumeLibrary from "../resume/ResumeLibrary";
import {
  downloadResume,
  featureError,
  invalidateApplications,
} from "../../utils/resumes";
import { isAdmin } from "../../utils/admin";
import "../resume/resumeApplications.scss";

export function ApplicationCard({
  application,
  reviewer = false,
  canResolve = false,
}) {
  const { t, i18n } = useTranslation();
  const client = useQueryClient();
  const applicant = application.applicant;
  const mutation = useMutation({
    mutationFn: (action) =>
      action === "download"
        ? downloadResume(application.resumeId, application.originalFileName)
        : makeRequest.put(
            `/applications/projects/${application.projectId}/${application.id}/${action}`,
          ),
    onSuccess: (_, action) =>
      action !== "download" && invalidateApplications(client),
    onError: () => invalidateApplications(client),
  });
  const canAct =
    application.status === "submitted" && application.projectStatus === "open";
  return (
    <article className="application-card">
      {reviewer && applicant && (
        <div className="applicant-summary">
          <div className="applicant-heading">
            {applicant.profilePic && <img src={applicant.profilePic} alt="" />}
            <div>
              <h3>
                <ProfileLink to={`/profile/${applicant.id}`}>
                  {applicant.name || applicant.username}
                </ProfileLink>
              </h3>
              {applicant.name && applicant.username && (
                <span className="resume-meta">@{applicant.username}</span>
              )}
            </div>
          </div>
          {[applicant.university, applicant.major, applicant.gradYear].filter(
            Boolean,
          ).length > 0 && (
            <p>
              {[applicant.university, applicant.major, applicant.gradYear]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          {applicant.city && <p>{applicant.city}</p>}
          {applicant.bio && <p>{applicant.bio}</p>}
          {applicant.skills && (
            <div
              className="applicant-skills"
              aria-label={t("resumeApplications.applicantSkills")}
            >
              {applicant.skills
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean)
                .map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
            </div>
          )}
        </div>
      )}
      <p className="application-status">
        {t(`resumeApplications.statuses.${application.status}`)}
      </p>
      <p>
        {t("resumeApplications.selectedResume")}: {application.resumeLabel}
      </p>
      <p className="resume-meta">
        {t("resumeApplications.appliedOn")}{" "}
        {new Date(application.createdAt).toLocaleString(i18n.language)}
      </p>
      {application.updatedAt && (
        <p className="resume-meta">
          {t("resumeApplications.updatedOn")}{" "}
          {new Date(application.updatedAt).toLocaleString(i18n.language)}
        </p>
      )}
      {application.resolvedAt && (
        <p className="resume-meta">
          {t("resumeApplications.resolvedOn")}{" "}
          {new Date(application.resolvedAt).toLocaleString(i18n.language)}
        </p>
      )}
      {application.note && (
        <p className="application-note">{application.note}</p>
      )}
      <div className="resume-actions">
        {(!reviewer ||
          ["submitted", "selected"].includes(application.status)) && (
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate("download")}
          >
            {t("resumeApplications.download")}
          </button>
        )}
        {canAct &&
          (canResolve ? (
            <>
              <button
                type="button"
                disabled={mutation.isPending}
                onClick={() => {
                  if (window.confirm(t("resumeApplications.selectConfirm")))
                    mutation.mutate("select");
                }}
              >
                {t("resumeApplications.selectApplicant")}
              </button>
              <button
                type="button"
                disabled={mutation.isPending}
                onClick={() => {
                  if (window.confirm(t("resumeApplications.rejectConfirm")))
                    mutation.mutate("reject");
                }}
              >
                {t("resumeApplications.reject")}
              </button>
            </>
          ) : (
            !reviewer && (
              <button
                type="button"
                disabled={mutation.isPending}
                onClick={() => {
                  if (window.confirm(t("resumeApplications.withdrawConfirm")))
                    mutation.mutate("withdraw");
                }}
              >
                {t("resumeApplications.withdraw")}
              </button>
            )
          ))}
        {application.status === "selected" && application.escrowId && (
          <Link to={`/escrows/${application.escrowId}`}>
            {t("resumeApplications.viewEscrow")}
          </Link>
        )}
      </div>
      {mutation.isError && (
        <p role="alert">{featureError(mutation.error, t)}</p>
      )}
    </article>
  );
}

function ApplyDialog({ project, onClose }) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const resumes = useResumes();
  const [selected, setSelected] = useState("");
  const [note, setNote] = useState("");
  const [showLibrary, setShowLibrary] = useState(false);
  const [success, setSuccess] = useState(false);
  const resumeId =
    selected ||
    String(
      resumes.data?.find((r) => r.isDefault)?.id || resumes.data?.[0]?.id || "",
    );
  const validSelection = resumes.data?.some((r) => String(r.id) === resumeId);
  const mutation = useMutation({
    mutationFn: () =>
      makeRequest.post(`/applications/projects/${project.id}`, {
        resumeId: Number(resumeId),
        note,
      }),
    onSuccess: async () => {
      setSuccess(true);
      await invalidateApplications(client);
    },
    onError: () => invalidateApplications(client),
  });
  return (
    <Dialog
      open
      onClose={mutation.isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="application-dialog-title"
    >
      <DialogTitle id="application-dialog-title">
        {t("resumeApplications.applyTo", { title: project.title })}
      </DialogTitle>
      <DialogContent>
        <div className="resume-applications">
          {success ? (
            <p role="status">{t("resumeApplications.submittedSuccess")}</p>
          ) : (
            <>
              {resumes.isPending && (
                <p role="status">{t("resumeApplications.loading")}</p>
              )}
              {resumes.isError && (
                <p role="alert">
                  {featureError(resumes.error, t)}{" "}
                  <button type="button" onClick={() => resumes.refetch()}>
                    {t("resumeApplications.retry")}
                  </button>
                </p>
              )}
              {showLibrary || resumes.data?.length === 0 ? (
                <ResumeLibrary
                  onSaved={(resume) => {
                    setSelected(String(resume.id));
                    setShowLibrary(false);
                  }}
                />
              ) : (
                <button type="button" onClick={() => setShowLibrary(true)}>
                  {t("resumeApplications.uploadAnother")}
                </button>
              )}
              <form
                className="resume-fields"
                onSubmit={(e) => {
                  e.preventDefault();
                  mutation.mutate();
                }}
              >
                <label htmlFor="application-resume">
                  {t("resumeApplications.chooseResume")}
                </label>
                <select
                  id="application-resume"
                  required
                  value={resumeId}
                  disabled={mutation.isPending}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  <option value="">
                    {t("resumeApplications.chooseResume")}
                  </option>
                  {(resumes.data || []).map((resume) => (
                    <option value={resume.id} key={resume.id}>
                      {resume.label}
                      {resume.isDefault
                        ? ` (${t("resumeApplications.default")})`
                        : ""}
                    </option>
                  ))}
                </select>
                <label htmlFor="application-note">
                  {t("resumeApplications.note")}
                </label>
                <textarea
                  id="application-note"
                  value={note}
                  rows={4}
                  maxLength={4000}
                  disabled={mutation.isPending}
                  onChange={(e) => setNote(e.target.value)}
                />
                <p>{t("resumeApplications.applyHelp")}</p>
                {mutation.isError && (
                  <p role="alert">{featureError(mutation.error, t)}</p>
                )}
                <button
                  type="submit"
                  disabled={
                    !validSelection || resumes.isError || mutation.isPending
                  }
                >
                  {t(
                    mutation.isPending
                      ? "resumeApplications.saving"
                      : "resumeApplications.submit",
                  )}
                </button>
              </form>
            </>
          )}
          <button type="button" disabled={mutation.isPending} onClick={onClose}>
            {t(
              success
                ? "resumeApplications.close"
                : "resumeApplications.cancel",
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ApplicationPanel({ project, currentUser, view }) {
  const { t } = useTranslation();
  const [applying, setApplying] = useState(false);
  const reviewer = view === "owner" || view === "admin";
  const endpoint =
    view === "owner"
      ? `/applications/projects/${project.id}`
      : view === "admin"
        ? `/applications/admin/projects/${project.id}`
        : `/applications/mine?projectId=${project.id}`;
  const applications = useQuery({
    queryKey: ["applications", currentUser.id, view, project.id],
    queryFn: () => makeRequest.get(endpoint).then((res) => res.data),
  });
  return (
    <section className="section resume-applications">
      <h2>
        {t(
          reviewer
            ? "resumeApplications.applications"
            : "resumeApplications.myApplication",
        )}
      </h2>
      {view === "admin" && (
        <p className="resume-meta">{t("resumeApplications.adminReview")}</p>
      )}
      {applications.isPending && (
        <p role="status">{t("resumeApplications.loading")}</p>
      )}
      {applications.isError && (
        <p role="alert">
          {featureError(applications.error, t)}{" "}
          <button type="button" onClick={() => applications.refetch()}>
            {t("resumeApplications.retry")}
          </button>
        </p>
      )}
      {!applications.isError &&
        (applications.data || []).map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            reviewer={reviewer}
            canResolve={view === "owner"}
          />
        ))}
      {!applications.isError &&
        applications.data?.length === 0 &&
        (reviewer ? (
          <p>{t("resumeApplications.noApplications")}</p>
        ) : project.status === "open" ? (
          <button type="button" onClick={() => setApplying(true)}>
            {t("resumeApplications.apply")}
          </button>
        ) : (
          <p>{t("resumeApplications.closed")}</p>
        ))}
      {view === "student" && (
        <p>
          <Link to="/applications">
            {t("resumeApplications.myApplications")}
          </Link>
        </p>
      )}
      {applying && (
        <ApplyDialog project={project} onClose={() => setApplying(false)} />
      )}
    </section>
  );
}

export default function ProjectApplications({ project }) {
  const { currentUser } = useContext(AuthContext);
  const owner =
    currentUser?.account_type === "local" &&
    Number(currentUser.id) === Number(project.userId);
  const admin = isAdmin(currentUser);
  if (
    !currentUser ||
    (!owner && !admin && currentUser.account_type !== "student")
  )
    return null;
  const view = owner ? "owner" : admin ? "admin" : "student";
  return (
    <ApplicationPanel
      key={`${currentUser.id}:${view}:${project.id}`}
      project={project}
      currentUser={currentUser}
      view={view}
    />
  );
}

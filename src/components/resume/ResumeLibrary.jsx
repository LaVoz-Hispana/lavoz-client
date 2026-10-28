import { useId, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { makeRequest } from "../../axios";
import { useResumes } from "../../hooks/useResumes";
import {
  downloadResume,
  featureError,
  invalidateApplications,
  resumeFileError,
  uploadResume,
} from "../../utils/resumes";
import "./resumeApplications.scss";

export default function ResumeLibrary({ onSaved, optional = false }) {
  const { t, i18n } = useTranslation();
  const id = useId();
  const client = useQueryClient();
  const resumes = useResumes();
  const input = useRef();
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState("");
  const [replacement, setReplacement] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [newLabel, setNewLabel] = useState("");
  const [fileError, setFileError] = useState(null);
  const [message, setMessage] = useState("");
  const mutation = useMutation({
    mutationFn: async ({ action, resume }) => {
      if (action === "upload")
        return uploadResume(file, label, replacement?.id);
      if (action === "download")
        return downloadResume(resume.id, resume.originalFileName);
      if (action === "delete")
        return makeRequest.delete(`/resumes/${resume.id}`);
      return makeRequest.put(
        `/resumes/${resume.id}`,
        action === "rename" ? { label: newLabel.trim() } : { isDefault: true },
      );
    },
    onSuccess: async (result, { action }) => {
      if (action !== "download") await invalidateApplications(client);
      if (action === "upload") {
        setFile(null);
        setLabel("");
        setReplacement(null);
        if (input.current) input.current.value = "";
        onSaved?.(result);
      }
      setRenaming(null);
      setMessage(action === "download" ? "" : t("resumeApplications.saved"));
    },
  });
  const act = (action, resume) => {
    setMessage("");
    mutation.mutate({ action, resume });
  };

  return (
    <section
      className="resume-applications resume-library"
      aria-labelledby={`${id}-title`}
    >
      <h2 id={`${id}-title`}>{t("resumeApplications.library")}</h2>
      <p>{t("resumeApplications.privateHelp")}</p>
      {optional && <p>{t("resumeApplications.optional")}</p>}
      {resumes.isPending && (
        <p role="status">{t("resumeApplications.loading")}</p>
      )}
      {resumes.isError && (
        <div role="alert">
          <p>{featureError(resumes.error, t)}</p>
          <button type="button" onClick={() => resumes.refetch()}>
            {t("resumeApplications.retry")}
          </button>
        </div>
      )}
      {resumes.data?.length === 0 && <p>{t("resumeApplications.noResumes")}</p>}
      <ul className="resume-list">
        {(resumes.data || []).map((resume) => (
          <li key={resume.id}>
            <div className="resume-heading">
              <strong>{resume.label}</strong>
              {!!resume.isDefault && (
                <span className="resume-badge">
                  {t("resumeApplications.default")}
                </span>
              )}
            </div>
            <p className="resume-meta">
              {resume.mimeType === "application/pdf" ? "PDF" : "DOCX"} ·{" "}
              {t("resumeApplications.uploaded")}{" "}
              {new Date(resume.createdAt).toLocaleDateString(i18n.language)}
            </p>
            {renaming === resume.id ? (
              <div className="resume-fields">
                <label htmlFor={`${id}-rename`}>
                  {t("resumeApplications.label")}
                </label>
                <input
                  id={`${id}-rename`}
                  value={newLabel}
                  maxLength={150}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
                <div className="resume-actions">
                  <button
                    type="button"
                    disabled={!newLabel.trim() || mutation.isPending}
                    onClick={() => act("rename", resume)}
                  >
                    {t("resumeApplications.save")}
                  </button>
                  <button type="button" onClick={() => setRenaming(null)}>
                    {t("resumeApplications.cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="resume-actions">
                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() => {
                    setRenaming(resume.id);
                    setNewLabel(resume.label);
                  }}
                >
                  {t("resumeApplications.rename")}
                </button>
                {!resume.isDefault && (
                  <button
                    type="button"
                    disabled={mutation.isPending}
                    onClick={() => act("default", resume)}
                  >
                    {t("resumeApplications.makeDefault")}
                  </button>
                )}
                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() => {
                    setReplacement(resume);
                    setLabel(resume.label);
                    setFile(null);
                    setFileError(null);
                    if (input.current) {
                      input.current.value = "";
                      input.current.focus();
                    }
                  }}
                >
                  {t("resumeApplications.replace")}
                </button>
                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() => act("download", resume)}
                >
                  {t("resumeApplications.download")}
                </button>
                <button
                  type="button"
                  disabled={mutation.isPending || !!resume.inUse}
                  onClick={() => {
                    if (
                      window.confirm(
                        t("resumeApplications.deleteConfirm", {
                          label: resume.label,
                        }),
                      )
                    )
                      act("delete", resume);
                  }}
                >
                  {t("resumeApplications.delete")}
                </button>
              </div>
            )}
            {!!resume.inUse && (
              <p className="resume-meta">{t("resumeApplications.inUse")}</p>
            )}
          </li>
        ))}
      </ul>
      <form
        className="resume-fields"
        onSubmit={(e) => {
          e.preventDefault();
          act("upload");
        }}
      >
        <h3>
          {replacement
            ? t("resumeApplications.replacing", { label: replacement.label })
            : t("resumeApplications.upload")}
        </h3>
        {replacement && <p>{t("resumeApplications.replaceHelp")}</p>}
        <label htmlFor={`${id}-label`}>{t("resumeApplications.label")}</label>
        <input
          id={`${id}-label`}
          value={label}
          maxLength={150}
          required
          onChange={(e) => setLabel(e.target.value)}
        />
        <label htmlFor={`${id}-file`}>{t("resumeApplications.file")}</label>
        <input
          ref={input}
          id={`${id}-file`}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          required
          aria-describedby={`${id}-types`}
          onChange={(e) => {
            const selected = e.target.files[0];
            setFile(selected);
            setFileError(resumeFileError(selected));
            mutation.reset();
            setMessage("");
            if (selected && !label)
              setLabel(selected.name.replace(/\.[^.]+$/, "").slice(0, 150));
          }}
        />
        <p id={`${id}-types`}>{t("resumeApplications.types")}</p>
        {fileError && (
          <p role="alert">{t(`resumeApplications.errors.${fileError}`)}</p>
        )}
        <div className="resume-actions">
          <button
            type="submit"
            disabled={
              !file || !!fileError || !label.trim() || mutation.isPending
            }
          >
            {t(
              mutation.isPending
                ? "resumeApplications.saving"
                : "resumeApplications.upload",
            )}
          </button>
          {replacement && (
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={() => {
                setReplacement(null);
                setLabel("");
              }}
            >
              {t("resumeApplications.cancel")}
            </button>
          )}
        </div>
      </form>
      {mutation.isError && (
        <p role="alert">{featureError(mutation.error, t)}</p>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}

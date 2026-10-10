import { makeRequest } from "../axios";

export const MAX_RESUME_BYTES = 10 * 1024 * 1024;
export function resumeFileError(file) {
  if (!file || !file.size) return "resume_file_required";
  if (file.size > MAX_RESUME_BYTES) return "resume_too_large";
  const types = { pdf: "application/pdf", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
  const extension = file.name.split(".").pop().toLowerCase();
  if (!types[extension] || file.type !== types[extension]) return "resume_invalid_type";
  return null;
}

export function featureError(error, t) {
  const code = error?.response?.data?.code || error?.code;
  const key = `resumeApplications.errors.${code}`;
  return t(key, { defaultValue: t("resumeApplications.errors.request_failed") });
}

export const invalidateApplications = (client) => Promise.all([
  "resumes", "applications", "project", "projects", "adminProjects", "notifications", "newNotifications", "escrows", "escrow", "adminEscrows",
].map((key) => client.invalidateQueries({ queryKey: [key] })));

export async function uploadResume(file, label, replaceId) {
  const code = resumeFileError(file);
  if (code) throw Object.assign(new Error(code), { code });
  const body = new FormData();
  body.append("file", file);
  body.append("label", label.trim());
  const response = replaceId
    ? await makeRequest.put(`/resumes/${replaceId}/file`, body)
    : await makeRequest.post("/resumes", body);
  return response.data;
}

export async function downloadResume(id, filename) {
  const response = await makeRequest.get(`/resumes/${id}/download`, { responseType: "blob" });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "resume";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

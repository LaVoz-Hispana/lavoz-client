import { useContext } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";
import { ApplicationCard } from "../../components/applications/ProjectApplications";
import { featureError } from "../../utils/resumes";

export default function MyApplications() {
  const { currentUser } = useContext(AuthContext);
  const { t } = useTranslation();
  const applications = useQuery({
    queryKey: ["applications", currentUser.id, "mine"],
    queryFn: () => makeRequest.get("/applications/mine").then((res) => res.data),
  });
  return <main className="resume-applications my-applications">
    <h1>{t("resumeApplications.myApplications")}</h1>
    <p><Link to="/projects">{t("projects.projects")}</Link></p>
    {applications.isPending && <p role="status">{t("resumeApplications.loading")}</p>}
    {applications.isError && <p role="alert">{featureError(applications.error, t)} <button type="button" onClick={() => applications.refetch()}>{t("resumeApplications.retry")}</button></p>}
    {!applications.isError && applications.data?.length === 0 && <p>{t("resumeApplications.noApplications")}</p>}
    {!applications.isError && (applications.data || []).map((application) => <section key={application.id}>
      <h2><Link to={`/projects/${application.projectId}`}>{application.projectTitle}</Link></h2>
      <ApplicationCard application={application} />
    </section>)}
  </main>;
}

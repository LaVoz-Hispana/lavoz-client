import "./projectDetail.scss";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useTranslation } from "react-i18next";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChecklistIcon from "@mui/icons-material/Checklist";
import ProjectPosts from "../../components/project/ProjectPosts";

const ProjectDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const { isLoading, error, data: project } = useQuery({
    queryKey: ["project", id],
    queryFn: () => makeRequest.get(`/projects/${id}`).then((res) => res.data),
  });

  const skills = project?.skills
    ? project.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  if (isLoading) return <div className="project-detail"><span className="state">Loading...</span></div>;
  if (error || !project) return <div className="project-detail"><span className="state">Project not found.</span></div>;

  return (
    <div className="project-detail">
      <div className="back-row">
        <Link to="/projects" style={{ textDecoration: "none", color: "inherit" }}>
          <ArrowBackIcon fontSize="small" />
          <span>{t("projects.back")}</span>
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <span className={`status-badge ${project.status}`}>
            {project.status === "open" ? t("projects.open")
              : project.status === "in_escrow" ? t("projects.inEscrow")
              : t("projects.closed")}
          </span>
          <h1>{project.title}</h1>
          <div className="posted-by">
            <img src={project.profilePic} alt="" />
            <span>{t("projects.postedBy")}: </span>
            <Link to={`/profile/${project.userId}`} style={{ textDecoration: "none" }}>
              {project.username}
            </Link>
          </div>
        </div>

        <div className="section">
          <p>{project.description}</p>
        </div>

        {skills.length > 0 && (
          <div className="section">
            <h3>{t("projects.skillsNeeded")}</h3>
            <div className="skills-list">
              {skills.map((skill, i) => (
                <span key={i} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {project.timeline && (
          <div className="section meta-row">
            <CalendarMonthIcon fontSize="small" />
            <div>
              <h3>{t("projects.timeline")}</h3>
              <span>{project.timeline}</span>
            </div>
          </div>
        )}

        {project.deliverables && (
          <div className="section meta-row">
            <ChecklistIcon fontSize="small" />
            <div>
              <h3>{t("projects.deliverables")}</h3>
              <p>{project.deliverables}</p>
            </div>
          </div>
        )}

      </div>

      <ProjectPosts projectId={id} />
    </div>
  );
};

export default ProjectDetail;

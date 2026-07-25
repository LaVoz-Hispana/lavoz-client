import "./home.scss";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { STATUS_COLORS } from "../../utils/escrowStatus";
import SubmitService from "../../components/service/SubmitService";
import SubmitProject from "../../components/project/SubmitProject";
import Post from "../../components/post/Post";
import ProjectCard from "../../components/project/ProjectCard";

/* ── Shared home (students and BCS locals) ── */
const SharedHome = ({ t, isGuest, role }) => {
  const { data: allPosts } = useQuery({
    queryKey: ["posts"],
    queryFn: () => makeRequest.get("/posts").then((r) => r.data),
  });

  const projectActivityPosts = allPosts?.filter((p) => p.projectId != null) ?? [];
  const { isLoading: projectsLoading, data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => makeRequest.get("/projects").then((r) => r.data),
  });
  const visibleProjects = projects?.filter((project) => project.status !== "closed") ?? [];

  return (
    <div className="home-content">
      {!isGuest && role === "local" && <SubmitProject />}
      {!isGuest && role === "student" && <SubmitService />}

      <section className="home-projects-section">
        <div className="home-card-header">
          <h2>{t("projects.bcsLocalProjects")}</h2>
          <Link to="/projects?tab=projects">{t("projects.viewAll")} →</Link>
        </div>
        {projectsLoading && <span className="home-projects-state">Loading...</span>}
        {!projectsLoading && visibleProjects.length === 0 && (
          <span className="home-projects-state">{t("projects.noProjects")}</span>
        )}
        <div className="home-projects-feed">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      {!isGuest && projectActivityPosts.length > 0 && (
        <div className="activity-feed-section">
          {projectActivityPosts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Admin home ── */
const AdminHome = ({ t }) => {
  const { data: users } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => makeRequest.get("/users/").then((r) => r.data),
  });

  const { data: escrows } = useQuery({
    queryKey: ["adminEscrows"],
    queryFn: () => makeRequest.get("/escrows").then((r) => r.data),
  });

  const stats = [
    { label: "Total Users",     value: users?.length ?? "—",                                         to: "/admin" },
    { label: "Active Escrows",  value: escrows?.filter((e) => e.status === "active").length ?? "—",  to: "/admin" },
    { label: "Pending Matches", value: escrows?.filter((e) => e.status === "pending").length ?? "—", to: "/admin" },
    { label: "Completed",       value: escrows?.filter((e) => e.status === "completed").length ?? "—",to: "/admin" },
  ];

  const recentEscrows = escrows?.slice(0, 5) ?? [];

  return (
    <div className="home-content">
      <div className="stat-grid">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="stat-card">
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </Link>
        ))}
      </div>

      <div className="home-card">
        <div className="home-card-header">
          <h3>Recent Escrows</h3>
          <Link to="/admin">Admin Dashboard →</Link>
        </div>
        <div className="escrow-list">
          {recentEscrows.map((e) => (
            <Link key={e.id} to={`/escrows/${e.id}`} className="escrow-row">
              <span className="escrow-title">{e.projectTitle}</span>
              <span className="escrow-by">{e.studentUsername} ↔ {e.localUsername}</span>
              <span className="escrow-status" style={{ backgroundColor: STATUS_COLORS[e.status] }}>
                {t(`escrow.${e.status}`)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Root ── */
const Home = () => {
  const { t } = useTranslation();
  const { currentUser } = useContext(AuthContext);

  const role = currentUser?.account_type;
  const isGuest = !currentUser;

  return (
    <div className="home">
      <div className="home-hero">
        <h1>Poststation</h1>
        <p>Brazos Valley Student–Local Marketplace</p>
      </div>

      {(isGuest || role === "student" || role === "local") && <SharedHome t={t} isGuest={isGuest} role={role} />}
      {role === "admin" && <AdminHome t={t} />}
    </div>
  );
};

export default Home;

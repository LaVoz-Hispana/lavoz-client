import "./browseProjects.scss";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import ProjectCard from "../../components/project/ProjectCard";
import SubmitProject from "../../components/project/SubmitProject";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import RatingBadge from "../../components/review/RatingBadge";

const STATUS_ORDER = ["open", "in_escrow", "closed"];

const BrowseProjects = () => {
  const { t } = useTranslation();
  const { currentUser } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") === "projects" ? "projects" : "locals");
  const [statusFilter, setStatusFilter] = useState("open");

  useEffect(() => {
    setTab(searchParams.get("tab") === "projects" ? "projects" : "locals");
  }, [searchParams]);

  const { isLoading: projectsLoading, error: projectsError, data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => makeRequest.get("/projects").then((res) => res.data),
  });

  const { isLoading: usersLoading, error: usersError, data: usersData } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => makeRequest.get("/users/").then((res) => res.data),
  });

  const allProjects = projectsData
    ? [...projectsData].sort(
        (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
      )
    : [];

  const visibleProjects = statusFilter === "all"
    ? allProjects
    : allProjects.filter((p) => p.status === statusFilter);

  const locals = usersData ? usersData.filter((u) => u.account_type === "local") : [];

  return (
    <div className="browse-projects">
      <div className="header">
        <h1>{t("projects.browse")}</h1>
      </div>

      <div className="content">
        <div className="tabs">
          <button
            className={tab === "locals" ? "tab selected" : "tab"}
            onClick={() => setTab("locals")}
          >
            {t("projects.locals")}
          </button>
          <button
            className={tab === "projects" ? "tab selected" : "tab"}
            onClick={() => setTab("projects")}
          >
            {t("projects.projects")}
          </button>
        </div>

        {tab === "locals" && (
          <>
            {usersLoading && <span className="state">Loading...</span>}
            {usersError && <span className="state">Failed to load locals.</span>}
            {!usersLoading && locals.length === 0 && (
              <span className="state">{t("projects.noLocals")}</span>
            )}
            <div className="local-grid">
              {locals.map((user) => (
                <Link
                  key={user.id}
                  to={`/profile/${user.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="local-card">
                    <img className="profilePic" src={user.profilePic} alt="" />
                    <span className="name">{user.username} <RatingBadge rating={user.averageRating} reviewCount={user.reviewCount} /></span>
                    {user.city && <span className="subtitle">{user.city}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {tab === "projects" && (
          <>
            {currentUser?.account_type === "local" && (
              <div className="submit-section">
                <SubmitProject />
              </div>
            )}

            <div className="status-filters">
              {["all", "open", "in_escrow", "closed"].map((s) => (
                <button
                  key={s}
                  className={`status-filter-btn${statusFilter === s ? " active" : ""} ${s}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s === "all" ? "All" : s === "in_escrow" ? "In Escrow" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            <div className="feed">
              {projectsLoading && <span className="state">Loading...</span>}
              {projectsError && <span className="state">Failed to load projects.</span>}
              {!projectsLoading && !projectsError && visibleProjects.length === 0 && (
                <span className="state">{t("projects.noProjects")}</span>
              )}
              {!projectsLoading && visibleProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BrowseProjects;

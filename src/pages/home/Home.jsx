import "./home.scss";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import Post from "../../components/post/Post";
import ProjectCard from "../../components/project/ProjectCard";
import HomePostActions from "../../components/home/HomePostActions";
import SponsorCarousel from "../../components/home/SponsorCarousel";

/* ── Shared home (students and BCS locals) ── */
const SharedHome = ({ t, isGuest, role, currentUser }) => {
  const { i18n } = useTranslation();
  const { data: allPosts } = useQuery({
    queryKey: ["posts"],
    queryFn: () => makeRequest.get("/posts").then((r) => r.data),
  });

  const homePosts = allPosts ?? [];
  const { isLoading: projectsLoading, data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => makeRequest.get("/projects").then((r) => r.data),
  });
  const { data: sponsorSection } = useQuery({
    queryKey: ["sponsor-section"],
    queryFn: () => makeRequest.get("/sponsors/section").then((r) => r.data),
  });
  const visibleProjects = projects?.filter((project) => project.status !== "closed") ?? [];
  const sponsorSupportCopy =
    i18n.language?.startsWith("es")
      ? sponsorSection?.contentEs || sponsorSection?.contentEn || t("home.sponsorSupport")
      : sponsorSection?.contentEn || sponsorSection?.contentEs || t("home.sponsorSupport");

  return (
    <div className="home-content">
      {!isGuest && <HomePostActions role={role} currentUser={currentUser} />}

      {homePosts.length > 0 && (
        <div className="activity-feed-section">
          {homePosts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      )}

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

      <section className="home-sponsors" aria-labelledby="sponsor-heading">
        <p id="sponsor-heading">{sponsorSupportCopy}</p>
        <SponsorCarousel />
      </section>
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

      <SharedHome t={t} isGuest={isGuest} role={role} currentUser={currentUser} />
    </div>
  );
};

export default Home;

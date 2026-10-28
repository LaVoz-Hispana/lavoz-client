import "./profile.scss";
import FacebookTwoToneIcon from "@mui/icons-material/FacebookTwoTone";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import PlaceIcon from "@mui/icons-material/Place";
import LanguageIcon from "@mui/icons-material/Language";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import Posts from "../../components/posts/Posts";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import { useContext, useState } from "react";
import Update from "../../components/update/Update";
import SubmitService from "../../components/service/SubmitService";
import ResumeLibrary from "../resume/ResumeLibrary";
import ServiceCard from "../../components/service/ServiceCard";
import ProjectCard from "../../components/project/ProjectCard";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import { useTranslation } from "react-i18next";
import { isAdmin } from "../../utils/admin";
import { Link } from "react-router-dom";
import ProviderBadge from "../provider/ProviderBadge";

const StarRating = ({ rating }) => {
  const { t } = useTranslation();
  const value = Number(rating);
  return (
    <div
      className="review-stars"
      aria-label={t("reviews.outOfFive", { rating: value })}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={
            value >= star ? "full" : value >= star - 0.5 ? "half" : "empty"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
};

const OwnProfile = ({ userId }) => {
  const { t } = useTranslation();
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openService, setOpenService] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const { currentUser } = useContext(AuthContext);

  const { isLoading, error, data } = useQuery({
    queryKey: ["user", currentUser?.id || "anonymous", userId],
    queryFn: () =>
      makeRequest.get("/users/find/" + userId).then((res) => {
        return res.data;
      }),
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services", "profile", currentUser?.id || "anonymous", userId],
    queryFn: () =>
      makeRequest.get("/services?userId=" + userId).then((res) => res.data),
    enabled: data?.account_type === "student",
  });
  const { data: openProjects = [] } = useQuery({
    queryKey: ["projects", "profile", userId],
    queryFn: () => makeRequest.get("/projects").then((res) => res.data),
    enabled: data?.account_type === "local",
    select: (projects) =>
      projects.filter(
        (project) => project.userId === userId && project.status === "open",
      ),
  });
  const { data: completedProjects = [], isLoading: completedLoading } =
    useQuery({
      queryKey: ["completed-projects", currentUser?.id || "anonymous", userId],
      queryFn: () =>
        makeRequest
          .get("/reviews/completed-projects/" + userId)
          .then((res) => res.data),
      enabled: !!data,
    });
  const { data: reviewSummary } = useQuery({
    queryKey: ["review-summary", currentUser?.id || "anonymous", userId],
    queryFn: () =>
      makeRequest.get("/reviews/users/" + userId).then((res) => res.data),
    enabled: !!data,
  });
  const profileTabs =
    data?.account_type === "student"
      ? [
          { id: "services", label: t("talent.services") },
          { id: "resumes", label: t("resumeApplications.library") },
          { id: "posts", label: t("profileContent.posts") },
          { id: "completed", label: t("profileContent.completed") },
        ]
      : data?.account_type === "local"
        ? [
            { id: "open", label: t("profileContent.open") },
            { id: "posts", label: t("profileContent.posts") },
            { id: "completed", label: t("profileContent.completed") },
          ]
        : [{ id: "posts", label: t("profileContent.posts") }];
  const selectedTab =
    activeTab && profileTabs.some((tab) => tab.id === activeTab)
      ? activeTab
      : profileTabs[0]?.id;
  if (isLoading)
    return <div className="profile-state">{t("privacy.loadingProfile")}</div>;
  if (error?.response?.status === 401)
    return (
      <div className="profile-state">
        <Link to="/login">{t("privacy.signInToView")}</Link>
      </div>
    );
  if (error?.response?.status === 403 || error?.response?.status === 404)
    return (
      <div className="profile-state" role="alert">
        {t("privacy.privateProfile")}
      </div>
    );
  if (error || !data || userId === undefined)
    return (
      <div className="profile-state" role="alert">
        {t("privacy.profileUnavailable")}
      </div>
    );

  return (
    <div className="profile">
      <div>
        <div className="images">
          <img src={data.coverPic} alt="" className="cover" />
          <img src={data.profilePic} alt="" className="profilePic" />
        </div>
        <div className="profileContainer">
          <div className="uInfo">
            <div className="center">
              <div className="name">
                <span>{data.providerDisplayName || data.username}</span>
                <span className="station"> Station</span>
              </div>
              {isAdmin(data) && <div className="business-type">Admin</div>}
              {data.account_type === "local" && (
                <ProviderBadge
                  providerType={data.provider_type}
                  label={data.providerTypeLabel}
                />
              )}
              {data.account_type === "local" &&
                Number(currentUser?.id) === Number(data.id) &&
                !data.providerProfileComplete && (
                  <div className="profile-state" role="status">
                    {t("provider.requiredSetup")}
                  </div>
                )}
              {data.account_type === "local" &&
                data.provider_type !== "individual" &&
                data.contact_person_name && (
                  <div className="business-type">
                    {t("provider.contactLabel", {
                      name: data.contact_person_name,
                    })}
                  </div>
                )}
              {data.account_type === "student" &&
                (data.university || data.major) && (
                  <div className="business-type">
                    {[data.university, data.major, data.grad_year]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                )}
              <div className="bio">{data.bio}</div>
              {Number(reviewSummary?.reviewCount) > 0 && (
                <div
                  className="rating-summary"
                  aria-label={t("reviews.outOfFive", {
                    rating: reviewSummary.averageRating,
                  })}
                >
                  <span className="stars">★</span>
                  <strong>{reviewSummary.averageRating}</strong>
                  <span>
                    ({reviewSummary.reviewCount}{" "}
                    {t("profileContent.reviewCount", {
                      count: Number(reviewSummary.reviewCount),
                    })}
                    )
                  </span>
                </div>
              )}
              <div className="left">
                {data.facebook != null && (
                  <a
                    href={data.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FacebookTwoToneIcon fontSize="medium" />
                  </a>
                )}
                {data.instagram != null && (
                  <a
                    href={data.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <InstagramIcon fontSize="medium" />
                  </a>
                )}
                {data.twitter != null && (
                  <a
                    href={data.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <TwitterIcon fontSize="medium" />
                  </a>
                )}
              </div>
              <div className="info">
                {data.city && (
                  <div className="item">
                    <PlaceIcon />
                    <span>{data.city}</span>
                  </div>
                )}
                {data.website && (
                  <div className="item">
                    <a
                      href={data.website}
                      color={"grey"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <InsertLinkIcon fontSize="medium" />
                      <span>{data.website}</span>
                    </a>
                  </div>
                )}
                {data.language && (
                  <div className="item">
                    <LanguageIcon />
                    <span>{data.language}</span>
                  </div>
                )}
                {data.email && (
                  <div className="item">
                    <a href={`mailto:${data.email}`}>
                      <EmailIcon fontSize="medium" />
                      <span>{data.email}</span>
                    </a>
                  </div>
                )}
                {data.phone && (
                  <div className="item">
                    <a href={`tel:${data.phone}`}>
                      <PhoneIcon fontSize="medium" />
                      <span>{data.phone}</span>
                    </a>
                  </div>
                )}
              </div>
              {data.account_type === "student" && data.skills && (
                <div className="skills-categories-list">
                  <div className="service-categories-label">
                    {t("update.skills")}
                  </div>
                  <div className="skills-list">
                    {data.skills
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((skill, i) => (
                        <div key={i} className="skill-tag">
                          {skill}
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {data.account_type === "student" &&
                data.serviceCategories?.length > 0 && (
                  <div className="service-categories-list">
                    <div className="service-categories-label">
                      {t("register.services")}
                    </div>
                    <div className="skills-list">
                      {data.serviceCategories.map((category) => (
                        <div key={category.id} className="service-tag">
                          {category.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              {currentUser && Number(userId) === Number(currentUser.id) ? (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <button onClick={() => setOpenUpdate(true)}>
                    {t("update.update")}
                  </button>
                  {currentUser.account_type === "student" && (
                    <button onClick={() => setOpenService(true)}>
                      {t("talent.postService")}
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </div>
          <section className="profile-tabs-section">
            <div
              className="profile-tabs"
              role="tablist"
              aria-label={t("profileContent.title")}
            >
              {profileTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedTab === tab.id}
                  className={selectedTab === tab.id ? "active" : ""}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {selectedTab === "resumes" && <ResumeLibrary />}
            {selectedTab === "posts" && <Posts userId={userId} />}
            {selectedTab === "services" && (
              <div className="profile-card-grid">
                {services.length ? (
                  services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))
                ) : (
                  <p className="profile-empty">{t("talent.noServices")}</p>
                )}
              </div>
            )}
            {selectedTab === "open" && (
              <div className="profile-card-grid">
                {openProjects.length ? (
                  openProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))
                ) : (
                  <p className="profile-empty">{t("projects.noProjects")}</p>
                )}
              </div>
            )}
            {selectedTab === "completed" && (
              <div className="completed-projects">
                {completedLoading ? (
                  <p className="profile-empty">{t("projects.loading")}</p>
                ) : completedProjects.length === 0 ? (
                  <p className="profile-empty">
                    {t("profileContent.noCompleted")}
                  </p>
                ) : (
                  completedProjects.map((project) => (
                    <article
                      className="completed-project-card"
                      key={project.escrowId}
                    >
                      <div>
                        <h3>{project.projectTitle}</h3>
                        <p>{project.projectDescription}</p>
                        <p>
                          {t("profileContent.completedWith", {
                            name: project.counterpartName,
                          })}{" "}
                          <ProviderBadge
                            label={project.counterpartProviderTypeLabel}
                          />
                        </p>
                      </div>
                      <div className="project-review-panel">
                        {project.authoredReviewId && (
                          <div className="submitted-review">
                            <StarRating rating={project.authoredRating} />
                            {project.authoredCommentary && (
                              <p>{project.authoredCommentary}</p>
                            )}
                            <small>
                              {t("reviews.with", {
                                name: project.counterpartName,
                              })}
                            </small>
                          </div>
                        )}
                        <Link to={`/escrows/${project.escrowId}`}>
                          {t("profileContent.reviewInEscrow")}
                        </Link>
                        {project.receivedReviewId && (
                          <div className="submitted-review">
                            <StarRating rating={project.receivedRating} />
                            {project.receivedCommentary && (
                              <p>{project.receivedCommentary}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}
          </section>
        </div>
      </div>
      {openUpdate && (
        <Update setOpenUpdate={setOpenUpdate} user={data} first={false} />
      )}
      {openService && <SubmitService onClose={() => setOpenService(false)} />}
    </div>
  );
};

// Guard before mounting queries so another account's cached profile never renders.
const Profile = ({ userId }) => {
  const { currentUser } = useContext(AuthContext);
  const { t } = useTranslation();
  if (!currentUser)
    return (
      <div className="profile-state">
        <Link to="/login">{t("privacy.signInToView")}</Link>
      </div>
    );
  if (
    !Number.isSafeInteger(Number(userId)) ||
    Number(userId) <= 0 ||
    Number(currentUser.id) !== Number(userId)
  ) {
    return (
      <div className="profile-state" role="alert">
        {t("privacy.ownProfileOnly")}
      </div>
    );
  }
  return (
    <OwnProfile key={`${currentUser.id}:${userId}`} userId={Number(userId)} />
  );
};

export default Profile;

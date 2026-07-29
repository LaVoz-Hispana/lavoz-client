import "./profile.scss";
import FacebookTwoToneIcon from "@mui/icons-material/FacebookTwoTone";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import PlaceIcon from "@mui/icons-material/Place";
import LanguageIcon from "@mui/icons-material/Language";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import Posts from "../../components/posts/Posts"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import { useContext, useState } from "react";
import Update from "../../components/update/Update"
import SubmitService from "../../components/service/SubmitService";
import InviteStudent from "../../components/escrow/InviteStudent";
import ServiceCard from "../../components/service/ServiceCard";
import ProjectCard from "../../components/project/ProjectCard";
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const StarRating = ({ rating }) => {
  const value = Number(rating);
  return <div className="review-stars" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <span key={star} className={value >= star ? "full" : value >= star - 0.5 ? "half" : "empty"}>★</span>
    ))}
  </div>;
};

const Profile = ({userId}) => {

  const { t } = useTranslation();
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openService, setOpenService] = useState(false);
  const [openInvite, setOpenInvite] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [editingReviewId, setEditingReviewId] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => makeRequest.get("/users/find/" + userId).then((res) => {return res.data})
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services", "profile", userId],
    queryFn: () => makeRequest.get("/services?userId=" + userId).then((res) => res.data),
    enabled: data?.account_type === "student",
  });
  const { data: openProjects = [] } = useQuery({
    queryKey: ["projects", "profile", userId],
    queryFn: () => makeRequest.get("/projects").then((res) => res.data),
    enabled: data?.account_type === "local",
    select: (projects) => projects.filter((project) => project.userId === userId && project.status === "open"),
  });
  const { data: completedProjects = [], isLoading: completedLoading } = useQuery({
    queryKey: ["completed-projects", userId],
    queryFn: () => makeRequest.get("/reviews/completed-projects/" + userId).then((res) => res.data),
    enabled: !!data,
  });
  const { data: reviewSummary } = useQuery({
    queryKey: ["review-summary", userId],
    queryFn: () => makeRequest.get("/reviews/users/" + userId).then((res) => res.data),
    enabled: !!data,
  });
  const refreshReviewData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["completed-projects", userId] }),
      queryClient.invalidateQueries({ queryKey: ["review-summary", userId] }),
    ]);
    // The summary is visible in this profile's bio, so refresh it immediately
    // after a review changes instead of waiting for a later cache refetch.
    await queryClient.refetchQueries({ queryKey: ["review-summary", userId], type: "active" });
  };
  const submitReview = useMutation({
    mutationFn: ({ escrowId, draft }) => makeRequest.post("/reviews/escrows/" + escrowId, draft),
    onSuccess: refreshReviewData,
  });
  const updateReview = useMutation({
    mutationFn: ({ reviewId, draft }) => makeRequest.put("/reviews/" + reviewId, draft),
    onSuccess: async () => {
      setEditingReviewId(null);
      await refreshReviewData();
    },
  });
  const profileTabs = data?.account_type === "student"
    ? [{ id: "services", label: "Services" }, { id: "posts", label: "Posts" }, { id: "completed", label: "Completed Projects" }]
    : data?.account_type === "local"
      ? [{ id: "open", label: "Open Projects" }, { id: "posts", label: "Posts" }, { id: "completed", label: "Previous Projects" }]
      : [{ id: "posts", label: "Posts" }];
  const selectedTab = activeTab && profileTabs.some((tab) => tab.id === activeTab) ? activeTab : profileTabs[0]?.id;
  const updateReviewDraft = (escrowId, field, value) => setReviewDrafts((drafts) => ({
    ...drafts,
    [escrowId]: { rating: 5, commentary: "", ...drafts[escrowId], [field]: value },
  }));
  const renderReviewEditor = (project, draft, onSubmit, isSaving, mutationError, submitLabel) => (
    <form className="review-form" onSubmit={onSubmit}>
      <div className="rating-picker" role="group" aria-label="Your rating">
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button key={rating} type="button" className={draft.rating >= rating ? "full" : draft.rating >= rating - 0.5 ? "half" : "empty"}
              onClick={(event) => {
                const bounds = event.currentTarget.getBoundingClientRect();
                updateReviewDraft(project.escrowId, "rating", event.clientX - bounds.left <= bounds.width / 2 ? rating - 0.5 : rating);
              }}
              aria-label={`Set rating to ${rating - 0.5} or ${rating} stars`} aria-pressed={draft.rating === rating || draft.rating === rating - 0.5}>★</button>
          ))}
        </div>
      </div>
      <textarea value={draft.commentary} onChange={(event) => updateReviewDraft(project.escrowId, "commentary", event.target.value)} maxLength="2000" placeholder="Share your experience (optional)" />
      {mutationError && <span className="review-error">{mutationError.response?.data?.error || "Unable to save review."}</span>}
      <div className="review-actions"><button type="submit" disabled={isSaving}>{submitLabel}</button>{submitLabel === "Save changes" && <button type="button" className="cancel-review" onClick={() => setEditingReviewId(null)}>Cancel</button>}</div>
    </form>
  );
  
  return (
    <div className="profile">
      {isLoading || !data || error || userId === undefined ? "loading" :
        <div>
          <div className="images">
            <img
              src={data.coverPic}
              alt=""
              className="cover"
            />
            <img
              src={data.profilePic}
              alt=""
              className="profilePic"
            />
          </div>
          <div className="profileContainer">
            <div className="uInfo">             
              <div className="center">
                <div className="name">
                  <span>{data.username}</span>
                  <span className="station"> Station</span>
                </div>
                {data.account_type === 'admin' &&
                  <div className="business-type">Admin</div>
                }
                {data.account_type === 'local' && data.org_name &&
                  <div className="business-type">
                    {data.org_name}{data.org_type ? ` · ${data.org_type}` : ''}
                  </div>
                }
                {data.account_type === 'student' && (data.university || data.major) &&
                  <div className="business-type">
                    {[data.university, data.major, data.grad_year].filter(Boolean).join(' · ')}
                  </div>
                }
                <div className="bio"> 
                  {data.bio}
                </div>
                {Number(reviewSummary?.reviewCount) > 0 && (
                  <div className="rating-summary" aria-label={`${reviewSummary.averageRating} out of 5 from ${reviewSummary.reviewCount} reviews`}>
                    <span className="stars">★</span><strong>{reviewSummary.averageRating}</strong>
                    <span>({reviewSummary.reviewCount} {Number(reviewSummary.reviewCount) === 1 ? "review" : "reviews"})</span>
                  </div>
                )}
                <div className="left">
                  {data.facebook != null && 
                    <a href={data.facebook} target="_blank" rel="noopener noreferrer">
                        <FacebookTwoToneIcon fontSize="medium" />
                    </a>
                  }
                  {data.instagram != null && 
                    <a href={data.instagram} target="_blank" rel="noopener noreferrer">
                        <InstagramIcon fontSize="medium" />
                    </a>
                  }
                  {data.twitter != null && 
                    <a href={data.twitter} target="_blank" rel="noopener noreferrer">
                        <TwitterIcon fontSize="medium" />
                    </a>
                  }
                </div>
                <div className="info">
                  {data.city &&
                  <div className="item">
                    <PlaceIcon />
                    <span>{data.city}</span>
                  </div>
                  }
                  {data.website &&
                  <div className="item">
                    <a href={data.website} color={"grey"} target="_blank" rel="noopener noreferrer">
                      <InsertLinkIcon fontSize="medium" />
                      <span>{data.website}</span>
                    </a>
                  </div>}
                  {data.language &&
                  <div className="item">
                    <LanguageIcon />
                    <span>{data.language}</span>
                  </div>
                  }
                  {data.email &&
                  <div className="item">
                    <a href={`mailto:${data.email}`}>
                      <EmailIcon fontSize="medium" />
                      <span>{data.email}</span>
                    </a>
                  </div>
                  }
                  {data.phone &&
                  <div className="item">
                    <a href={`tel:${data.phone}`}>
                      <PhoneIcon fontSize="medium" />
                      <span>{data.phone}</span>
                    </a>
                  </div>
                  }
                </div>
                {data.account_type === 'student' && data.skills &&
                  <div className="skills-categories-list">
                     <div className="service-categories-label">{t('update.skills')}</div>
                    <div className="skills-list">
                      {data.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => (
                        <div key={i} className="skill-tag">{skill}</div>
                      ))}
                    </div>
                  </div>
                }
                {data.account_type === 'student' && data.serviceCategories?.length > 0 &&
                  <div className="service-categories-list">
                    <div className="service-categories-label">{t('register.services')}</div>
                    <div className="skills-list">
                      {data.serviceCategories.map((category) => (
                        <div key={category.id} className="service-tag">{category.name}</div>
                      ))}
                    </div>
                  </div>
                }
                {currentUser && userId === currentUser.id ? (
                  <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={() => setOpenUpdate(true)}>{t('update.update')}</button>
                    {currentUser.account_type === 'student' && (
                      <button onClick={() => setOpenService(true)}>{t('talent.postService')}</button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                    {currentUser?.account_type === 'local' && data.account_type === 'student' && (
                      <button onClick={() => setOpenInvite(true)}>
                        {t('escrow.invite')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <section className="profile-tabs-section">
              <div className="profile-tabs" role="tablist" aria-label="Profile content">
                {profileTabs.map((tab) => (
                  <button key={tab.id} type="button" role="tab" aria-selected={selectedTab === tab.id}
                    className={selectedTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
                ))}
              </div>
              {selectedTab === "posts" && <Posts userId={userId}/>}
              {selectedTab === "services" && <div className="profile-card-grid">
                {services.length ? services.map((service) => <ServiceCard key={service.id} service={service} />) : <p className="profile-empty">No services published yet.</p>}
              </div>}
              {selectedTab === "open" && <div className="profile-card-grid">
                {openProjects.length ? openProjects.map((project) => <ProjectCard key={project.id} project={project} />) : <p className="profile-empty">No open projects.</p>}
              </div>}
              {selectedTab === "completed" && <div className="completed-projects">
                {completedLoading ? <p className="profile-empty">Loading projects…</p> : completedProjects.length === 0 ? <p className="profile-empty">No completed projects yet.</p> : completedProjects.map((project) => {
                  const draft = { rating: 5, commentary: "", ...reviewDrafts[project.escrowId] };
                  return <article className="completed-project-card" key={project.escrowId}>
                    <div>
                      <h3>{project.projectTitle}</h3><p>{project.projectDescription}</p>
                      <Link className="completed-project-partner" to={`/profile/${project.counterpartId}`}>
                        <img src={project.counterpartProfilePic} alt="" /><span>Completed with {project.counterpartName}</span>
                      </Link>
                    </div>
                    <div className="project-review-panel">
                      {project.authoredReviewId && editingReviewId !== project.authoredReviewId && <div className="submitted-review">
                        <StarRating rating={project.authoredRating} />
                        {project.authoredCommentary && <p>{project.authoredCommentary}</p>}
                        <div className="review-actions"><small>Your review of {project.counterpartName}</small>{project.canEditAuthoredReview && <button type="button" className="edit-review" onClick={() => {
                          setEditingReviewId(project.authoredReviewId);
                          setReviewDrafts((drafts) => ({ ...drafts, [project.escrowId]: { rating: Number(project.authoredRating), commentary: project.authoredCommentary || "" } }));
                        }}>Edit review</button>}</div>
                      </div>}
                      {project.canEditAuthoredReview && project.authoredReviewId && editingReviewId === project.authoredReviewId && renderReviewEditor(project, draft, (event) => {
                        event.preventDefault(); updateReview.mutate({ reviewId: project.authoredReviewId, draft });
                      }, updateReview.isPending, updateReview.isError ? updateReview.error : null, "Save changes")}
                      {!project.authoredReviewId && project.canReview && renderReviewEditor(project, draft, (event) => {
                        event.preventDefault(); submitReview.mutate({ escrowId: project.escrowId, draft });
                      }, submitReview.isPending, submitReview.isError ? submitReview.error : null, "Leave review")}
                      {project.receivedReviewId && Number(project.receivedReviewId) !== Number(project.authoredReviewId) && <div className="submitted-review">
                        <StarRating rating={project.receivedRating} />
                        {project.receivedCommentary && <p>{project.receivedCommentary}</p>}
                        <div className="review-actions"><small>Review from {project.counterpartName}</small></div>
                      </div>}
                    </div>
                  </article>;
                })}
              </div>}
            </section>
          </div>
        </div>
      }
      {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={data} first={false}/>}
      {openService && <SubmitService onClose={() => setOpenService(false)} />}
      {openInvite && data && (
        <InviteStudent
          studentId={data.id}
          studentUsername={data.username}
          onClose={() => setOpenInvite(false)}
        />
      )}
    </div>
  );
};

export default Profile;

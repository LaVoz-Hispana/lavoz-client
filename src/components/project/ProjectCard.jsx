import "./projectCard.scss";
import { Link } from "react-router-dom";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import SubmitProject from "./SubmitProject";
import RatingBadge from "../review/RatingBadge";

const ProjectCard = ({ project }) => {
  const { t } = useTranslation();
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const skills = project.skills
    ? project.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const closeMutation = useMutation({
    mutationFn: () => makeRequest.put(`/projects/${project.id}/close`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => makeRequest.delete(`/projects/${project.id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const isOwner = currentUser && currentUser.id === project.userId;

  return (
    <div className="project-card">
      <div className="card-top">
        {project.categoryName && (
          <span className={`category-badge ${project.status}`}>{project.categoryName}</span>
        )}
        <h3>{project.title}</h3>
        <div className="posted-by">
          <img src={project.profilePic} alt="" />
          <Link to={`/profile/${project.userId}`} style={{ textDecoration: "none", color: "inherit" }}>
            {project.username} <RatingBadge rating={project.averageRating} reviewCount={project.reviewCount} />
          </Link>
        </div>
      </div>

      <div className="card-body">
        <p className="description">{project.description}</p>

        {skills.length > 0 && (
          <div className="skills-list">
            <span className="skills-label">{t("projects.skillsNeeded")}:</span>
            {skills.map((skill, i) => (
              <span key={i} className="skill-tag">{skill}</span>
            ))}
          </div>
        )}

        {project.timeline && (
          <div className="meta-row">
            <CalendarMonthIcon fontSize="small" />
            <span>{project.timeline}</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <Link to={`/projects/${project.id}`}>
          <button className="details-btn">{t("projects.viewDetails")}</button>
        </Link>
        {isOwner && (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            {t("projects.edit")}
          </button>
        )}
        {isOwner && project.status === "open" && (
          <button
            className="close-btn"
            onClick={() => closeMutation.mutate()}
            disabled={closeMutation.isPending}
          >
            {t("projects.closeProject")}
          </button>
        )}
        {isOwner && project.status === "open" && (
          <button
            className="delete-btn"
            onClick={() => {
              if (window.confirm(t("projects.deleteConfirm"))) deleteMutation.mutate();
            }}
            disabled={deleteMutation.isPending}
          >
            {t("projects.deleteProject")}
          </button>
        )}
      </div>
      {isEditing && (
        <div className="project-edit-modal" role="dialog" aria-modal="true" aria-label={t("projects.edit")}>
          <div className="project-edit-modal-backdrop" onClick={() => setIsEditing(false)} />
          <div className="project-edit-modal-content">
            <button
              type="button"
              className="project-edit-modal-close"
              onClick={() => setIsEditing(false)}
              aria-label={t("projects.closeEdit")}
            >
              <CloseIcon />
            </button>
            <SubmitProject project={project} onClose={() => setIsEditing(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;

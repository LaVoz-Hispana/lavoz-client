import "./serviceCard.scss";
import { Link } from "react-router-dom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useTranslation } from "react-i18next";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import SubmitService from "./SubmitService";
import RatingBadge from "../review/RatingBadge";

const ServiceCard = ({ service }) => {
  const { t } = useTranslation();
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => makeRequest.delete(`/services/${service.id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] }),
  });

  const isOwner = currentUser && currentUser.id === service.userId;

  const skills = service.skills
    ? service.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="service-card">
      <div className="card-top">
        <h3>{service.title}</h3>
        {service.categoryName && (
          <span className="category-badge">{service.categoryName}</span>
        )}
        <div className="posted-by">
          <img src={service.profilePic} alt="" />
          <Link to={`/profile/${service.userId}`} style={{ textDecoration: "none", color: "inherit" }}>
            {service.username} <RatingBadge rating={service.averageRating} reviewCount={service.reviewCount} />
          </Link>
          {service.university && (
            <span className="university">· {service.university}</span>
          )}
        </div>
      </div>

      <div className="card-body">
        <p className="description">{service.description}</p>

        {skills.length > 0 && (
          <div className="skills-list">
            {skills.map((skill, i) => (
              <span key={i} className="skill-tag">{skill}</span>
            ))}
          </div>
        )}

        {service.availability && (
          <div className="meta-row">
            <AccessTimeIcon fontSize="small" />
            <span>{service.availability}</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <Link to={`/profile/${service.userId}`}>
          <button>{t("talent.viewProfile")}</button>
        </Link>
        {isOwner && (
          <>
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              {t("talent.editService")}
            </button>
            <button
              className="delete-btn"
              onClick={() => {
                if (window.confirm(t("talent.deleteConfirm"))) deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
            >
              {t("talent.deleteService")}
            </button>
          </>
        )}
      </div>
      {isEditing && (
        <div className="service-edit-modal" role="dialog" aria-modal="true" aria-label={t("services.edit")}>
          <div className="service-edit-modal-backdrop" onClick={() => setIsEditing(false)} />
          <div className="service-edit-modal-content">
            <SubmitService service={service} onClose={() => setIsEditing(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCard;

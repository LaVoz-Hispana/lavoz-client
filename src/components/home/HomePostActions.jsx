import "./homePostActions.scss";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SubmitService from "../service/SubmitService";
import SubmitProject from "../project/SubmitProject";
import Share from "../share/Share";
import { isAdmin } from "../../utils/admin";

const HomePostActions = ({ role, currentUser }) => {
  const { t } = useTranslation();
  const [activeForm, setActiveForm] = useState(null);
  const isLocal = role === "local";

  const openForm = (form) => {
    setActiveForm((current) => current === form ? null : form);
  };

  return (
    <section className="home-post-actions">
      <div className="action-card">
        <button className="action-button" onClick={() => openForm("listing")}>
          <BusinessCenterOutlinedIcon />
          <span>{isLocal ? t("projects.post") : t("services.post")}</span>
        </button>
        <button className="action-button" onClick={() => openForm("post")}>
          <EditNoteOutlinedIcon />
          <span>{t("home.newPost")}</span>
        </button>
        {isAdmin(currentUser) && (
          <button className="action-button" onClick={() => openForm("admin-post")}>
            <AdminPanelSettingsOutlinedIcon />
            <span>Admin Post</span>
          </button>
        )}
      </div>

      {activeForm === "listing" && (
        isLocal
          ? <SubmitProject onClose={() => setActiveForm(null)} />
          : <SubmitService onClose={() => setActiveForm(null)} />
      )}
      {activeForm === "post" && <Share categ="general" showProjectReference />}
      {activeForm === "admin-post" && <Share categ="general" isAdminPost />}
    </section>
  );
};

export default HomePostActions;

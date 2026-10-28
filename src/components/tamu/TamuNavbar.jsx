import React from "react";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import "./tamuNavbar.scss";

import { useTranslation } from "react-i18next";

const TamuNavbar = ({ currentView, setCurrentView }) => {
  const { t } = useTranslation();

  return (
    <div className="tamu-navbar">
      <button
        className={currentView === "home" ? "nav-button active" : "nav-button"}
        onClick={() => setCurrentView("home")}
      >
        <HomeOutlinedIcon />
        {t("tamu.home")}
      </button>
      <button
        className={currentView === "meals" ? "nav-button active" : "nav-button"}
        onClick={() => setCurrentView("meals")}
      >
        <GroupsOutlinedIcon />
        {t("tamu.aggieMeals")}
      </button>
      <button
        className={
          currentView === "consulting" ? "nav-button active" : "nav-button"
        }
        onClick={() => setCurrentView("consulting")}
      >
        <WorkOutlineIcon />
        {t("tamu.aggieConsulting")}
      </button>
    </div>
  );
};

export default TamuNavbar;

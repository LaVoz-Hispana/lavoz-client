import "./rightBar.scss";
import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useTranslation } from "react-i18next";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { AuthContext } from "../../context/authContext";
import RatingBadge from "../review/RatingBadge";

const RightBar = () => {
  const { t } = useTranslation();
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [homeOpen, setHomeOpen] = useState(true);

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => makeRequest.get("/projects").then((r) => r.data),
  });
  const { data: users } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => makeRequest.get("/users/").then((r) => r.data),
  });
  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: () => makeRequest.get("/services").then((r) => r.data),
  });

  const openProjects     = projects?.filter((p) => p.status !== "closed").slice(0, 5) ?? [];
  const students         = users?.filter((u) => u.account_type === "student").slice(0, 5) ?? [];
  const locals           = users?.filter((u) => u.account_type === "local").slice(0, 5) ?? [];
  const featuredServices = services?.slice(0, 5) ?? [];

  const sections = [
    {
      show: students.length > 0,
      icon: <SchoolOutlinedIcon />,
      label: "Student Talent",
      to: "/talent",
      rows: students.map((u) => (
        <Link key={u.id} to={`/profile/${u.id}`} className="rb-row">
          <img src={u.profilePic} alt="" />
          <div className="rb-row-info">
            <span className="rb-title">{u.username} <RatingBadge rating={u.averageRating} reviewCount={u.reviewCount} /></span>
            <span className="rb-subtitle">{u.skills ? u.skills.split(",")[0].trim() : u.university || "Student"}</span>
          </div>
        </Link>
      )),
    },
    {
      show: featuredServices.length > 0,
      icon: <StarBorderOutlinedIcon />,
      label: "Student Services",
      to: "/talent?tab=services",
      rows: featuredServices.map((s) => (
        <Link key={s.id} to={`/talent?tab=services&service=${s.id}`} className="rb-row">
          <div className="rb-row-info">
            <span className="rb-title">{s.title}</span>
            <span className="rb-subtitle">{s.username} <RatingBadge rating={s.averageRating} reviewCount={s.reviewCount} /></span>
          </div>
        </Link>
      )),
    },
    {
      show: locals.length > 0,
      icon: <StorefrontOutlinedIcon />,
      label: t("projects.bcsLocals"),
      to: "/projects",
      rows: locals.map((u) => (
        <Link key={u.id} to={`/profile/${u.id}`} className="rb-row">
          <img src={u.profilePic} alt="" />
          <div className="rb-row-info">
            <span className="rb-title">{u.username} <RatingBadge rating={u.averageRating} reviewCount={u.reviewCount} /></span>
            <span className="rb-subtitle">{u.location || "BCS Local"}</span>
          </div>
        </Link>
      )),
    },
    {
      show: currentUser?.account_type === "local" || openProjects.length > 0,
      icon: <FolderOutlinedIcon />,
      label: t("projects.bcsLocalProjects"),
      to: "/projects?tab=projects",
      rows: openProjects.map((p) => (
        <Link key={p.id} to={`/projects/${p.id}`} className="rb-row">
          <div className="rb-row-info">
            <span className="rb-title">{p.title}</span>
            <span className="rb-subtitle">{p.username} <RatingBadge rating={p.averageRating} reviewCount={p.reviewCount} />{p.timeline ? ` · ${p.timeline}` : ""}</span>
          </div>
        </Link>
      )),
    },
  ].filter((s) => s.show);

  /* full = home AND user has it open; otherwise slim icon strip */
  const isFullMode = isHome && homeOpen;

  return (
    <div className={`rightBar ${isFullMode ? "rightBar--full" : "rightBar--slim"}`}>
      {/* scrollable section list */}
      <div className="rb-scroll">
        <div className="rb-menu">
          {sections.map((section, idx) => (
            <div key={idx} className="rb-section-entry">
              <div className="rb-section-header">
                <div className="rb-section-icon">{section.icon}</div>
                <h4 className="rb-section-title">{section.label}</h4>
                <Link to={section.to} className="rb-section-link">
                  {t("projects.viewAll")} →
                </Link>
              </div>
              <div className="rb-section-body">
                <div className="rb-list">{section.rows}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* collapse / expand toggle — home only, pinned to bottom */}
      {isHome && (
        <button className="rb-toggle-bottom" onClick={() => setHomeOpen(!homeOpen)}>
          <div className="rb-section-icon">
            {isFullMode
              ? <KeyboardDoubleArrowRightIcon />
              : <KeyboardDoubleArrowLeftIcon />
            }
          </div>
          {/* <span className="rb-toggle-label">
            {isFullMode ? "Collapse" : "Expand"}
          </span> */}
        </button>
      )}
    </div>
  );
};

export default RightBar;

import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import WorkOutlinedIcon from "@mui/icons-material/WorkOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import NotificationBell from "../notification/NotificationBell";
import MessageBell from "../notification/MessageBell";

import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { makeRequest } from "../../axios";

import "./navbar.scss";

import Logo from "../../assets/Postsstationlogo.png";
import MxFlag from "../../assets/mx.png";
import UsFlag from "../../assets/us.png";

const Navbar = () => {
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser, clearUser } = useContext(AuthContext);
  const { t } = useTranslation();
  const [language, setLanguage] = useState(i18next.language === 'es');
  const navigate = useNavigate();
  const location = useLocation();
  const [err, setErr] = useState(null);

  const authLink = (path) => (currentUser ? path : "/login");
  const isActive = (path) => location.pathname.startsWith(path);

  const toggleLng = () => {
    setLanguage(!language);
    i18next.changeLanguage(language ? 'en' : 'es');
  }

  const logout = async () => {
    clearUser();
    const res = await makeRequest.post("/auth/logout", {
    });
  };

  const handleLogout = async (e) => {
    e.preventDefault()
    try{
      await logout();
      navigate("/login");
    } catch (err) {
      setErr(err.response.data);
    }
  };

  return (
    <div className="navbar">
      <div className="left">
        <Link to="/" style={{ textDecoration: "none" }}>
          <img src={Logo} alt="Poststation Logo" className="logo" />
        </Link>
        <Link to='/' className="pc" style={{ textDecoration: "none", color: "inherit", display: 'flex' }}>
          <HomeOutlinedIcon className="pc" style={{ justifyContent: "center", alignItems: "center" }} />
        </Link>
        {darkMode ? (
          <WbSunnyOutlinedIcon className="pc" onClick={toggle} style={{ cursor: "pointer" }} />
        ) : (
          <DarkModeOutlinedIcon className="pc" onClick={toggle} style={{ cursor: "pointer" }} />
        )}
        <button className="language-toggle" onClick={toggleLng}>
          <img src={language ? MxFlag : UsFlag} className="flag" alt="Language Flag"/>
        </button>
      </div>
      {currentUser ? (
        <div className="right">
          <Link to={authLink("/projects")} className={`nav-link${isActive("/projects") ? " active" : ""}`} title={t("projects.browse")}>
            <WorkOutlinedIcon fontSize="small" />
          </Link>
          <Link to={authLink("/talent")} className={`nav-link${isActive("/talent") ? " active" : ""}`} title={t("talent.browse")}>
            <PeopleOutlinedIcon fontSize="small" />
          </Link>
          <Link to="/messages" style={{ textDecoration: "none", color: "inherit" }}>
            <MessageBell iconColor="inherit" />
          </Link>
          <Link to="/notifications" style={{ textDecoration: "none", color: "inherit" }}>
            <NotificationBell iconColor="inherit" />
          </Link>
          <Link to={"/login"}>
            <button onClick={handleLogout} className="guest-button">Logout</button>
          </Link>
          {/* <Link to={"/profile/" + currentUser.id} className="pc" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="user">
              <img src={currentUser.profilePic} alt="" />
              <span>{currentUser.username}</span>
            </div>
          </Link> */}
        </div>
      ) : (
        <div className="row">
          <Link to={"/login"}>
            <button className="guest-button-second">Login</button>
          </Link>
          <Link to={"/register"}>
            <button className="guest-button">Sign Up</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;

import "./leftBar.scss";
import Groups from "../../assets/2.png";
import PostAddIcon from "@mui/icons-material/PostAdd";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined";
import { AuthContext } from "../../context/authContext";
import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { isAdmin } from "../../utils/admin";

const LeftBar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { currentUser } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActivePath = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  /* Redirect guests to /login for any nav item that requires auth */
  const authLink = (path) => (currentUser ? path : "/login");

  const NavItems = () => (
    <>
      {currentUser && (
        <div className="row">
          <Link to={`/profile/${currentUser.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div className="user">
              <img src={currentUser.profilePic} alt="" />
              <span>{currentUser.username}</span>
            </div>
          </Link>
        </div>
      )}

      <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
        <div className={`item${isActivePath("/", true) ? " active" : ""}`}>
          <img src={Groups} alt="" />
          <span>{t('sections.home')}</span>
        </div>
      </Link>

      {/* Publish Project — locals only */}
      {currentUser?.account_type === 'local' && (
        <Link to="/projects?tab=projects" style={{ textDecoration: "none", color: "inherit" }}>
          <div className={`item publish-item${isActivePath("/projects") && new URLSearchParams(location.search).get("tab") === "projects" ? " active" : ""}`}>
            <PostAddIcon style={{ width: 20, height: 20 }} />
            <span>Publish Project</span>
          </div>
        </Link>
      )}

      {/* My Escrows — logged-in student + local, or guest preview */}
      {(!currentUser || currentUser.account_type !== 'admin') && (
        <Link to={authLink("/escrows")} style={{ textDecoration: "none", color: "inherit" }}>
          <div className={`item${isActivePath("/escrows") ? " active" : ""}${!currentUser ? " guest-item" : ""}`}>
            <HandshakeOutlinedIcon style={{ width: 20, height: 20 }} />
            <span>{t('escrow.myEscrows')}</span>
          </div>
        </Link>
      )}

      {/* Messages — logged-in users only */}
      {currentUser && (
        <Link to="/messages" style={{ textDecoration: "none", color: "inherit" }}>
          <div className={`item${isActivePath("/messages") ? " active" : ""}`}>
            <MessageOutlinedIcon style={{ width: 20, height: 20 }} />
            <span>Messages</span>
          </div>
        </Link>
      )}

      {/* Admin Dashboard — admin only */}
      {isAdmin(currentUser) && (
        <Link to="/admin" style={{ textDecoration: "none", color: "inherit" }}>
          <div className={`item${isActivePath("/admin") ? " active" : ""}`}>
            <AdminPanelSettingsOutlinedIcon style={{ width: 20, height: 20 }} />
            <span>{t('admin.dashboard')}</span>
          </div>
        </Link>
      )}
    </>
  );

  return (
    <div className='soft'>
      {!sidebarOpen && <KeyboardDoubleArrowRightIcon className="toggle-closed pc" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: "gray", cursor: "pointer" }} />}
      {sidebarOpen && <KeyboardDoubleArrowRightIcon className="toggle-closed mobile" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: "gray", cursor: "pointer" }} />}

      <div className={`pc leftBar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="container">
          <div className='menu'>
            <div className="toggle">
              {sidebarOpen
                ? <KeyboardDoubleArrowLeftIcon onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: "gray", cursor: "pointer" }} />
                : <KeyboardDoubleArrowRightIcon onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: "gray" }} />
              }
            </div>
            <NavItems />
          </div>
        </div>
      </div>

      <div className={`mobile leftBar ${sidebarOpen ? "closed" : "open"}`}>
        <div className="container">
          <div className='menu'>
            <div className="toggle">
              {sidebarOpen
                ? <KeyboardDoubleArrowRightIcon onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: "gray", cursor: "pointer" }} />
                : <KeyboardDoubleArrowLeftIcon onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: "gray" }} />
              }
            </div>
            <NavItems />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftBar;

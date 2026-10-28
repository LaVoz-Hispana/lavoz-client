import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { setNavigate } from "./utils/navigation";
import Navbar from "./components/navbar/Navbar";
import LeftBar from "./components/leftBar/LeftBar";
import Home from "./pages/home/Home";
import ProfilePage from "./pages/profile/ProfilePage";
import FirstLogin from "./pages/firstLogin/FirstLogin";
// import Viral from "./pages/viral/Viral";
import Guest from "./pages/guest/Guest";
import "./style.scss";
import { useContext, useEffect } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/authContext";
import "./i18n";
import ForgotPassword from "./pages/forgotPassword/forgotPassword";
import OTPInput from "./pages/forgotPassword/OTPInput";
import ResetPassword from "./pages/forgotPassword/ResetPassword";
import { RecoveryContext } from "./context/recoveryContext";
import RightBar from "./components/rightBar/RightBar";
import BrowseProjects from "./pages/projects/BrowseProjects";
import ProjectDetail from "./pages/projects/ProjectDetail";
import BrowseTalent from "./pages/talent/BrowseTalent";
import MyEscrows from "./pages/escrows/MyEscrows";
import MyApplications from "./pages/applications/MyApplications";
import EscrowDetail from "./pages/escrows/EscrowDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { RoleGuard } from "./utils/roleGuard";
import Messages from "./pages/messages/Messages";
import Notifs from "./pages/notifications/Notifs";
// import Shorts from "./pages/shorts/Shorts";

function App() {
  // console.log("App loaded — Env BASE URL:", process.env.REACT_APP_NETWORK_ADDR);

  const { currentUser } = useContext(AuthContext);

  const { darkMode } = useContext(DarkModeContext);

  const NavigationWrapper = () => {
    const navigate = useNavigate();

    useEffect(() => {
      setNavigate(navigate);
    }, [navigate]);

    return <Layout />;
  };

  const Layout = () => {
    const location = useLocation();
    const isHome = location.pathname === "/";

    return (
      <div
        className={`theme-${darkMode ? "dark" : "light"}`}
        style={{ height: "100%" }}
      >
        <Navbar style={{ height: "5%" }} />
        <div style={{ display: "flex", height: "95%", width: "100%" }}>
          <LeftBar />
          <div
            className="mainSection"
            style={{ width: "100%", margin: 0, flex: 10 }}
          >
            <Outlet />
          </div>
          <RightBar />
        </div>
      </div>
    );
  };

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  function ResetRoute({ children }) {
    const { valid } = useContext(RecoveryContext);
    return valid === true ? children : <Navigate to="/forgotPassword" />;
  }

  function OTPRoute({ children }) {
    const { email } = useContext(RecoveryContext);
    return email != null ? children : <Navigate to="/otp" />;
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <NavigationWrapper />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/profile/:id",
          element: <ProfilePage />,
        },
        {
          path: "/guest",
          element: <Guest />,
        },
        {
          path: "/projects",
          element: <BrowseProjects />,
        },
        {
          path: "/projects/:id",
          element: <ProjectDetail />,
        },
      ],
    },
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <NavigationWrapper />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/firstLogin",
          element: <FirstLogin />,
        },
        {
          path: "/talent",
          element: <BrowseTalent />,
        },
        {
          path: "/escrows",
          element: <MyEscrows />,
        },
        {
          path: "/applications",
          element: (
            <RoleGuard roles={["student"]}>
              <MyApplications />
            </RoleGuard>
          ),
        },
        {
          path: "/escrows/:id",
          element: <EscrowDetail />,
        },
        {
          path: "/admin",
          element: (
            <RoleGuard roles={["admin"]}>
              <AdminDashboard />
            </RoleGuard>
          ),
        },
        {
          path: "/messages",
          element: <Messages />,
        },
        {
          path: "/notifications",
          element: <Notifs />,
        },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/forgotPassword",
      element: <ForgotPassword />,
    },
    {
      path: "/otp",
      element: (
        <OTPRoute>
          <OTPInput />
        </OTPRoute>
      ),
    },
    {
      path: "/resetPassword",
      element: (
        <ResetRoute>
          <ResetPassword />
        </ResetRoute>
      ),
    },
  ]);

  return (
    <div>
      <RouterProvider router={router} style={{ maxWidth: "100vw" }} />
    </div>
  );
}

export default App;

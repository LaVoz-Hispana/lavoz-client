import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { isAdmin } from "./admin";

export const RoleGuard = ({ roles, children }) => {
  const { currentUser } = useContext(AuthContext);
  if (!currentUser) return <Navigate to="/login" />;
  const allowed = roles.some((role) =>
    role === "admin" ? isAdmin(currentUser) : currentUser.account_type === role
  );
  if (!allowed) return <Navigate to="/" />;
  return children;
};

export const useUserType = () => {
  const { currentUser } = useContext(AuthContext);
  return currentUser?.account_type ?? null;
};

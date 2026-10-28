import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";

// Identity can be shown in marketplace/review views without linking to a private profile.
export default function ProfileLink({ to, children, ...props }) {
  const { currentUser } = useContext(AuthContext);
  const match = typeof to === "string" && to.match(/^\/profile\/([1-9]\d*)$/);
  if (currentUser && match && Number(currentUser.id) === Number(match[1])) {
    return (
      <Link to={to} {...props}>
        {children}
      </Link>
    );
  }
  return <span {...props}>{children}</span>;
}

import "./guest.scss";
import DisabledByDefaultIcon from "@mui/icons-material/DisabledByDefault";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Guest = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="guest">
      <div className="wrapper">
        <h2>To access this feature, please login or create an account!</h2>
        <button className="close" onClick={() => {}}>
          <Link to={"/"}>
            <DisabledByDefaultIcon style={{ color: "red" }} />
          </Link>
        </button>
        <div className="row">
          <Link to={"/register"}>
            <button className="guest-button">Sign Up</button>
          </Link>
          <Link to={"/login"}>
            <button
              className="guest-button"
              style={{ backgroundColor: "gray" }}
            >
              Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Guest;

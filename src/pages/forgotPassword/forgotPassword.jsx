import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./forgotPassword.scss";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { RecoveryContext } from "../../context/recoveryContext";
import { makeRequest } from "../../axios";
import { useTranslation } from "react-i18next";
import US from "../../assets/us.png";
import MX from "../../assets/mx.png";
import { LanguageContext } from "../../context/language";

const ForgotPassword = () => {
  const [err, setErr] = useState(null);
  const [sent, setSent] = useState(false);
  const { setEmail, email, setOTP } = useContext(RecoveryContext);
  const [emailInput, setEmailInput] = useState(null);
  const { t } = useTranslation([]);
  const { language, langToggle } = useContext(LanguageContext);
  const navigate = useNavigate();
  const EMAIL_REGEX = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

  const navigateToOtp = () => {
    if (email) {
      const OTP = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);

      //console.log(OTP); // TAKE OUT!!!
      setOTP(OTP);

      makeRequest
        .post("/auth/send_recovery_email", {
          OTP,
          recipient_email: email,
        })
        .then(() => {
          navigate("/otp");
          setEmailInput(null);
        })
        .catch(console.log);
      return;
    }
  };

  useEffect(() => {
    if (email) {
      navigateToOtp();
    }
  }, [email]);

  const handlePress = (e) => {
    e.preventDefault();
    if (!emailInput) return;
    if (!emailInput.match(EMAIL_REGEX)) {
      setErr(t("register.email"));
      return;
    }
    if (emailInput != "") {
      setEmail(emailInput);
      navigateToOtp();
    }
  };

  return (
    <div className="forgotPassword">
      <div className="card">
        <button className="language-toggle" onClick={langToggle}>
          {language === "es" ? (
            <img src={MX} className="flag" />
          ) : (
            <img src={US} className="flag" />
          )}
        </button>
        {sent === false ? (
          <div className="right">
            <h1>{t("resetPassword.forgot")}</h1>
            <div className="text">{t("resetPassword.enterEmail")}</div>
            <form className="form">
              <input
                type="text"
                placeholder="Email Address"
                name="email"
                onChange={(e) => setEmailInput(e.target.value)}
              />
              {err && <div className="error">{err}</div>}
            </form>
            <button onClick={handlePress}>
              {t("resetPassword.sendReset")}
            </button>
          </div>
        ) : (
          <div className="right">
            <div style={{ display: "flex", gap: 15 }}>
              <h1>Thank You!</h1>
              <CheckCircleIcon style={{ color: "green", fontSize: "2.8em" }} />
            </div>
            <div className="text">
              Check your email for your secure password link.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

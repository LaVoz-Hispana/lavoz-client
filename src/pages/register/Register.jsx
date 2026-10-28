import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import "./register.scss";
import { useContext, useState } from "react";
import Terms from "../../components/terms/Terms";
import Privacy from "../../components/terms/Privacy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useTranslation } from "react-i18next";
import US from "../../assets/us.png";
import MX from "../../assets/mx.png";
import { makeRequest } from "../../axios";
import ProviderFields from "../../components/provider/ProviderFields";
import { providerError } from "../../utils/providerProfile";
import { LanguageContext } from "../../context/language";

const Register = () => {
  const navigate = useNavigate();
  const { t } = useTranslation([]);
  const { language, langToggle } = useContext(LanguageContext);
  const { updateUser } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [err, setErr] = useState(null);
  const [page, setPage] = useState(0);
  const [acctType, setAcctType] = useState(null); // user's response to account type: business or personal?
  const [visible, setVisible] = useState(false);

  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    account_type: "",
    provider_type: "",
    contact_person_name: "",
    company_name: "",
    organization_name: "",
  });
  const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,24}$/;
  const EMAIL_REGEX = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

  const handleChange = (e) => {
    setInputs((prev) =>
      e.target.name === "provider_type"
        ? {
            ...prev,
            provider_type: e.target.value,
            company_name: e.target.value === "company" ? prev.company_name : "",
            organization_name:
              e.target.value === "organization" ? prev.organization_name : "",
          }
        : { ...prev, [e.target.name]: e.target.value },
    );
    setErr(null); // Reset error when input changes
  };

  const handleClick = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (
      inputs.username === "" ||
      inputs.password === "" ||
      inputs.confirmPassword === "" || // Check the confirmPassword field
      inputs.email === ""
    ) {
      setErr(t("register.error"));
      return;
    }

    if (!inputs.password.match(PWD_REGEX)) {
      setErr(t("register.password"));
      return;
    }

    if (inputs.password !== inputs.confirmPassword) {
      setErr(t("register.match"));
      return;
    }

    if (!inputs.email.match(EMAIL_REGEX)) {
      setErr(t("register.email"));
      return;
    }
    if (inputs.account_type === "local" && !inputs.provider_type) {
      setErr(t("provider.errors.typeRequired"));
      return;
    }
    if (inputs.account_type === "local" && !inputs.contact_person_name.trim()) {
      setErr(t("provider.errors.contactRequired"));
      return;
    }
    if (
      inputs.account_type === "local" &&
      inputs.provider_type === "company" &&
      !inputs.company_name.trim()
    ) {
      setErr(t("provider.errors.companyRequired"));
      return;
    }
    if (
      inputs.account_type === "local" &&
      inputs.provider_type === "organization" &&
      !inputs.organization_name.trim()
    ) {
      setErr(t("provider.errors.organizationRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await makeRequest.post("/auth/register", inputs);
      if (data.token) localStorage.setItem("accessToken", data.token);
      updateUser({
        username: inputs.username,
        email: inputs.email,
        ...data,
        coverPic: "https://lavozbucket.s3.amazonaws.com/default_cover.jpg",
        profilePic: "https://lavozbucket.s3.amazonaws.com/pfp.jpg",
      });
      navigate("/firstLogin");
    } catch (error) {
      setErr(
        error.response?.status === 409
          ? t("register.exists")
          : providerError(error, t),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChoice = (choice) => {
    setAcctType(choice);
    setInputs((prev) => ({
      ...prev,
      account_type: choice,
      provider_type: "",
      contact_person_name: "",
      company_name: "",
      organization_name: "",
    }));
    setPage(1);
  };

  return (
    <div className="register">
      <button className="language-toggle pc" onClick={langToggle}>
        {language === "es" ? (
          <img src={MX} className="flag" alt="Español" />
        ) : (
          <img src={US} className="flag" alt="English" />
        )}
      </button>
      <div className="card">
        <button className="language-toggle mobile" onClick={langToggle}>
          {language === "es" ? (
            <img src={MX} className="flag" alt="Español" />
          ) : (
            <img src={US} className="flag" alt="English" />
          )}
        </button>
        <Link to="/login" className="login-button mobile">
          <button>{t("login.login")}</button>
        </Link>

        <div className="left">
          <h1>Poststation</h1>
          <p>{t("register.desc")}</p>
          <span>{t("register.do")}</span>
          <Link to="/login">
            <button>{t("login.login")}</button>
          </Link>
        </div>
        <div className="right">
          <h1>{t("login.register")}</h1>
          {page === 0 ? (
            <div className="question">
              <h2>{t("register.question")}</h2>
              <button
                className="personal"
                onClick={() => handleChoice("student")}
              >
                {t("register.student")}
              </button>
              <span className="description">{t("register.studentDesc")}</span>

              <button
                className="business"
                onClick={() => handleChoice("local")}
              >
                {t("register.local")}
              </button>
              <span className="description">{t("register.localDesc")}</span>
            </div>
          ) : (
            <form aria-label={t("login.register")} onSubmit={handleClick}>
              <input
                aria-label={t("update.email")}
                type="email"
                value={inputs.email}
                placeholder={t("update.email")}
                name="email"
                onChange={handleChange}
              />
              <input
                aria-label={t("login.username")}
                type="text"
                value={inputs.username}
                placeholder={t("login.username")}
                name="username"
                onChange={handleChange}
              />
              {acctType === "local" && (
                <ProviderFields
                  values={inputs}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              )}
              {/* {acctType === 'business' ? <input type="text" placeholder={t('register.businessName')} name="name" onChange={handleChange}/>
                : <input type="text" placeholder={t('update.name')} name="name" onChange={handleChange}/>
                } */}
              {[
                ["password", "update.password"],
                ["confirmPassword", "register.confirm"],
              ].map(([name, label]) => (
                <div className="passwords" key={name}>
                  <input
                    aria-label={t(label)}
                    value={inputs[name]}
                    placeholder={t(label)}
                    type={visible ? "text" : "password"}
                    name={name}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    aria-label={t(
                      visible
                        ? "provider.hidePassword"
                        : "provider.showPassword",
                    )}
                    aria-pressed={visible}
                    onClick={() => setVisible(!visible)}
                  >
                    {visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </button>
                </div>
              ))}

              <div className="notice">
                <span>{t("register.terms")}</span>
                <button
                  type="button"
                  className="policy-link"
                  onClick={() => setOpenPrivacy(true)}
                >
                  {t("register.privacy")}
                </button>
                <span> {t("register.and")} </span>
                <button
                  type="button"
                  className="policy-link"
                  onClick={() => setOpenTerms(true)}
                >
                  {t("register.use")}
                </button>
              </div>

              {err && (
                <div role="alert" className="notice" style={{ color: "red" }}>
                  {err}
                </div>
              )}
              <div className="buttonRow">
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="back"
                  onClick={() => setPage(0)}
                >
                  {t("register.back")}
                </button>
                <button type="submit" disabled={isSubmitting}>
                  {t(isSubmitting ? "provider.saving" : "login.register")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      {openTerms && <Terms setOpenTerms={setOpenTerms} />}
      {openPrivacy && <Privacy setOpenPrivacy={setOpenPrivacy} />}
    </div>
  );
};

export default Register;

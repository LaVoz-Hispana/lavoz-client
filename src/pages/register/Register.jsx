import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import "./register.scss";
import { useContext, useState } from "react";
import axios from "axios";
import Terms from "../../components/terms/Terms";
import Privacy from "../../components/terms/Privacy";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useTranslation } from "react-i18next";
import US from "../../assets/us.png";
import i18next, { changeLanguage } from "i18next";
import MX from "../../assets/mx.png";
import { makeRequest } from "../../axios";

const Register = () => {
  const navigate = useNavigate();
  const { t } = useTranslation([]);
  const { login } = useContext(AuthContext);
  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [err, setErr] = useState(null);
  const [page, setPage] = useState(0);
  const [acctType, setAcctType] = useState(null); // user's response to account type: business or personal?
  const [visible, setVisible] = useState(false);
  const [language, setLanguage] = useState(i18next.language === 'es');
  const { setCurrentUser } = useContext(AuthContext);

  const toggleLng = () => {
    setLanguage(!language);
    if (i18next.language == 'es') i18next.changeLanguage('en');
    else i18next.changeLanguage('es');
  }

  const [inputs, setInputs] = useState({
    username:"",
    email:"",
    password:"",
    confirmPassword: '', 
    account_type: ""
  });
  const [loginInfo, setLoginInfo] = useState({
    username: "",
    password: ""
  });

  const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
  const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,24}$/;
  const EMAIL_REGEX = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

  const handleChange = e => {
    setInputs(prev=>({...prev, [e.target.name]:e.target.value }));
    setErr(null); // Reset error when input changes
  };

  const handleClick = async (e) => {
    e.preventDefault();
    if (
      inputs.username === '' ||
      inputs.password === '' ||
      inputs.confirmPassword === '' || // Check the confirmPassword field
      inputs.email === '' 
    ) {
      setErr(t('register.error'));
      return;
    }

    if (!inputs.password.match(PWD_REGEX)) {
      setErr(t('register.password'));
      return;
    }

    if (inputs.password !== inputs.confirmPassword) {
      setErr(t('register.match'));
      return;
    }

    if (!inputs.email.match(EMAIL_REGEX)) {
      setErr(t('register.email'));
      return;
    }

    let userId = 0;
    try {
      const res = await makeRequest.post("/auth/register", inputs);
      userId = res.data.id;
      if (res.data.token) {
        localStorage.setItem("accessToken", res.data.token);
      }
    } catch (error) {
      console.error("Error:", error);
      setErr("User already exists.");
      return;
    }
    setCurrentUser({email: inputs.email, account_type: inputs.account_type, password: inputs.password, id: userId, coverPic: "https://lavozbucket.s3.amazonaws.com/default_cover.jpg", profilePic: "https://lavozbucket.s3.amazonaws.com/pfp.jpg"});
    navigate("/firstLogin");
  };

  const handleChoice = (choice) => {
    setAcctType(choice);
    setInputs(prev=>({...prev, account_type: choice }));
    setPage(1);
  }
  
  return (
    <div className="register">
          <button className = "language-toggle pc" onClick={toggleLng}>
              {language ?
                <img src={MX} className="flag"/> : <img src={US} className="flag"/>
              }
          </button>
      <div className="card">

          <button className = "language-toggle mobile" onClick={toggleLng}>
              {language ?
                <img src={MX} className="flag"/> : <img src={US} className="flag"/>
              }
          </button>
          <Link to="/login" className="login-button mobile">
            <button>{t('login.login')}</button>
          </Link>

        <div className="left">
          <h1>Poststation</h1>
          <p>
            {t('register.desc')}
          </p>
          <span>{t('register.do')}</span>
          <Link to="/login">
            <button>{t('login.login')}</button>
          </Link>
        </div>
        <div className="right">
          <h1>{t('login.register')}</h1>
          {page === 0 ?
              <div className = "question">
                <h2>{t('register.question')}</h2>
                <button className="personal" onClick={() => handleChoice('student')}>{t('register.student')}</button>
                <span className='description'>{t('register.studentDesc')}</span>

                <button className="business" onClick={() => handleChoice('local')}>{t('register.local')}</button>
                <span className='description'>{t('register.localDesc')}</span>
              </div>
          : 
              <form>
                <input type="email" placeholder={t('update.email')} name="email" onChange={handleChange}/>
                <input type="text" placeholder={t('login.username')} name="username" onChange={handleChange}/>
                {/* {acctType === 'business' ? <input type="text" placeholder={t('register.businessName')} name="name" onChange={handleChange}/>
                : <input type="text" placeholder={t('update.name')} name="name" onChange={handleChange}/>
                } */}
        {visible === true ? (
          <div className="passwords">
            <input placeholder={t('update.password')} type="text" name="password" onChange={handleChange} />
            <VisibilityIcon className="eye" onClick={() => setVisible(!visible)} />
          </div>
        ) : (
          <div className="passwords">
            <input placeholder={t('update.password')} type="password" name="password" onChange={handleChange} />
            <VisibilityOffIcon className="eye" onClick={() => setVisible(!visible)} />
          </div>
        )}

        {/* Similar modification for confirmPassword */}
        {visible === true ? (
          <div className="passwords">
            <input placeholder={t('register.confirm')} type="text" name="confirmPassword" onChange={handleChange} onKeyDown={(e) => e.key === 'Enter' ? handleClick : ""}/>
            <VisibilityIcon className="eye" onClick={() => setVisible(!visible)} />
          </div>
        ) : (
          <div className="passwords">
            <input placeholder={t('register.confirm')} type="password" name="confirmPassword" onChange={handleChange} onKeyDown={(e) => e.key === 'Enter' ? handleClick : ""}/>
            <VisibilityOffIcon className="eye" onClick={() => setVisible(!visible)} />
          </div>
        )}
                
                
          <div className="notice">
            <span>{t('register.terms')}</span> 
            <span style={{textDecoration: "underline", color: "blue"}} onClick={() => setOpenTerms(true)}>{t('register.privacy')}</span>
            <span> {t('register.and')} </span>
            <span style={{textDecoration: "underline", color: "blue"}} onClick={() => setOpenPrivacy(true)}>{t('register.use')}</span>
          </div>

          {err && <div className="notice" style={{color: 'red'}}>{err}</div>}
          <div className="buttonRow">
              <button className='back' onClick={() => setPage(0)}>{t('register.back')}</button>
              <button onClick={handleClick}>{t('login.register')}</button>
          </div>
        </form>
        }
        </div>
      </div>
      {openTerms && <Terms setOpenTerms={setOpenTerms}/>}
      {openPrivacy && <Privacy setOpenPrivacy={setOpenPrivacy}/>}
    </div>
  );
};

export default Register;

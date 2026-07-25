import { useContext, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import "./login.scss";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useTranslation } from "react-i18next";
import US from "../../assets/us.png";
import i18next, { changeLanguage } from "i18next";
import MX from "../../assets/mx.png";

const Login = () => {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });
  const [err, setErr] = useState(null);
  const [visible, setVisible] = useState(false);
  const [language, setLanguage] = useState(i18next.language === 'es');
  const toggleLng = () => {
    setLanguage(!language);
    if (i18next.language == 'es') i18next.changeLanguage('en');
    else i18next.changeLanguage('es');
  }

  const navigate = useNavigate()

  const handleChange = (e) => {
    setInputs((prev) => ({...prev, [e.target.name]: e.target.value}));
    setErr(null);
  };
  const { login, currentUser } = useContext(AuthContext);

  if (currentUser) return <Navigate to="/" replace />;

  const handleLogin = async (e) => {
    e.preventDefault()
    try{
      await login(inputs);
      navigate("/")
    } catch (err) {
      setErr(t('login.invalid'));
      console.log(t('login.error'));
    }
  };

  return (
    <div className="login">
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
        <div className="left">
          <h1>Poststation</h1>
          <p>
          {t('login.desc')}
          </p>
          <span>{t('login.dont')}</span>
          <Link to="/register">
            <button>{t('login.register')}</button>
          </Link>
        </div>
        <div className="right">
          <h1>{t('login.login')}</h1>
          <form>
            <input type="text" placeholder="Email" name="email" onChange={handleChange} />
            <div style={{position: "relative", padding: 0}}>
              {visible === true ? <input className="pw" placeholder="Password" type="text" name = "password" onChange = {handleChange}/> : <input placeholder="Password" className="pw" type="password" name = "password" onChange = {handleChange}/>}
              {visible === false ? <VisibilityIcon className="eye" onClick={() => setVisible(!visible)}/> : <VisibilityOffIcon className="eye" onClick={() => setVisible(!visible)}/>}
            </div>
            
            
            {err && <div className='error'>{err}</div>}
            <div className="buttons">
              <button onClick={handleLogin}>{t('login.login')}</button>
              <span className="or">or</span>
              <Link to="/" className="guest">
                <button>Continue as Guest</button>
              </Link>
              <Link to="/register" class="mobile">
                <button style={{backgroundColor: '#6D1D1D'}}>{t('login.register')}</button>
              </Link>
            </div>
              <Link className="forgot" to="/forgotPassword">Forgot password?</Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import "./forgotPassword.scss";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { RecoveryContext } from "../../context/recoveryContext";
import { makeRequest } from "../../axios";
import { useTranslation } from "react-i18next";
import US from "../../assets/us.png";
import MX from "../../assets/mx.png";
import { LanguageContext } from "../../context/language";

const ResetPassword = () => {
    const [err, setErr] = useState(null);
    const [visible, setVisible] = useState(false);
    const [done, setDone] = useState(false);
    const [inputs, setInputs] = useState({
        password:"",
        confirmPassword: '', 
    });
    const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,24}$/;
    const { email } = useContext(RecoveryContext);
    const navigate = useNavigate();

    const { t } = useTranslation([]);
    const { language, langToggle } = useContext(LanguageContext);

    const handleChange = e => {
        setInputs(prev=>({...prev, [e.target.name]:e.target.value }));
        setErr(null); // Reset error when input changes
    };

    const handleClick = async (e) => {
        if (
          inputs.password === '' ||
          inputs.confirmPassword === '' // Check the confirmPassword field
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

        try {
          // Update password
          await makeRequest.put("/auth/resetPassword", {email, password: inputs.password});
          setDone(true);
          console.log("done")
        } catch (err) {
          setErr(err.response.data);
        }
    };
      
    return (
        <div className="forgotPassword">
            <div className="card">
                <button className = "language-toggle" onClick={langToggle}>
                    {language === "es" ?
                    <img src={MX} className="flag"/> : <img src={US} className="flag"/>
                    }
                </button>
                {done === false ?
                    <div className="right">
                        <h1>{t('resetPassword.resetPassword')}</h1>
                        <div className="text">{t('resetPassword.enterPassword')}</div>
                        <form className="form reset-form">
                            {visible === true ? (
                                <div className="passwords">
                                    <input placeholder="New password" type="text" name="password" onChange={handleChange} />
                                    <VisibilityIcon className="eye" onClick={() => setVisible(!visible)} />
                                </div>
                                ) : 
                                (
                                <div className="passwords">
                                    <input placeholder="New password" type="password" name="password" onChange={handleChange} />
                                    <VisibilityOffIcon className="eye" onClick={() => setVisible(!visible)} />
                                </div>
                                )
                            }
                            {visible === true ? 
                                (<div className="passwords">
                                    <input placeholder="Confirm new password" type="text" name="confirmPassword" onChange={handleChange} />
                                    <VisibilityIcon className="eye" onClick={() => setVisible(!visible)} />
                                </div>) 
                            : 
                                (<div className="passwords">
                                    <input placeholder="Confirm new password" type="password" name="confirmPassword" onChange={handleChange} />
                                    <VisibilityOffIcon className="eye" onClick={() => setVisible(!visible)} />
                                </div>)
                            }
                            {err && <div className="notice" style={{color: 'red'}}>{err}</div>}
                            
                        </form>
                        <div className="buttons">
                            <button className="primary" onClick={(e) => handleClick()}>{t('resetPassword.change')}</button>
                            <Link to="/login">
                                <button style={{fontWeight: "normal"}}>{t('login.login')}</button>
                            </Link>
                        </div>
                    </div>
                :
                    <div className="right">
                        <div style={{display: "flex", gap: 15}}>
                            <h1>Thank You!</h1>
                            <CheckCircleIcon style={{color: "green", fontSize: "2.8em"}}/>
                        </div>
                        <div className="text">Your password has been successfully reset.</div>
                        <Link to="/login">
                            <button>Return to Login</button>
                        </Link>
                    </div>
                }
            </div>
        </div>
    )
}

export default ResetPassword;

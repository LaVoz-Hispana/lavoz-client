import { React, useContext, useState, useRef, useEffect } from "react";
import "./otpInput.scss";
import { RecoveryContext } from "../../context/recoveryContext";
import { makeRequest } from "../../axios";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import US from "../../assets/us.png";
import MX from "../../assets/mx.png";
import { LanguageContext } from "../../context/language";

const OTPInput = () => {
  const [err, setErr] = useState(null);
  const [sent, setSent] = useState(false);
  const { email, otp, verifyOTP } = useContext(RecoveryContext);
  const [timerCount, setTimer] = useState(60);
  const [OTPinput, setOTPinput] = useState(["", "", "", ""]);
  const [disable, setDisable] = useState(true);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const { t } = useTranslation([]);
  const { language, langToggle } = useContext(LanguageContext);

  const handlePress = () => {
    console.log(sent);
    setSent(true);
  };

  function resendOTP() {
    if (disable) return;
    makeRequest
      .post("/auth/send_recovery_email", {
        OTP: otp,
        recipient_email: email,
      })
      .then(() => setDisable(true))
      .then(() =>
        alert("A new OTP has succesfully been sent to your email.")
      )
      .then(() => setTimer(60))
      .catch(console.log);
  }

  const verify = async (e) => {
    e.preventDefault();
    try {
      const verificationResult = verifyOTP(OTPinput.join(""));
      if (verificationResult === 0) {
        // Successful verification, navigate to resetPassword
        navigate("/resetPassword");
      } else {
        alert(
          "The code you have entered is not correct, try again or re-send the link"
        );
      }
    } catch {
      setErr("Token is incorrect.");
    }
  }

  const handleInputChange = (index, value) => {
    const newInput = [...OTPinput];
    newInput[index] = value;
    setOTPinput(newInput);
    if (value === "") {
      // Move focus to the previous input field if the current input is empty
      if (index > 0) {
        inputRefs.current[index - 1].focus();
      }
    } else {
      // Move focus to the next input field if the current input is not empty
      if (index < 3) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && index > 0 && OTPinput[index] === "") {
      inputRefs.current[index - 1].focus();
    }
  };

  useEffect(() => {
    let interval = setInterval(() => {
      setTimer((lastTimerCount) => {
        lastTimerCount <= 1 && clearInterval(interval);
        if (lastTimerCount <= 1) setDisable(false);
        if (lastTimerCount <= 0) return lastTimerCount;
        return lastTimerCount - 1;
      });
    }, 1000); //each count lasts for a second
    //cleanup the interval on complete
    return () => clearInterval(interval);
  }, [disable]);

  return (
    <div className="otpInput">
      <div className="card">
        <button className = "language-toggle" onClick={langToggle}>
            {language === "es" ?
            <img src={MX} className="flag"/> : <img src={US} className="flag"/>
            }
        </button>
        <div className="right">
          <h1>{t('resetPassword.emailVerification')}</h1>
          <div className="text">{t('resetPassword.enterCode')}</div>
          <form>
              <div className="row">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="input-box">
                    <input
                      ref={(el) => (inputRefs.current[index] = el)}
                      maxLength="1"
                      className="w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl border border-gray-200 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700"
                      type="text"
                      value={OTPinput[index]}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                    ></input>
                  </div>
                ))}
              </div>

              <button onClick={verify}>
                {t('resetPassword.verify')}
              </button>

              <div className="didnt-receive">
                <p>{t('resetPassword.didntReceive')}</p>{" "}
                <a
                  className="resend"
                  style={{
                    color: disable ? "gray" : "blue",
                    cursor: disable ? "none" : "pointer",
                    textDecorationLine: disable ? "none" : "underline",
                  }}
                  onClick={() => resendOTP()}
                >
                  {disable
                    ? `${t('resetPassword.resendCodeIn')} ${timerCount}s`
                    : `${t('resetPassword.resendCode')}`}
                </a>
              </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPInput;

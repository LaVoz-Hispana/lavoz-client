import { createContext, useEffect, useState } from "react";
import { makeRequest } from "../axios";

export const RecoveryContext = createContext();

export const RecoveryContextProvider = ({ children }) => {
  const [email, setEmail] = useState(null);
  const [otp, setOTP] = useState(null);
  const [valid, setValid] = useState(
    JSON.parse(localStorage.getItem("valid")) || false,
  );

  const verifyOTP = (OTPinput) => {
    if (OTPinput == otp) {
      setValid(true);
      console.log("valid");
      return 0;
    }
    return 1;
  };

  useEffect(() => {
    localStorage.setItem("valid", JSON.stringify(valid));
  }, [valid]);

  return (
    <RecoveryContext.Provider
      value={{ valid, setOTP, setEmail, email, verifyOTP, setValid }}
    >
      {children}
    </RecoveryContext.Provider>
  );
};

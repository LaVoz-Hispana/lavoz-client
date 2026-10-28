import { createContext, useEffect, useState } from "react";
import { makeRequest } from "../axios";
import { useQueryClient } from "@tanstack/react-query";

export const AuthContext = createContext();

const sessionUser = (value) => {
  if (!value) return null;
  const { password, confirmPassword, ...user } = value;
  return user;
};

const storedUser = () => {
  try {
    return sessionUser(JSON.parse(localStorage.getItem("user")));
  } catch {
    return null;
  }
};

export const AuthContextProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(storedUser);

  const login = async (inputs) => {
    const res = await makeRequest.post("/auth/login", inputs, {
      withCredentials: true,
    });

    queryClient.clear();
    setCurrentUser(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));
    if (res.data.token) {
      localStorage.setItem("accessToken", res.data.token);
    }
  };

  const updateUser = (userData) => {
    const user = sessionUser(userData);
    queryClient.clear();
    setCurrentUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const clearUser = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    setCurrentUser(null);
    queryClient.clear();
  };

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("user", JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    const clearSession = () => {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      setCurrentUser(null);
      queryClient.clear();
    };
    window.addEventListener("poststation:session-cleared", clearSession);
    const syncSession = (event) => {
      if (event.key !== "user" && event.key !== null) return;
      queryClient.clear();
      setCurrentUser(storedUser());
    };
    window.addEventListener("storage", syncSession);
    return () => {
      window.removeEventListener("poststation:session-cleared", clearSession);
      window.removeEventListener("storage", syncSession);
    };
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser: updateUser,
        updateUser,
        clearUser,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

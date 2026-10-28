import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthContextProvider } from "./context/authContext";
import { DarkModeContextProvider } from "./context/darkModeContext";
import i18n from "./i18n";
import { I18nextProvider } from "react-i18next";
import { RecoveryContextProvider } from "./context/recoveryContext";
import { LanguageContextProvider } from "./context/language";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <LanguageContextProvider>
        <QueryClientProvider client={queryClient}>
          <DarkModeContextProvider>
            <AuthContextProvider>
              <RecoveryContextProvider>
                <App />
              </RecoveryContextProvider>
            </AuthContextProvider>
          </DarkModeContextProvider>
        </QueryClientProvider>
      </LanguageContextProvider>
    </I18nextProvider>
  </React.StrictMode>,
);

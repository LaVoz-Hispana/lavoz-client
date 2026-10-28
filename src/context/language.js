import { createContext, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

export const LanguageContext = createContext();

export const LanguageContextProvider = ({ children }) => {
  // i18next is the single source of truth. Keeping a second React state here
  // allowed the toggle icon and translated components to get out of sync.
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || "en").split(
    "-",
  )[0];

  const setLanguage = useCallback(
    (nextLanguage) => i18n.changeLanguage(nextLanguage),
    [i18n],
  );

  const langToggle = useCallback(
    () => setLanguage(language === "es" ? "en" : "es"),
    [language, setLanguage],
  );

  const value = useMemo(
    () => ({ language, setLanguage, langToggle }),
    [language, setLanguage, langToggle],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

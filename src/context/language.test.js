import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { LanguageContext, LanguageContextProvider } from "./language";

const LanguageControls = () => {
  const { language, langToggle } = useContext(LanguageContext);
  const { t } = useTranslation();

  return (
    <>
      <button onClick={langToggle}>toggle</button>
      <span data-testid="language">{language}</span>
      <span data-testid="first-component">{t("common.cancel")}</span>
    </>
  );
};

const SecondTranslatedComponent = () => {
  const { t } = useTranslation();
  return (
    <>
      <span data-testid="second-component">{t("common.back")}</span>
      <span data-testid="student-talent">{t("talent.studentTalent")}</span>
      <span data-testid="student-services">{t("talent.studentServices")}</span>
    </>
  );
};

describe("LanguageContextProvider", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  test("updates the language state and every translated component together", async () => {
    render(
      <LanguageContextProvider>
        <LanguageControls />
        <SecondTranslatedComponent />
      </LanguageContextProvider>,
    );

    expect(screen.getByTestId("language").textContent).toBe("en");
    expect(screen.getByTestId("first-component").textContent).toBe("Cancel");
    expect(screen.getByTestId("second-component").textContent).toBe("Back");

    fireEvent.click(screen.getByText("toggle"));

    await waitFor(() => {
      expect(screen.getByTestId("language").textContent).toBe("es");
    });
    await waitFor(() => {
      expect(screen.getByTestId("first-component").textContent).toBe(
        "Cancelar",
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId("second-component").textContent).toBe("Volver");
    });
    await waitFor(() => {
      expect(screen.getByTestId("student-talent").textContent).toBe(
        "Talento Estudiantil",
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId("student-services").textContent).toBe(
        "Servicios Estudiantiles",
      );
    });
    await waitFor(() => {
      expect(window.localStorage.getItem("i18nextLng")).toBe("es");
    });
  });
});

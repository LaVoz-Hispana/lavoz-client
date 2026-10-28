import { useTranslation } from "react-i18next";
import StudyGroups from "./StudyGroups";
import RecTeams from "./RecTeams";
import OrgDiscords from "./OrgDiscords";
import "./socialHub.scss";

const SocialHub = ({ socialView, setSocialView }) => {
  const { t } = useTranslation();
  const currentView = socialView || "hub";
  const setCurrentView = setSocialView || (() => {});

  return (
    <div className="social-hub">
      <div className="social-container">
        {currentView === "hub" && (
          <>
            <div className="social-header">
              <h2>{t("socialHub.title")}</h2>
              <p className="tagline">{t("socialHub.tagline")}</p>
            </div>

            <div className="social-buttons">
              <div className="social-button">
                <button
                  className="main-button"
                  onClick={() => setCurrentView("studyGroups")}
                >
                  <h3>{t("socialHub.studyGroups")}</h3>
                  <p>{t("socialHub.studyGroupsDesc")}</p>
                </button>
              </div>

              <div className="social-button">
                <button
                  className="main-button"
                  onClick={() => setCurrentView("recTeams")}
                >
                  <h3>{t("socialHub.recTeams")}</h3>
                  <p>{t("socialHub.recTeamsDesc")}</p>
                </button>
              </div>

              <div className="social-button">
                <button
                  className="main-button"
                  onClick={() => setCurrentView("orgDiscords")}
                >
                  <h3>{t("socialHub.discords")}</h3>
                  <p>{t("socialHub.discordsDesc")}</p>
                </button>
              </div>
            </div>
          </>
        )}

        {currentView === "studyGroups" && (
          <StudyGroups onBack={() => setCurrentView("hub")} />
        )}
        {currentView === "recTeams" && (
          <RecTeams onBack={() => setCurrentView("hub")} />
        )}
        {currentView === "orgDiscords" && (
          <OrgDiscords onBack={() => setCurrentView("hub")} />
        )}
      </div>
    </div>
  );
};

export default SocialHub;

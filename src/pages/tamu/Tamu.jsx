import Posts from "../../components/posts/Posts";
import Share from "../../components/share/Share";
import TamuNavbar from "../../components/tamu/TamuNavbar";
import AggieMeals from "./AggieMeals";
import AggieConsulting from "./AggieConsulting";
import "./tamu.scss";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const Tamu = () => {
  const { t, i18n } = useTranslation();
  const isEnglish = (i18n.resolvedLanguage || i18n.language).startsWith("en");
  const [selectedCategory, setSelectedCategory] = useState("tamu");
  const [currentView, setCurrentView] = useState("home");

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
  };

  const getPostCategories = () => {
    if (selectedCategory === "tamu") {
      return ["tamu", "games", "advice", "fans", "deals"];
    }
    return selectedCategory;
  };

  return (
    <div className="tamu">
      <div className="background">
        <h1 className="title">{t("tamu.tamu")}</h1>
        <span>{t("tamu.desc")}</span>
      </div>

      <TamuNavbar currentView={currentView} setCurrentView={setCurrentView} />

      {currentView === "home" && (
        <div className="news-container">
          <Share categ={null} />
          <div className="section" style={{ marginTop: 50 }}>
            {isEnglish ? (
              <iframe
                title="tamu-english"
                width="100%"
                height="440"
                src="https://rss.app/embed/v1/carousel/_Vla9Lh2zzuM6diy3"
                frameborder="0"
              ></iframe>
            ) : (
              <iframe
                title="tamu-spanish"
                width="100%"
                height="440"
                src="https://rss.app/embed/v1/carousel/_N0wzxrQ4tvROvxUB"
                frameborder="0"
              ></iframe>
            )}
            <h3 className="subtitle">{t("tamu.filter")}</h3>
            <div className="categories">
              <button
                className={
                  selectedCategory === "tamu" ? "widget" : "widget inactive"
                }
                onClick={() => handleCategoryPress("tamu")}
              >
                {t("categories.tamu")}
              </button>
              <button
                className={
                  selectedCategory === "games" ? "widget" : "widget inactive"
                }
                onClick={() => handleCategoryPress("games")}
              >
                {t("categories.games")}
              </button>
              <button
                className={
                  selectedCategory === "advice" ? "widget" : "widget inactive"
                }
                onClick={() => handleCategoryPress("advice")}
              >
                {t("categories.advice")}
              </button>
              <button
                className={
                  selectedCategory === "fans" ? "widget" : "widget inactive"
                }
                onClick={() => handleCategoryPress("fans")}
              >
                {t("categories.fans")}
              </button>
              <button
                className={
                  selectedCategory === "deals" ? "widget" : "widget inactive"
                }
                onClick={() => handleCategoryPress("deals")}
              >
                {t("categories.deals")}
              </button>
            </div>
            <Posts categories={getPostCategories()} />
          </div>
        </div>
      )}

      {currentView === "meals" && <AggieMeals />}
      {currentView === "consulting" && <AggieConsulting />}
    </div>
  );
};

export default Tamu;

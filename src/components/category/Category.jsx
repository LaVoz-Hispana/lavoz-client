import Posts from "../posts/Posts";
import Share from "../share/Share";
import "./category.scss";
import DisabledByDefaultIcon from "@mui/icons-material/DisabledByDefault";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const Category = () => {
  const { t, i18n } = useTranslation();
  // Get the current pathname from the URL
  const pathname = window.location.pathname;

  // Split the pathname into an array using the slash as a delimiter
  const pathArray = pathname.split("/");

  // Get everything after the first element (which is an empty string due to the leading slash)
  const routeName = pathArray[1];

  return (
    <div className="category">
      <div className="background">
        <h1 className="title">{t("categories.greatThings")}</h1>
        <div className="text-container">
          <div className="text-content">
            <span>{t("otherPages.greatThings")}</span>
          </div>
        </div>
      </div>
      <div className="great-container">
        <div>
          <Share categ={"greatThings"} />
          <Posts categories={[routeName]} />
        </div>
      </div>
    </div>
  );
};

export default Category;

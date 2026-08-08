import Posts from "../../components/posts/Posts"
import "./adpage.scss"
import {  useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import PostAd from "../../components/submitAd/postAd";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/authContext";
import Ads from "../../components/ad/Ads";
import { isAdmin } from "../../utils/admin";

const AdPage = () => {
  const { t, i18n } = useTranslation();
  const currentUser = useContext(AuthContext);

  return (
    <div className="adpage">
      {currentUser && currentUser.currentUser.account_type != 'personal' && 
        <div>
          <div className="background">
              <h1 className="title">{t('sections.postAd')}</h1>
              <div className="text-container">
                  <div className="text-content">
                      <span>{t('otherPages.postAd')}</span>
                  </div>
              </div>
          </div>
          <div className = "market-container">
            <PostAd/>
            {currentUser && isAdmin(currentUser.currentUser) &&
            <div>
              <h1>{t('ad.approveAds')}</h1>
              <Ads/>
            </div>
            }
          </div>
        </div>
      }
    </div>
  )
}

export default AdPage;

import Posts from "../../components/posts/Posts"
import Share from "../../components/share/Share"
import "./news.scss"
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useTranslation } from "react-i18next";

const News = () => {
  const { t, i18n } = useTranslation();
  const isEnglish = (i18n.resolvedLanguage || i18n.language).startsWith('en');
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const getPostCategories = () => {
    if (selectedCategory === "all") {
      return ["local", "global", "usa", "latam"]
    } else {
      return selectedCategory;
    }
  }

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="news">
        <div className="background">
            <h1 className="title">{t('categories.news')}</h1>
            <span>{t('otherPages.news')}</span>
        </div>
        <div className="news-container">
            <Share categ={null}/>
            <div className="section">
                <h3 className="subtitle">{t('otherPages.filterNews')}</h3>
                <div className="categories">
                  <button className={selectedCategory === "all" ? "widget" : "widget inactive"} onClick={() => handleCategoryPress("all")}>
                      {t('categories.all')}
                  </button>
                  <button className={selectedCategory === "local" ? "widget" : "widget inactive"}  onClick = {() => handleCategoryPress('local')}>
                      {t('categories.local')}
                  </button>
                  <button className={selectedCategory === "usa" ? "widget" : "widget inactive"}   onClick = {() => handleCategoryPress('usa')}>
                      {t('categories.us')}
                  </button>
                  <button className={selectedCategory === "latam" ? "widget" : "widget inactive"} onClick = {() => handleCategoryPress('latam')}>
                      {t('categories.latam')}
                  </button>
                  <button className={selectedCategory === "global" ? "widget" : "widget inactive"} onClick = {() => handleCategoryPress('global')}>
                      {t('categories.global')}
                  </button>
                </div>
                {selectedCategory === "all" ? 
                  <div>
                    {isEnglish ?
                      <iframe title="news-english" width="100%" height="440"  src="https://rss.app/embed/v1/carousel/_uyYrMmgWWaF69e0M" frameborder="0"></iframe>
                    :
                      <iframe title="news-spanish" width="100%" height="440"  src="https://rss.app/embed/v1/carousel/_EeLNdyLLpuYAovrj" frameborder="0"></iframe>
                    }
                  </div>
              : selectedCategory === "local" ? 
                  <div>
                    {isEnglish ?
                      <iframe title="local-english" width="100%" height="440" src="https://rss.app/embed/v1/carousel/_eG80xEQg7RyXilCP" frameborder="0"></iframe>
                    :
                    <iframe title="local-spanish" width="100%" height="440" src="https://rss.app/embed/v1/carousel/_IyVFQ0LMLGfzPeU6" frameborder="0"></iframe>
                    } 
                  </div>
              : selectedCategory === "usa" ?
                  <div>
                    {isEnglish ?
                    <iframe title="usa-eng" width="100%" height="440"  src="https://rss.app/embed/v1/carousel/Ws0LbjfbVeJMjKvl" frameborder="0"></iframe>
                    :
                    <iframe title="usa-esp" width="100%" height="440" src="https://rss.app/embed/v1/carousel/_aTMU8Kx8u0qFDdBx" frameborder="0"></iframe> 
                    }
                  </div>
              : selectedCategory === "latam" ? 
                    <div>
                    {isEnglish ?
                      <iframe title="latam-eng" width="100%" height="440"  src="https://rss.app/embed/v1/carousel/crIC2v0crrv8tVWM" frameborder="0"></iframe>
                      : <iframe title="latam-esp" width="100%" height="440"  src="https://rss.app/embed/v1/carousel/_uCsCcL6mlnK6l0v6" frameborder="0"></iframe>
                    }
                    </div>
              : selectedCategory === "global" ?
                  <div>
                    {isEnglish ?
                    <iframe title="global-english" width="100%" height="440"  src="https://rss.app/embed/v1/carousel/_tPMf7bPyXT0l0aJ2" frameborder="0"></iframe>
                    :
                    <iframe title="global-spanish" width="100%" height="440"  src="https://rss.app/embed/v1/carousel/_cfOq3Y7xU4J00heM" frameborder="0"></iframe>
                    } 
                  </div>
              : <div/>
              }
                <Posts categories={getPostCategories()}/>
            </div>
        </div>
    </div>
  )
}

export default News

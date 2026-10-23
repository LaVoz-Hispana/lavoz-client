import Posts from "../../components/posts/Posts"
import Share from "../../components/share/Share"
import "./jobs.scss"
import {  useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import SubmitJob from "../../components/jobs/SubmitJob";
import { AuthContext } from "../../context/authContext";
import Job from "../../components/jobs/Job";
import { useTranslation } from "react-i18next";

const Jobs = () => {
  const { t } = useTranslation();
  const { currentUser } = useContext(AuthContext);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
  };

  const { isLoading: isJobsLoading, error: jobError, data: jobData } = useQuery({
    queryKey: ["jobs", currentUser?.id || "anonymous"],
    queryFn: () => makeRequest.get("/posts/jobs").then((res) => {return res.data})
  });

  let filteredData;
  if (jobData && !isJobsLoading) {
    if (selectedCategory !== "all") {
      // Filter posts based on the provided categories
      filteredData = jobData.filter((job) => selectedCategory === job.category);
    } else {
      // If no categories are provided, show all posts
      filteredData = jobData;
    }
  }

  const jobCategories = ["construction", "restaurant", "general", "students", "office", "sales", "temporary"];

  return (
    <div className="jobs">
        <div className="background">
            <h1 className="title">{t('categories.jobs')}</h1>
            <div className="text-container">
                <div className="text-content">
                    <span>{t('jobs.desc')}</span>
                </div>
            </div>
        </div>
        <div className="market-container">
            <div>
            <div className="centered">
              {
                !currentUser || currentUser.account_type !== "business" ? <div/> 
                : 
                <SubmitJob/>
              }
            </div>
            <h3 className="subtitle">{t('jobs.find')}</h3>
            <h4 className="smaller">{t('jobs.filter')}</h4>
            <div className="categories">
                <button className={selectedCategory === "all" ? "widget" : "widget inactive"} onClick={() => handleCategoryPress("all")}>
                    {t('categories.all')}
                </button>
                <button className={selectedCategory === "construction" ? "widget" : "widget inactive"} onClick={() => handleCategoryPress("construction")}>
                    {t('categories.construction')}
                </button>
                <button className={selectedCategory === "restaurant" ? "widget" : "widget inactive"} onClick={() => handleCategoryPress("restaurant")}>
                    {t('jobs.restaurant')}
                </button>
                <button className={selectedCategory === "general" ? "widget" : "widget inactive"} onClick={() => handleCategoryPress("general")}>
                    {t('categories.general')}
                </button>
                <button className={selectedCategory === "students" ? "widget" : "widget inactive"} onClick={() => handleCategoryPress("students")}>
                    {t('jobs.students')}
                </button>
                <button className={selectedCategory === "office" ? "widget" : "widget inactive"} onClick={() => handleCategoryPress("office")}>
                    {t('jobs.office')}
                </button>
                <button className={selectedCategory === "sales" ? "widget" : "widget inactive"} onClick={() => handleCategoryPress("sales")}>
                    {t('jobs.sales')}
                </button>
                <button className={selectedCategory === "temporary" ? "widget" : "widget inactive"} onClick={() => handleCategoryPress("temporary")}>
                    {t('jobs.temporary')} 
                </button>
            </div>
            <div className="grid">
                    {!isJobsLoading && filteredData && filteredData.map((post) => 
                        <Job job={post} key={post.id}/>
                    )}
                </div>
                <div className="section">
                    <h3 className="subtitle">Posts</h3>
                    <div style={{marginBottom: 20}}/>
                    <Share categ={null}/>
                    <Posts categories={jobCategories}/>
                </div> 
            </div>
        </div>
    </div>
  )
}

export default Jobs;

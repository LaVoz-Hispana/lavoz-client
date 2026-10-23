import Posts from "../../components/posts/Posts"
import Share from "../../components/share/Share"
import "./events.scss"
import {  useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import SubmitEvent from "../../components/event/SubmitEvent";
import Event from "../../components/event/Event";
import { AuthContext } from "../../context/authContext";
import { useTranslation } from "react-i18next";

const Events = () => {
  const { t } = useTranslation();
  const { currentUser } = useContext(AuthContext);

  const { isLoading, data } = useQuery({
      queryKey: ["events", currentUser?.id || "anonymous"],
      queryFn: () => makeRequest.get("/posts/events").then((res) => {return res.data})
  });

  return (
    <div className="events">
        <div className="background">
            <h1 className="title">{t('categories.events')}</h1>
            <div className="text-container">
                <div className="text-content">
                    <span>{t('events.desc')}</span>
                </div>
            </div>
        </div>
        <div className="market-container">
            <div>
                <div className="centered">
                    <SubmitEvent categ={null} key="submit-event"/>
                </div>
                <h3 className="subtitle">{t('events.upcoming')}</h3>
                <div className="grid">
                    {!isLoading && data && data.map((post) => 
                        <Event event={post} key={post.id}/>
                    )}
                </div>
                <div className="section">
                    <h3 className="subtitle">Posts</h3>
                    <div style={{marginBottom: 20}}/>
                    <Share key="share-event" categ={"events"}/>
                    <Posts categories={["events"]}/>
                </div>  
            </div>   
        </div>
    </div>
  )
}

export default Events;

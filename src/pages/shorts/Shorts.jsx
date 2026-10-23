import Posts from "../../components/posts/Posts"
import ShareShort from "../../components/shorts/ShareShort"
import Short from "../../components/shorts/Short";
import "./shorts.scss"
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { makeRequest } from "../../axios";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../context/authContext";

const Shorts = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("tamu");
  const { currentUser } = useContext(AuthContext);

  const queryClient = useQueryClient();
  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
  };

  const { isLoading, error, data } = useQuery({
    queryKey: ["shorts", currentUser?.id || "anonymous"],
    queryFn: () => makeRequest.get("/posts/shorts").then((res) => {return res.data})
  });

  return (
    <div className="shorts">
        <div className="background">
            <h1 className="title">{t('sections.shorts')}</h1>
            <span>{t('shorts.desc')}</span>
        </div>
        <div className="news-container">
          <ShareShort categ={null}/>
            { isLoading || error || !data ? "loading" :
              <div className="shorts-grid">
                {data.map((short) => <Short short={short}/>)}
              </div>
            }
        </div>
    </div>
  )
}

export default Shorts;

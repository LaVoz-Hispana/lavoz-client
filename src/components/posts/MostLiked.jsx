import Post from "../post/Post";
import "./posts.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useTranslation } from "react-i18next";

const MostLiked = () => {
  const { t, i18n } = useTranslation();
  const { isLoading, error, data } = useQuery({
    queryKey: ["topPosts"],
    queryFn: () =>
      makeRequest.get("/posts/top").then((res) => {
        return res.data;
      }),
  });

  return (
    <div>
      {data && !isLoading && !error && data.length > 0 && (
        <h3 className="title">{t("sections.topPosts")}</h3>
      )}
      <div className="grid">
        {error
          ? "Something went wrong!"
          : isLoading || !data
            ? "loading"
            : data.map((post) => <Post post={post} key={post.id} />)}
      </div>
    </div>
  );
};

export default MostLiked;

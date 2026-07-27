import "./projectPosts.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useTranslation } from "react-i18next";
import Post from "../post/Post";

const ProjectPosts = ({ projectId }) => {
  const { t } = useTranslation();
  const { isLoading, error, data: posts } = useQuery({
    queryKey: ["projectPosts", String(projectId)],
    queryFn: () => makeRequest.get(`/posts/project/${projectId}`).then((res) => res.data),
    enabled: !!projectId,
  });

  return (
    <section className="project-posts">
      <h2>{t("projectPost.activityFeed")}</h2>
      {isLoading && <span className="state">Loading...</span>}
      {error && <span className="state">Unable to load project posts.</span>}
      {!isLoading && !error && posts?.length === 0 && (
        <span className="state">{t("projectPost.noProjectPosts")}</span>
      )}
      {!isLoading && !error && posts?.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </section>
  );
};

export default ProjectPosts;

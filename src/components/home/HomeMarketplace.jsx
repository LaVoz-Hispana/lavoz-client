import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import CategoryIcon from "@mui/icons-material/Category";
import { makeRequest } from "../../axios";
import { serviceCategoryIcons } from "../../utils/serviceCategoryIcons";
import ProjectCard from "../project/ProjectCard";
import ServiceCard from "../service/ServiceCard";
import { AuthContext } from "../../context/authContext";

const projectStatuses = [
  ["open", "projects.open"], ["in_escrow", "projects.inEscrow"],
  ["closed", "projects.closed"], ["all", "home.allProjects"],
];

export default function HomeMarketplace() {
  const { t } = useTranslation();
  const { currentUser } = useContext(AuthContext);
  const [projectStatus, setProjectStatus] = useState("open");
  const [serviceCategory, setServiceCategory] = useState("all");
  const projects = useQuery({ queryKey: ["projects"], queryFn: () => makeRequest.get("/projects").then((res) => res.data), enabled: Boolean(projectStatus) });
  const services = useQuery({ queryKey: ["services", currentUser?.id || "anonymous"], queryFn: () => makeRequest.get("/services").then((res) => res.data), enabled: Boolean(serviceCategory) });
  const categories = useQuery({ queryKey: ["serviceCategories"], queryFn: () => makeRequest.get("/categories").then((res) => res.data) });

  const categoryOptions = [{ slug: "all", name: t("talent.allCategories") }, ...(categories.data || [])];
  const visibleProjects = (projects.data || []).filter((project) => projectStatus === "all" || project.status === projectStatus);
  const visibleServices = (services.data || []).filter((service) => serviceCategory === "all" || service.categorySlug === serviceCategory);
  const mixedActivity = [
    ...(projectStatus ? visibleProjects.map((item) => ({ kind: "project", item })) : []),
    ...(serviceCategory ? visibleServices.map((item) => ({ kind: "service", item })) : []),
  ].sort((a, b) => {
    const newestA = new Date(a.item.updatedAt || a.item.createdAt || 0).getTime();
    const newestB = new Date(b.item.updatedAt || b.item.createdAt || 0).getTime();
    return newestB - newestA;
  });
  const activityLoading = (projectStatus && projects.isLoading) || (serviceCategory && services.isLoading);
  const hasActiveFilter = Boolean(projectStatus || serviceCategory);

  return (
    <section className="home-projects-section home-marketplace" aria-labelledby="home-marketplace-heading">
      <div className="home-card-header marketplace-heading">
        <div>
          <h2 id="home-marketplace-heading">{t("home.exploreMarketplace")}</h2>
          <p>{t("home.activitySubtitle")}</p>
        </div>
      </div>

      <div id="home-activity-filters" className="activity-filter-rows">
        <div className="activity-filter-row project-filter-row">
          <p>{t("home.localProjects")}</p>
          <div className="marketplace-status-filters" role="group" aria-label={t("home.filterProjects")}>
            {projectStatuses.map(([status, label]) => (
              <button key={status} type="button" className={status} aria-pressed={projectStatus === status}
                aria-controls="home-marketplace-results"
                onClick={() => setProjectStatus((current) => current === status ? null : status)}>{t(label)}</button>
            ))}
          </div>
        </div>

        <div className="activity-filter-row marketplace-category-filter">
          <div className="service-filter-heading">
            <p>{t("home.localServices")}</p>
            <span className="selected-service-category" aria-live="polite">
              {categoryOptions.find(({ slug }) => slug === serviceCategory)?.name || ""}
            </span>
          </div>
          <div className="service-bubble-cluster" role="group" aria-label={t("talent.filterServices")}>
            {categoryOptions.map((category, index) => {
              const Icon = serviceCategoryIcons[category.slug] || CategoryIcon;
              return <button type="button" key={category.slug}
                className={`service-category-bubble bubble-color-${index % 5}`}
                aria-label={category.name} aria-pressed={serviceCategory === category.slug}
                aria-controls="home-marketplace-results"
                onClick={() => setServiceCategory((current) => current === category.slug ? null : category.slug)}>
                <Icon aria-hidden="true" /><span className="bubble-tooltip" aria-hidden="true">{category.name}</span>
              </button>;
            })}
          </div>
          {categories.isError && <span role="alert" className="home-projects-state">{t("home.categoriesError")}</span>}
        </div>
      </div>

      <div id="home-marketplace-results" className="home-activity-results" aria-busy={activityLoading}>
        {activityLoading && <p className="home-projects-state" role="status">{t("home.loadingMarketplace")}</p>}
        {projectStatus && projects.isError && <p className="home-projects-state" role="alert">{t("home.projectsError")} <button type="button" onClick={() => projects.refetch()}>{t("home.retry")}</button></p>}
        {serviceCategory && services.isError && <p className="home-projects-state" role="alert">{t("home.servicesError")} <button type="button" onClick={() => services.refetch()}>{t("home.retry")}</button></p>}
        {hasActiveFilter && !activityLoading && mixedActivity.length === 0 && <p className="home-projects-state">{t("home.noMatchingActivity")}</p>}
        <div className="home-projects-feed mixed-activity-feed">
          {mixedActivity.map(({ kind, item }) => kind === "project"
            ? <ProjectCard key={`project-${item.id}`} project={item} />
            : <ServiceCard key={`service-${item.id}`} service={item} />)}
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import CategoryIcon from "@mui/icons-material/Category";
import { makeRequest } from "../../axios";
import { serviceCategoryIcons } from "../../utils/serviceCategoryIcons";
import ProjectCard from "../project/ProjectCard";
import ServiceCard from "../service/ServiceCard";

const projectStatuses = [
  ["open", "projects.open"], ["in_escrow", "projects.inEscrow"],
  ["closed", "projects.closed"], ["all", "home.allProjects"],
];

export default function HomeMarketplace() {
  const { t } = useTranslation();
  const [sources, setSources] = useState({ projects: true, services: true });
  const [projectStatus, setProjectStatus] = useState("open");
  const [serviceCategory, setServiceCategory] = useState("all");
  const projects = useQuery({ queryKey: ["projects"], queryFn: () => makeRequest.get("/projects").then((res) => res.data), enabled: sources.projects });
  const services = useQuery({ queryKey: ["services"], queryFn: () => makeRequest.get("/services").then((res) => res.data), enabled: sources.services });
  const categories = useQuery({ queryKey: ["serviceCategories"], queryFn: () => makeRequest.get("/categories").then((res) => res.data), enabled: sources.services });

  const categoryOptions = [{ slug: "all", name: t("talent.allCategories") }, ...(categories.data || [])];
  const visibleProjects = (projects.data || []).filter((project) => projectStatus === "all" || project.status === projectStatus);
  const visibleServices = (services.data || []).filter((service) => serviceCategory === "all" || service.categorySlug === serviceCategory);
  const mixedActivity = [
    ...(sources.projects ? visibleProjects.map((item) => ({ kind: "project", item })) : []),
    ...(sources.services ? visibleServices.map((item) => ({ kind: "service", item })) : []),
  ].sort((a, b) => {
    const newestA = new Date(a.item.updatedAt || a.item.createdAt || 0).getTime();
    const newestB = new Date(b.item.updatedAt || b.item.createdAt || 0).getTime();
    return newestB - newestA;
  });
  const activityLoading = (sources.projects && projects.isLoading) || (sources.services && services.isLoading);
  const sourceCount = Number(sources.projects) + Number(sources.services);
  const toggleSource = (source) => {
    if (sources[source] && sourceCount === 1) return;
    setSources((current) => ({ ...current, [source]: !current[source] }));
  };

  return (
    <section className="home-projects-section home-marketplace" aria-labelledby="home-marketplace-heading">
      <div className="home-card-header marketplace-heading">
        <div>
          <h2 id="home-marketplace-heading">{t("home.exploreMarketplace")}</h2>
          <p>{t("home.activitySubtitle")}</p>
        </div>
      </div>

      <div id="home-activity-filters" className="activity-filter-panel">
        <div className="activity-source-filter" role="group" aria-label={t("home.activityTypes")}>
          <p>{t("home.showActivityFrom")}</p>
          <div>{["projects", "services"].map((source) => (
            <button key={source} type="button" aria-pressed={sources[source]}
              aria-disabled={sources[source] && sourceCount === 1} onClick={() => toggleSource(source)}>
              <span className="source-check" aria-hidden="true">{sources[source] ? "✓" : ""}</span>
              {t(source === "projects" ? "home.localProjects" : "home.localServices")}
            </button>
          ))}</div>
        </div>

        {sources.projects && <div className="activity-filter-group project-filter-group">
          <p>{t("home.projectStatus")}</p>
          <div className="marketplace-status-filters" role="group" aria-label={t("home.filterProjects")}>
            {projectStatuses.map(([status, label]) => (
              <button key={status} type="button" className={status} aria-pressed={projectStatus === status}
                onClick={() => setProjectStatus(status)}>{t(label)}</button>
            ))}
          </div>
        </div>}

        {sources.services && <div className="activity-filter-group marketplace-category-filter">
          <p>{t("talent.filterServices")}</p>
          <div className="service-bubble-cluster" role="group" aria-label={t("talent.filterServices")}>
            {categoryOptions.map((category, index) => {
              const Icon = serviceCategoryIcons[category.slug] || CategoryIcon;
              return <button type="button" key={category.slug}
                className={`service-category-bubble bubble-color-${index % 5}`}
                aria-label={category.name} aria-pressed={serviceCategory === category.slug}
                aria-controls="home-marketplace-results" onClick={() => setServiceCategory(category.slug)}>
                <Icon aria-hidden="true" /><span className="bubble-tooltip" aria-hidden="true">{category.name}</span>
              </button>;
            })}
          </div>
          <span className="selected-service-category" aria-live="polite">{categoryOptions.find(({ slug }) => slug === serviceCategory)?.name}</span>
          {categories.isError && <span role="alert" className="home-projects-state">{t("home.categoriesError")}</span>}
        </div>}
      </div>

      <div id="home-marketplace-results" className="home-activity-results" aria-busy={activityLoading}>
        {activityLoading && <p className="home-projects-state" role="status">{t("home.loadingMarketplace")}</p>}
        {sources.projects && projects.isError && <p className="home-projects-state" role="alert">{t("home.projectsError")} <button type="button" onClick={() => projects.refetch()}>{t("home.retry")}</button></p>}
        {sources.services && services.isError && <p className="home-projects-state" role="alert">{t("home.servicesError")} <button type="button" onClick={() => services.refetch()}>{t("home.retry")}</button></p>}
        {!activityLoading && mixedActivity.length === 0 && <p className="home-projects-state">{t("home.noMatchingActivity")}</p>}
        <div className="home-projects-feed mixed-activity-feed">
          {mixedActivity.map(({ kind, item }) => kind === "project"
            ? <ProjectCard key={`project-${item.id}`} project={item} />
            : <ServiceCard key={`service-${item.id}`} service={item} />)}
        </div>
      </div>
    </section>
  );
}

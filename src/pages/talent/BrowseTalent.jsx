import "./browseTalent.scss";
import { useState, useContext, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import ServiceCard from "../../components/service/ServiceCard";
import InviteStudent from "../../components/escrow/InviteStudent";
import { AuthContext } from "../../context/authContext";
import { useTranslation } from "react-i18next";
import CategoryIcon from "@mui/icons-material/Category";
import ArchitectureIcon from "@mui/icons-material/Architecture";
import ConstructionIcon from "@mui/icons-material/Construction";
import EngineeringIcon from "@mui/icons-material/Engineering";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import CalculateIcon from "@mui/icons-material/Calculate";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CampaignIcon from "@mui/icons-material/Campaign";
import ForumIcon from "@mui/icons-material/Forum";
import ShareIcon from "@mui/icons-material/Share";
import MovieIcon from "@mui/icons-material/Movie";
import PaletteIcon from "@mui/icons-material/Palette";
import ComputerIcon from "@mui/icons-material/Computer";
import SchoolIcon from "@mui/icons-material/School";
import TranslateIcon from "@mui/icons-material/Translate";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import YardIcon from "@mui/icons-material/Yard";
import PetsIcon from "@mui/icons-material/Pets";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import RoomServiceIcon from "@mui/icons-material/RoomService";
import EventIcon from "@mui/icons-material/Event";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import RatingBadge from "../../components/review/RatingBadge";

const serviceCategoryIcons = {
  architecture: ArchitectureIcon,
  construction: ConstructionIcon,
  engineering: EngineeringIcon,
  business: BusinessCenterIcon,
  accounting: CalculateIcon,
  finance: AccountBalanceWalletIcon,
  marketing: CampaignIcon,
  communication: ForumIcon,
  "social-media": ShareIcon,
  media: MovieIcon,
  "creative-design": PaletteIcon,
  technology: ComputerIcon,
  education: SchoolIcon,
  language: TranslateIcon,
  agriculture: AgricultureIcon,
  landscape: YardIcon,
  "animal-science": PetsIcon,
  nutrition: RestaurantIcon,
  "wellness-fitness": FitnessCenterIcon,
  hospitality: RoomServiceIcon,
  events: EventIcon,
};

const BrowseTalent = () => {
  const { t } = useTranslation();
  const { currentUser } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(
    searchParams.get("tab") === "services" ? "services" : "students"
  );
  const [search, setSearch] = useState("");
  const [selectedServiceCategories, setSelectedServiceCategories] = useState([]);
  const [inviteTarget, setInviteTarget] = useState(null); // { id, username }
  const [canScrollCategoriesLeft, setCanScrollCategoriesLeft] = useState(false);
  const [canScrollCategoriesRight, setCanScrollCategoriesRight] = useState(false);
  const categoryCarouselRef = useRef(null);
  const focusedServiceId = searchParams.get("service");

  useEffect(() => {
    setTab(searchParams.get("tab") === "services" ? "services" : "students");
  }, [searchParams]);

  const isLocal = currentUser?.account_type === "local";

  const { isLoading: usersLoading, error: usersError, data: users } = useQuery({
    queryKey: ["talentUsers"],
    queryFn: () => makeRequest.get("/users/").then((res) => res.data),
  });

  const { isLoading: servicesLoading, error: servicesError, data: services } = useQuery({
    queryKey: ["services"],
    queryFn: () => makeRequest.get("/services").then((res) => res.data),
  });

  const { data: serviceCategories = [] } = useQuery({
    queryKey: ["serviceCategories"],
    queryFn: () => makeRequest.get("/categories").then((res) => res.data),
  });

  useEffect(() => {
    if (tab !== "services" || !focusedServiceId || !services) return;
    document.getElementById(`service-${focusedServiceId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusedServiceId, services, tab]);

  useEffect(() => {
    const carousel = categoryCarouselRef.current;
    if (!carousel) return undefined;

    const updateCarouselControls = () => {
      const edgeTolerance = 1;
      setCanScrollCategoriesLeft(carousel.scrollLeft > edgeTolerance);
      setCanScrollCategoriesRight(
        carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - edgeTolerance
      );
    };

    updateCarouselControls();
    carousel.addEventListener("scroll", updateCarouselControls);
    window.addEventListener("resize", updateCarouselControls);

    return () => {
      carousel.removeEventListener("scroll", updateCarouselControls);
      window.removeEventListener("resize", updateCarouselControls);
    };
  }, [serviceCategories.length, tab]);

  const students = users
    ? users.filter((u) => u.account_type === "student")
    : [];

  const filtered = students.filter((u) => {
    const q = search.toLowerCase();
    const nameMatch = u.username.toLowerCase().includes(q);
    const skillMatch = u.skills ? u.skills.toLowerCase().includes(q) : false;
    return nameMatch || skillMatch;
  });

  const skills = (user) =>
    user.skills ? user.skills.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const filteredServices = services?.filter(
    (service) => selectedServiceCategories.length === 0 || selectedServiceCategories.includes(service.categorySlug)
  );

  const toggleServiceCategory = (categorySlug) => {
    setSelectedServiceCategories((selected) =>
      selected.includes(categorySlug)
        ? selected.filter((slug) => slug !== categorySlug)
        : [...selected, categorySlug]
    );
  };

  const scrollServiceCategories = (direction) => {
    const carousel = categoryCarouselRef.current;
    if (!carousel) return;
    carousel.scrollBy({
      left: direction * Math.min(carousel.clientWidth * 0.8, 420),
      behavior: "smooth",
    });
  };

  return (
    <>
    <div className="browse-talent">
      <div className="header">
        <h1>{t("talent.browse")}</h1>
      </div>

      <div className="content">
        <div className="tabs">
          <button
            className={tab === "students" ? "tab selected" : "tab"}
            onClick={() => setTab("students")}
          >
            {t("talent.students")}
          </button>
          <button
            className={tab === "services" ? "tab selected" : "tab"}
            onClick={() => setTab("services")}
          >
            {t("talent.services")}
          </button>
        </div>

        {tab === "students" && (
          <>
            <div className="search-bar">
              <input
                type="text"
                placeholder={t("talent.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {usersLoading && <span className="state">Loading...</span>}
            {usersError && <span className="state">Failed to load students.</span>}
            {!usersLoading && filtered.length === 0 && (
              <span className="state">{t("talent.noStudents")}</span>
            )}

            <div className="student-grid">
              {filtered.map((user) => (
                <div key={user.id} className="student-card-wrapper">
                  <Link
                    to={`/profile/${user.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div className="student-card">
                      <img className="profilePic" src={user.profilePic} alt="" />
                      <span className="name">{user.username} <RatingBadge rating={user.averageRating} reviewCount={user.reviewCount} /></span>
                      {(user.university || user.major) && (
                        <span className="subtitle">
                          {[user.university, user.major].filter(Boolean).join(" · ")}
                        </span>
                      )}
                      {skills(user).length > 0 && (
                        <div className="skills-list">
                          {skills(user).slice(0, 3).map((skill, i) => (
                            <span key={i} className="skill-tag">{skill}</span>
                          ))}
                          {skills(user).length > 3 && (
                            <span className="skill-tag more">+{skills(user).length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                  {isLocal && (
                    <button
                      className="invite-btn"
                      onClick={() => setInviteTarget({ id: user.id, username: user.username })}
                    >
                      {t("escrow.invite")}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "services" && (
          <>
            <div className="service-category-carousel-wrap">
              {canScrollCategoriesLeft && (
                <button
                  type="button"
                  className="carousel-scroll-control left"
                  onClick={() => scrollServiceCategories(-1)}
                  aria-label={t("talent.scrollCategoriesLeft")}
                >
                  <ChevronLeftIcon />
                </button>
              )}
              <div ref={categoryCarouselRef} className="service-category-carousel" aria-label={t("talent.filterServices")}>
                <button
                  type="button"
                  className={selectedServiceCategories.length === 0 ? "category-carousel-item selected" : "category-carousel-item"}
                  aria-pressed={selectedServiceCategories.length === 0}
                  onClick={() => setSelectedServiceCategories([])}
                >
                  <CategoryIcon />
                  <span>{t("talent.allCategories")}</span>
                </button>
                {serviceCategories.map((category) => {
                  const ServiceCategoryIcon = serviceCategoryIcons[category.slug] || CategoryIcon;
                  const selected = selectedServiceCategories.includes(category.slug);

                  return (
                    <button
                      type="button"
                      key={category.id}
                      className={selected ? "category-carousel-item selected" : "category-carousel-item"}
                      aria-pressed={selected}
                      onClick={() => toggleServiceCategory(category.slug)}
                    >
                      <ServiceCategoryIcon />
                      <span>{category.name}</span>
                    </button>
                  );
              })}
              </div>
              {canScrollCategoriesRight && (
                <button
                  type="button"
                  className="carousel-scroll-control right"
                  onClick={() => scrollServiceCategories(1)}
                  aria-label={t("talent.scrollCategoriesRight")}
                >
                  <ChevronRightIcon />
                </button>
              )}
            </div>
            {servicesLoading && <span className="state">Loading...</span>}
            {servicesError && <span className="state">Failed to load services.</span>}
            {!servicesLoading && (!filteredServices || filteredServices.length === 0) && (
              <span className="state">
                {selectedServiceCategories.length > 0 ? t("talent.noServicesInCategory") : t("talent.noServices")}
              </span>
            )}
            <div className="service-feed">
              {filteredServices && filteredServices.map((service) => (
                <div
                  key={service.id}
                  id={`service-${service.id}`}
                  className={String(service.id) === focusedServiceId ? "focused-service" : ""}
                >
                  <ServiceCard service={service} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>

    {inviteTarget && (
      <InviteStudent
        studentId={inviteTarget.id}
        studentUsername={inviteTarget.username}
        onClose={() => setInviteTarget(null)}
      />
    )}
    </>
  );
};

export default BrowseTalent;

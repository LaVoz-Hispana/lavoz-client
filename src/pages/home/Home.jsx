import "./home.scss";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import Post from "../../components/post/Post";
import HomeMarketplace from "../../components/home/HomeMarketplace";
import HomePostActions from "../../components/home/HomePostActions";
import SponsorCarousel from "../../components/home/SponsorCarousel";
import AggieStamp from "../../assets/aggie_stamp.png";

/* ── Shared home (students and BCS locals) ── */
const SharedHome = ({ t, isGuest, role, currentUser }) => {
  const { i18n } = useTranslation();
  const { data: allPosts } = useQuery({
    queryKey: ["posts"],
    queryFn: () => makeRequest.get("/posts").then((r) => r.data),
  });

  const homePosts = allPosts ?? [];
  const { data: sponsorSection } = useQuery({
    queryKey: ["sponsor-section"],
    queryFn: () => makeRequest.get("/sponsors/section").then((r) => r.data),
  });
  const sponsorSupportCopy =
    i18n.language?.startsWith("es")
      ? sponsorSection?.contentEs || t("home.sponsorSupport")
      : sponsorSection?.contentEn || t("home.sponsorSupport");

  return (
    <div className="home-content">
      {!isGuest && <HomePostActions role={role} currentUser={currentUser} />}

      {homePosts.length > 0 && (
        <div className="activity-feed-section">
          {homePosts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      )}

      <HomeMarketplace />

      <section className="home-sponsors" aria-labelledby="sponsor-heading">
        <p id="sponsor-heading">{sponsorSupportCopy}</p>
        <div className="sponsor-showcase">
          <SponsorCarousel />
          <div className="home-stamp" aria-label="Aggie stamp">
            <img src={AggieStamp} alt="Born in Aggieland, made by Aggies" />
          </div>
        </div>
      </section>
    </div>
  );
};

/* ── Root ── */
const Home = () => {
  const { t } = useTranslation();
  const { currentUser } = useContext(AuthContext);

  const role = currentUser?.account_type;
  const isGuest = !currentUser;

  return (
    <div className="home">
      <div className="home-hero">
        <h1>Aggieland's Student-Local Marketplace</h1>
        <p>Helping students build real-world experience</p>
      </div>

      <SharedHome t={t} isGuest={isGuest} role={role} currentUser={currentUser} />
    </div>
  );
};

export default Home;

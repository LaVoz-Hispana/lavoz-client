import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { makeRequest } from "../../axios";

const OVERVIEW_INDEX = -1;

const SponsorLink = ({ sponsor, className }) => {
  const sponsorType = (sponsor.sponsorType || "regular").toLowerCase();
  const sponsorTypeLabel = sponsorType === "principle" ? "Principle" : "Regular";

  return (
    <a className={className} href={sponsor.link} target="_blank" rel="noopener noreferrer">
      <img src={sponsor.logoUrl} alt={`Visit ${sponsor.name}`} />
      <span className={`sponsor-type-sticker ${sponsorType}`}>{sponsorTypeLabel}</span>
    </a>
  );
};

const SponsorCarousel = () => {
  const { data: uploadedSponsors } = useQuery({
    queryKey: ["sponsors"],
    queryFn: () => makeRequest.get("/sponsors").then((res) => res.data),
  });
  const sponsors = useMemo(() => uploadedSponsors ?? [], [uploadedSponsors]);
  const [activeIndex, setActiveIndex] = useState(OVERVIEW_INDEX);

  useEffect(() => {
    setActiveIndex((index) => index >= sponsors.length ? OVERVIEW_INDEX : index);
  }, [sponsors.length]);

  useEffect(() => {
    if (sponsors.length < 2) return undefined;
    const timeout = window.setTimeout(() => {
      setActiveIndex((index) => index >= sponsors.length - 1 ? OVERVIEW_INDEX : index + 1);
    }, activeIndex === OVERVIEW_INDEX ? 6000 : 4500);
    return () => window.clearTimeout(timeout);
  }, [activeIndex, sponsors.length]);

  const move = (direction) => {
    const viewCount = sponsors.length + 1;
    setActiveIndex((index) => (
      (index + 1 + direction + viewCount) % viewCount
    ) - 1);
  };
  if (sponsors.length === 0) return null;

  const showOverview = sponsors.length === 1 || activeIndex === OVERVIEW_INDEX;
  const activeSponsor = showOverview ? null : sponsors[activeIndex];

  return (
    <div className="sponsor-carousel" aria-label="Platform sponsors">
      {sponsors.length > 1 && (
        <button type="button" className="sponsor-carousel-control" onClick={() => move(-1)} aria-label="Previous sponsor">
          <ArrowBackIosNewIcon fontSize="small" />
        </button>
      )}
      <div className="sponsor-carousel-stage">
        {showOverview ? (
          <div key="overview" className="sponsor-grid">
            {sponsors.map((sponsor) => (
              <SponsorLink key={sponsor.id} sponsor={sponsor} className="sponsor-card" />
            ))}
          </div>
        ) : (
          <SponsorLink key={activeSponsor.id} sponsor={activeSponsor} className="sponsor-slide" />
        )}
      </div>
      {sponsors.length > 1 && (
        <button type="button" className="sponsor-carousel-control" onClick={() => move(1)} aria-label="Next sponsor">
          <ArrowForwardIosIcon fontSize="small" />
        </button>
      )}
    </div>
  );
};

export default SponsorCarousel;

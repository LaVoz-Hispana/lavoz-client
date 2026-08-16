import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { makeRequest } from "../../axios";
const SponsorCarousel = () => {
  const { data: uploadedSponsors } = useQuery({
    queryKey: ["sponsors"],
    queryFn: () => makeRequest.get("/sponsors").then((res) => res.data),
  });
  const sponsors = useMemo(() => uploadedSponsors ?? [], [uploadedSponsors]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(sponsors.length - 1, 0)));
  }, [sponsors.length]);

  useEffect(() => {
    if (sponsors.length < 2) return undefined;
    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % sponsors.length);
    }, 4500);
    return () => window.clearInterval(interval);
  }, [sponsors.length]);

  const move = (direction) => {
    setActiveIndex((index) => (index + direction + sponsors.length) % sponsors.length);
  };
  const activeSponsor = sponsors[activeIndex];
  if (!activeSponsor) return null;
  const sponsorType = (activeSponsor.sponsorType || "regular").toLowerCase();
  const sponsorTypeLabel = sponsorType === "principle" ? "Principle" : "Regular";

  return (
    <div className="sponsor-carousel" aria-label="Platform sponsors">
      {sponsors.length > 1 && (
        <button type="button" className="sponsor-carousel-control" onClick={() => move(-1)} aria-label="Previous sponsor">
          <ArrowBackIosNewIcon fontSize="small" />
        </button>
      )}
      <a key={activeSponsor.id} className="sponsor-slide" href={activeSponsor.link} target="_blank" rel="noopener noreferrer">
        <img src={activeSponsor.logoUrl} alt={`Visit ${activeSponsor.name}`} />
        <span className={`sponsor-type-sticker ${sponsorType}`}>{sponsorTypeLabel}</span>
      </a>
      {sponsors.length > 1 && (
        <button type="button" className="sponsor-carousel-control" onClick={() => move(1)} aria-label="Next sponsor">
          <ArrowForwardIosIcon fontSize="small" />
        </button>
      )}
    </div>
  );
};

export default SponsorCarousel;

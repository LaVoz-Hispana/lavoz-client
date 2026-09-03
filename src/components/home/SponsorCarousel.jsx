import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { makeRequest } from "../../axios";

const SPONSORS_PER_PAGE = 3;

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
  const sponsorPages = useMemo(() => (
    Array.from(
      { length: Math.ceil(sponsors.length / SPONSORS_PER_PAGE) },
      (_, pageIndex) => sponsors.slice(
        pageIndex * SPONSORS_PER_PAGE,
        (pageIndex + 1) * SPONSORS_PER_PAGE,
      ),
    )
  ), [sponsors]);
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    setActivePage((page) => page >= sponsorPages.length ? 0 : page);
  }, [sponsorPages.length]);

  useEffect(() => {
    if (sponsorPages.length < 2) return undefined;
    const timeout = window.setTimeout(() => {
      setActivePage((page) => (page + 1) % sponsorPages.length);
    }, activePage === 0 ? 6000 : 4500);
    return () => window.clearTimeout(timeout);
  }, [activePage, sponsorPages.length]);

  const move = (direction) => {
    setActivePage((page) => (
      (page + direction + sponsorPages.length) % sponsorPages.length
    ));
  };
  if (sponsors.length === 0) return null;

  const activeSponsors = sponsorPages[activePage] ?? sponsorPages[0];

  return (
    <div className="sponsor-carousel" aria-label="Platform sponsors">
      {sponsorPages.length > 1 && (
        <button type="button" className="sponsor-carousel-control" onClick={() => move(-1)} aria-label="Previous sponsors">
          <ArrowBackIosNewIcon fontSize="small" />
        </button>
      )}
      <div className="sponsor-carousel-stage">
        <div key={activePage} className="sponsor-grid">
          {activeSponsors.map((sponsor) => (
            <SponsorLink key={sponsor.id} sponsor={sponsor} className="sponsor-card" />
          ))}
        </div>
      </div>
      {sponsorPages.length > 1 && (
        <button type="button" className="sponsor-carousel-control" onClick={() => move(1)} aria-label="Next sponsors">
          <ArrowForwardIosIcon fontSize="small" />
        </button>
      )}
    </div>
  );
};

export default SponsorCarousel;

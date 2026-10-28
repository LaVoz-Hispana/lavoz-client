import { useTranslation } from "react-i18next";
import "./aggieConsulting.scss";

const AggieConsulting = () => {
  const { t } = useTranslation();

  const listings = [
    {
      company: "Bluebonnet Analytics",
      project: "Customer survey analysis and insights",
      type: "Paid",
      compensation: "$250 stipend",
      timeframe: "2 weeks",
      location: "Remote",
    },
    {
      company: "Aggieland Coffee Co.",
      project: "Menu pricing strategy and margin review",
      type: "Unpaid",
      compensation: "Experience + reference",
      timeframe: "3 weeks",
      location: "Northgate",
    },
    {
      company: "Brazos Home Repair",
      project: "Website audit and conversion suggestions",
      type: "Paid",
      compensation: "$300 project",
      timeframe: "10 days",
      location: "Hybrid",
    },
    {
      company: "Maroon Trails",
      project: "Social media content calendar",
      type: "Unpaid",
      compensation: "Portfolio credit",
      timeframe: "2 weeks",
      location: "Remote",
    },
    {
      company: "Century Square Fitness",
      project: "Member retention research",
      type: "Paid",
      compensation: "$20/hr",
      timeframe: "4 weeks",
      location: "College Station",
    },
    {
      company: "Aggie Gameday Goods",
      project: "Inventory forecasting model",
      type: "Unpaid",
      compensation: "Letter of recommendation",
      timeframe: "3 weeks",
      location: "Remote",
    },
  ];

  return (
    <div className="aggie-consulting">
      <div className="consulting-header">
        <h2>{t("consulting.title")}</h2>
        <p className="tagline">{t("consulting.tagline")}</p>
      </div>

      <div className="consulting-grid">
        {listings.map((listing) => (
          <div
            key={`${listing.company}-${listing.project}`}
            className="consulting-card"
          >
            <div className={`consulting-type ${listing.type.toLowerCase()}`}>
              {listing.type}
            </div>
            <h3 className="consulting-company">{listing.company}</h3>
            <p className="consulting-project">{listing.project}</p>
            <div className="consulting-meta">
              <span>
                {t("consulting.compensation")} {listing.compensation}
              </span>
              <span>
                {t("consulting.timeframe")} {listing.timeframe}
              </span>
              <span>
                {t("consulting.location")} {listing.location}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AggieConsulting;

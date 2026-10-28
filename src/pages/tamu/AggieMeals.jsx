import { useTranslation } from "react-i18next";
import "./aggieMeals.scss";

const AggieMeals = () => {
  const { t } = useTranslation();

  const weeklyDeals = [
    {
      day: "Monday",
      restaurant: "Maroon Grill",
      deal: "Free side with any entree",
      time: "11:00 AM - 2:00 PM",
      location: "Northgate",
    },
    {
      day: "Tuesday",
      restaurant: "Aggie Tacos",
      deal: "2 tacos for $5",
      time: "4:00 PM - 8:00 PM",
      location: "University Dr",
    },
    {
      day: "Wednesday",
      restaurant: "Kyle Kitchen",
      deal: "Free drink with any bowl",
      time: "12:00 PM - 3:00 PM",
      location: "Century Square",
    },
    {
      day: "Thursday",
      restaurant: "12th Man Pizza",
      deal: "$8 personal pizza",
      time: "5:00 PM - 9:00 PM",
      location: "South College",
    },
    {
      day: "Friday",
      restaurant: "Aggie BBQ",
      deal: "Free dessert with any plate",
      time: "11:30 AM - 2:30 PM",
      location: "Wellborn",
    },
    {
      day: "Saturday",
      restaurant: "Campus Cafe",
      deal: "Half-off breakfast plates",
      time: "8:00 AM - 11:00 AM",
      location: "Downtown Bryan",
    },
    {
      day: "Sunday",
      restaurant: "Aggieland Subs",
      deal: "Buy one, get one half-off",
      time: "12:00 PM - 6:00 PM",
      location: "Rock Prairie",
    },
  ];

  return (
    <div className="aggie-meals">
      <div className="meals-header">
        <h2>{t("meals.title")}</h2>
        <p className="tagline">{t("meals.tagline")}</p>
      </div>

      <div className="meals-grid">
        {weeklyDeals.map((deal) => (
          <div key={`${deal.day}-${deal.restaurant}`} className="meal-card">
            <div className="meal-day">{deal.day}</div>
            <h3 className="meal-restaurant">{deal.restaurant}</h3>
            <p className="meal-deal">{deal.deal}</p>
            <div className="meal-meta">
              <span>
                {t("meals.time")} {deal.time}
              </span>
              <span>
                {t("meals.location")} {deal.location}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AggieMeals;

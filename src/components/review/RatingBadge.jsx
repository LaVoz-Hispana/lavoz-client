import "./ratingBadge.scss";

const RatingBadge = ({ rating, reviewCount, className = "" }) => {
  if (Number(reviewCount) <= 0 || !Number.isFinite(Number(rating))) return null;

  return (
    <span className={`rating-badge ${className}`.trim()} aria-label={`${rating} out of 5 stars`}>
      <span aria-hidden="true">★</span> {Number(rating).toFixed(1)}
    </span>
  );
};

export default RatingBadge;

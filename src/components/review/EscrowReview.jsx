import { useContext, useEffect, useId, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";
import ProviderBadge from "../provider/ProviderBadge";
import "../resume/resumeApplications.scss";

export default function EscrowReview({ escrowId }) {
  const { currentUser } = useContext(AuthContext);
  const { t } = useTranslation();
  const client = useQueryClient();
  const id = useId();
  const [rating, setRating] = useState("5");
  const [commentary, setCommentary] = useState("");
  const [saved, setSaved] = useState(false);
  const query = useQuery({
    queryKey: ["escrowReview", currentUser.id, escrowId],
    queryFn: () => makeRequest.get(`/reviews/escrows/${escrowId}`).then((response) => response.data),
  });
  useEffect(() => {
    if (query.data?.review) {
      setRating(String(Number(query.data.review.rating)));
      setCommentary(query.data.review.commentary || "");
    }
  }, [query.data]);
  const mutation = useMutation({
    mutationFn: () => query.data.review
      ? makeRequest.put(`/reviews/${query.data.review.id}`, { rating: Number(rating), commentary })
      : makeRequest.post(`/reviews/escrows/${escrowId}`, { rating: Number(rating), commentary }),
    onSuccess: async () => {
      setSaved(true);
      await Promise.all(["escrowReview", "review-summary", "completed-projects", "user", "projects", "project", "allUsers", "talentUsers"].map((key) => client.invalidateQueries({ queryKey: [key] })));
    },
  });
  return <section className="resume-applications escrow-review" aria-labelledby={`${id}-heading`}>
    <h2 id={`${id}-heading`}>{t("reviews.title")}</h2>
    {query.isPending && <p role="status">{t("resumeApplications.loading")}</p>}
    {query.isError && <p role="alert">{t("reviews.loadError")} <button type="button" onClick={() => query.refetch()}>{t("resumeApplications.retry")}</button></p>}
    {!query.isError && query.data?.canReview && <>
      <p>{t("reviews.with", { name: query.data.counterpartName })} <ProviderBadge label={query.data.counterpartProviderTypeLabel} /></p>
      <form className="resume-fields" onSubmit={(event) => { event.preventDefault(); setSaved(false); mutation.mutate(); }}>
        <label htmlFor={`${id}-rating`}>{t("reviews.rating")}</label>
        <select id={`${id}-rating`} value={rating} disabled={mutation.isPending} onChange={(event) => setRating(event.target.value)} required>
          {Array.from({ length: 10 }, (_, index) => (index + 1) / 2).reverse().map((value) => <option value={value} key={value}>{t("reviews.outOfFive", { rating: value })}</option>)}
        </select>
        <label htmlFor={`${id}-comment`}>{t("reviews.comment")}</label>
        <textarea id={`${id}-comment`} value={commentary} rows={4} maxLength={2000} disabled={mutation.isPending} onChange={(event) => setCommentary(event.target.value)} />
        <button type="submit" disabled={mutation.isPending}>{t(mutation.isPending ? "provider.saving" : query.data.review ? "reviews.save" : "reviews.submit")}</button>
      </form>
    </>}
    {!query.isError && query.data && !query.data.canReview && <p>{t("reviews.completedOnly")}</p>}
    {mutation.isError && <p role="alert">{t("reviews.saveError")}</p>}
    {saved && <p role="status">{t("reviews.saved")}</p>}
  </section>;
}

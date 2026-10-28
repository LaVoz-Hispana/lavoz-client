import Ad from "./Ad";
import "./ads.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const Ads = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["pendingAds"],
    queryFn: () =>
      makeRequest.get("/ads/pending").then((res) => {
        return res.data;
      }),
  });

  return (
    <div className="ads">
      {error
        ? "Something went wrong!"
        : isLoading
          ? "loading"
          : data.map((ad) => <Ad ad={ad} key={ad.id} />)}
    </div>
  );
};

export default Ads;

import "./myEscrows.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import EscrowCard from "../../components/escrow/EscrowCard";
import { useTranslation } from "react-i18next";

const MyEscrows = () => {
  const { t } = useTranslation();

  const {
    isLoading,
    error,
    data: escrows,
  } = useQuery({
    queryKey: ["escrows", "me"],
    queryFn: () => makeRequest.get("/escrows/me").then((res) => res.data),
  });

  return (
    <div className="my-escrows">
      <div className="header">
        <h1>{t("escrow.myEscrows")}</h1>
      </div>

      <div className="content">
        {isLoading && <span className="state">Loading...</span>}
        {error && <span className="state">Failed to load escrows.</span>}
        {!isLoading && !error && escrows?.length === 0 && (
          <span className="state">{t("escrow.noEscrows")}</span>
        )}
        <div className="grid">
          {escrows?.map((escrow) => (
            <EscrowCard key={escrow.id} escrow={escrow} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyEscrows;

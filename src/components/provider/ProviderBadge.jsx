import { useTranslation } from "react-i18next";
import "./providerBadge.scss";

const ProviderBadge = ({ providerType, label }) => {
  const { t } = useTranslation();
  const normalizedType =
    providerType || (typeof label === "string" ? label.toLowerCase() : null);
  if (!normalizedType) return null;
  return (
    <span className={`provider-type-badge ${normalizedType}`}>
      {["individual", "company", "organization"].includes(normalizedType)
        ? t(`provider.types.${normalizedType}`)
        : label}
    </span>
  );
};

export default ProviderBadge;

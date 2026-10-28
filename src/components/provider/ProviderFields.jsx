import { useId } from "react";
import { useTranslation } from "react-i18next";

export default function ProviderFields({ values, onChange, disabled = false }) {
  const id = useId();
  const { t } = useTranslation();
  const entity =
    values.provider_type === "company"
      ? ["company_name", "companyName"]
      : values.provider_type === "organization"
        ? ["organization_name", "organizationName"]
        : null;
  return (
    <fieldset className="provider-fields" disabled={disabled}>
      <legend>{t("provider.details")}</legend>
      <div className="row">
        <label htmlFor={`${id}-type`}>{t("provider.type")}</label>
        <select
          id={`${id}-type`}
          name="provider_type"
          value={values.provider_type}
          onChange={onChange}
          required
          aria-describedby={`${id}-help`}
        >
          <option value="">{t("provider.selectType")}</option>
          {["individual", "company", "organization"].map((type) => (
            <option key={type} value={type}>
              {t(`provider.types.${type}`)}
            </option>
          ))}
        </select>
      </div>
      <p id={`${id}-help`}>
        {values.provider_type
          ? t(`provider.descriptions.${values.provider_type}`)
          : t("provider.selectType")}
      </p>
      <div className="row">
        <label htmlFor={`${id}-contact`}>{t("provider.contactPerson")}</label>
        <input
          id={`${id}-contact`}
          name="contact_person_name"
          value={values.contact_person_name}
          onChange={onChange}
          required
          maxLength={150}
          placeholder={t("provider.contactPersonPlaceholder")}
        />
      </div>
      {entity && (
        <div className="row">
          <label htmlFor={`${id}-entity`}>{t(`provider.${entity[1]}`)}</label>
          <input
            id={`${id}-entity`}
            name={entity[0]}
            value={values[entity[0]]}
            onChange={onChange}
            required
            maxLength={200}
            placeholder={t(`provider.${entity[1]}Placeholder`)}
          />
        </div>
      )}
    </fieldset>
  );
}

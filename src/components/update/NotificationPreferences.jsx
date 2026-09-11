import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { makeRequest } from "../../axios";

export default function NotificationPreferences({ userId }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const queryKey = ["notificationPreferences", userId];
  const [draft, setDraft] = useState(null);
  const preferences = useQuery({
    queryKey,
    queryFn: () => makeRequest.get("/notifications/preferences").then((res) => res.data),
  });
  const save = useMutation({
    mutationFn: (value) => makeRequest.put("/notifications/preferences", value).then((res) => res.data),
    onSuccess: (value) => {
      queryClient.setQueryData(queryKey, value);
      setDraft(null);
    },
  });
  const value = draft || preferences.data;
  const change = (update) => {
    save.reset();
    setDraft({ ...value, ...update });
  };

  return (
    <fieldset className="notification-preferences" disabled={save.isPending}>
      <legend>{t("notificationPreferences.title")}</legend>
      {preferences.isPending ? <p role="status">{t("notificationPreferences.loading")}</p>
        : preferences.isError ? <>
          <p role="alert">{t("notificationPreferences.loadError")}</p>
          <button type="button" onClick={() => preferences.refetch()}>{t("notificationPreferences.retry")}</button>
        </> : <>
          <label htmlFor="marketplace-email">{t("notificationPreferences.marketplace")}</label>
          <select id="marketplace-email" value={String(value.marketplaceEmail)}
            onChange={(event) => change({ marketplaceEmail: event.target.value === "true" })}>
            <option value="true">{t("notificationPreferences.enabled")}</option>
            <option value="false">{t("notificationPreferences.disabled")}</option>
          </select>
          <label htmlFor="notification-language">{t("notificationPreferences.language")}</label>
          <select id="notification-language" value={value.language}
            onChange={(event) => change({ language: event.target.value })}>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
          <button type="button" disabled={!draft || save.isPending} onClick={() => save.mutate(draft)}>
            {t(save.isPending ? "notificationPreferences.saving" : "notificationPreferences.save")}
          </button>
          {save.isSuccess && <p role="status">{t("notificationPreferences.saved")}</p>}
          {save.isError && <p role="alert">{t("notificationPreferences.saveError")}</p>}
        </>}
    </fieldset>
  );
}

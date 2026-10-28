import { makeRequest } from "../axios";

export function providerError(error, t) {
  const code = error?.response?.data?.code;
  return t(`provider.errors.${code}`, {
    defaultValue: t("provider.errors.saveFailed"),
  });
}

export async function saveProfile(user, fields) {
  const {
    account_type,
    password,
    confirmPassword,
    serviceCategoryIds,
    ...profile
  } = { ...user, ...fields };
  if (user.account_type === "student" && serviceCategoryIds !== undefined) {
    profile.serviceCategoryIds = serviceCategoryIds;
  }
  await makeRequest.put("/users", profile);
  // Use the persisted, normalized identity instead of duplicating the API's naming rules.
  return (await makeRequest.get(`/users/find/${user.id}`)).data;
}

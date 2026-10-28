const PRODUCTION_API_URL =
  "https://poststation-api-391b2ced2a59.herokuapp.com/api";

export function resolveApiBaseUrl({ nodeEnv, apiUrl, hostname, protocol }) {
  const configuredUrl = apiUrl?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/+$/, "");

  // CRA sets NODE_ENV automatically for npm start and production builds.
  if (nodeEnv !== "development") return PRODUCTION_API_URL;

  // Use the browser's host so localhost, loopback, and LAN browsing all work
  // without embedding a machine-specific development address in the bundle.
  const host =
    hostname.includes(":") && !hostname.startsWith("[")
      ? `[${hostname}]`
      : hostname;
  return `${protocol}//${host}:8800/api`;
}

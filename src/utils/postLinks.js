const URL_BOUNDARY_PATTERN = "(?:https?:\\/\\/|www\\.)";
const URL_START_PATTERN = "(?:https?:\\/\\/(?:www\\.)?|www\\.)";

// Stop at another URL prefix so adjacent pasted links remain separate links.
export const URL_PATTERN = `${URL_START_PATTERN}(?:(?!${URL_BOUNDARY_PATTERN})[^\\s<>()])+`;

export const createUrlRegex = () => new RegExp(`(${URL_PATTERN})`, "gi");

export const createPostTextRegex = () => new RegExp(
  `\\[([^\\]]+)\\]\\((${URL_PATTERN})\\)|(${URL_PATTERN})`,
  "gi"
);

export const ensureAbsoluteUrl = (url) => {
  if (!url.match(/^(https?:\/\/|www\.)/i)) {
    return `https://www.${url}`;
  }
  if (url.match(/^www\./i)) {
    return `https://${url}`;
  }
  return url;
};

export const trimTrailingPunctuation = (value) => {
  let trimmed = value;
  let suffix = "";

  while (trimmed && /[.,!?;:)]$/.test(trimmed)) {
    suffix = trimmed.slice(-1) + suffix;
    trimmed = trimmed.slice(0, -1);
  }

  return { trimmed, suffix };
};

export const getDisplayUrl = (url) => url
  .replace(/^https?:\/\/(www\.)?/i, "")
  .replace(/^www\./i, "")
  .replace(/\/$/, "");

export const HISTORICAL_EMAIL_DOMAIN = "@fintera.local";

export const isHistoricalPlaceholderEmail = (user) =>
  Boolean(user?.historical_client) &&
  String(user?.email || "")
    .toLowerCase()
    .endsWith(HISTORICAL_EMAIL_DOMAIN);

export const displayUserEmail = (user, t) =>
  isHistoricalPlaceholderEmail(user)
    ? t("users.noEmail")
    : user?.email || "—";

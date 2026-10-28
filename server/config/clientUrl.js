// Set CLIENT_URL to the deployed frontend's exact origin in production.
// Local development keeps the Vite default.
export const clientUrl = (process.env.CLIENT_URL?.trim() || "http://localhost:5173").replace(/\/+$/, "");
export const getClientUrl = (req) => {
  const requestOrigin = req.get("origin")?.replace(/\/+$/, "");
  // Render's generated client hostname may vary. Honor it when the service was
  // accidentally configured with its local development URL.
  if (
    /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(requestOrigin || "") &&
    /^https?:\/\/localhost(?::\d+)?$/i.test(clientUrl)
  ) return requestOrigin;
  return clientUrl;
};
export const serverUrl = (import.meta.env.VITE_SERVER_URL || "").replace(/\/+$/, "");

const productionClientUrl = "https://exam-notes-generator-client.onrender.com";
const configuredClientUrl = process.env.CLIENT_URL?.trim();

// A local URL accidentally carried into a production deployment must not send
// Stripe customers back to their own machine. Local development keeps localhost.
const selectedClientUrl = process.env.NODE_ENV === "production" &&
  /^https?:\/\/localhost(?::\d+)?\/?$/i.test(configuredClientUrl || "")
  ? productionClientUrl
  : configuredClientUrl || (process.env.NODE_ENV === "production" ? productionClientUrl : "http://localhost:5173");

export const clientUrl = selectedClientUrl.replace(/\/+$/, "");

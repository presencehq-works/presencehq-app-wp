// -------------------------------
// PresenceHQ Cloud Functions
// Sandbox Environment
// -------------------------------

const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");
const axios = require("axios");

// ---------------------------------------------------------------------------
// 🔹 Intuit OAuth Callback
// ---------------------------------------------------------------------------
exports.qboAuthCallback = onRequest(async (req, res) => {
  try {
    logger.info("🔥 Incoming request query:", req.query);
    const { code, realmId } = req.query;

    if (!code || !realmId) {
      logger.error("Missing code or realmId");
      return res.status(400).send("Missing authorization code or realmId");
    }

    const clientId = process.env.QBO_CLIENT_ID;
    const clientSecret = process.env.QBO_CLIENT_SECRET;
    const redirectUri = process.env.QBO_REDIRECT_URI;
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const tokenUrl = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

    // ✅ Exchange authorization code for tokens
    const response = await axios({
      method: "post",
      url: tokenUrl,
      data: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }).toString(),
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      validateStatus: false,
    });

    if (response.status !== 200) {
      logger.error("❌ Intuit token exchange failed:", response.status, response.data);
      return res.status(response.status).send("OAuth token exchange failed.");
    }

    logger.info("✅ Tokens received for realmId:", realmId);
    res.status(200).send("✅ QBO Authorization successful. Tokens received.");
  } catch (error) {
    logger.error("❌ QBO OAuth Error:", error.response?.data || error.message);
    res.status(500).send("OAuth Error");
  }
});

// ---------------------------------------------------------------------------
// 🔹 Scheduled QBO Token Refresh (every 50 minutes)
// ---------------------------------------------------------------------------
exports.refreshQBOTokens = onSchedule("every 50 minutes", async (event) => {
  logger.info("Running scheduled QBO token refresh...");

  try {
    // Example placeholder logic — replace later with actual Firestore token refresh
    const clientId = process.env.QBO_CLIENT_ID;
    const clientSecret = process.env.QBO_CLIENT_SECRET;
    logger.info("Refreshing tokens with clientId:", clientId.substring(0, 6) + "...");

    // Here you would loop through stored refresh tokens in Firestore and renew them:
    // await axios.post("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", ...)

    logger.info("✅ Token refresh job completed successfully.");
  } catch (err) {
    logger.error("❌ Token refresh failed:", err.response?.data || err.message);
  }
});

// ------------------------------------------------------------
// PresenceHQ Cloud Functions (Sandbox)
// ------------------------------------------------------------

const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

// Initialize Firestore once
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// ------------------------------------------------------------
// 🔹 Intuit OAuth Callback — EXCHANGE + SAVE TOKENS
// ------------------------------------------------------------
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

    const tokens = response.data;
    logger.info("✅ Tokens received for realmId:", realmId);

    // 🔒 Store in Firestore
    await db.collection("qboTokens").doc(realmId).set({
      ...tokens,
      realmId,
      last_refresh: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).send("✅ QBO Authorization successful. Tokens stored in Firestore.");
  } catch (error) {
    logger.error("❌ QBO OAuth Error:", error.response?.data || error.message);
    res.status(500).send("OAuth Error");
  }
});

// ------------------------------------------------------------
// 🔹 Scheduled QBO Token Refresh (every 50 minutes)
// ------------------------------------------------------------
exports.refreshQBOTokens = onSchedule("every 50 minutes", async () => {
  logger.info("Running scheduled QBO token refresh job...");

  const clientId = process.env.QBO_CLIENT_ID;
  const clientSecret = process.env.QBO_CLIENT_SECRET;
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenUrl = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

  try {
    const snapshot = await db.collection("qboTokens").get();
    if (snapshot.empty) {
      logger.warn("No QBO tokens found in Firestore.");
      return;
    }

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (!data.refresh_token) {
        logger.warn(`Skipping ${doc.id} — missing refresh token`);
        continue;
      }

      logger.info(`🔄 Refreshing token for realmId: ${doc.id}`);

      const resp = await axios({
        method: "post",
        url: tokenUrl,
        data: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: data.refresh_token,
        }).toString(),
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        validateStatus: false,
      });

      if (resp.status !== 200) {
        logger.error(`❌ Refresh failed for ${doc.id}:`, resp.data);
        continue;
      }

      const newTokens = resp.data;
      await doc.ref.update({
        ...newTokens,
        last_refresh: admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info(`✅ Refreshed token for realmId: ${doc.id}`);
    }

    logger.info("✅ Token refresh cycle complete.");
  } catch (err) {
    logger.error("❌ Token refresh job failed:", err.response?.data || err.message);
  }
});

// ------------------------------------------------------------
// 🔹 Manual Trigger for Refresh (for testing)
// ------------------------------------------------------------
exports.manualRefreshQBOTokens = onRequest(async (req, res) => {
  logger.info("Manual token refresh triggered via HTTP.");
  try {
    await exports.refreshQBOTokens.run();
    res.status(200).send("✅ Manual token refresh complete.");
  } catch (err) {
    logger.error("❌ Manual refresh failed:", err.message);
    res.status(500).send("Manual refresh failed.");
  }
});

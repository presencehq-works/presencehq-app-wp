const functions = require("firebase-functions");
const axios = require("axios");

exports.qboAuthCallback = functions.https.onRequest(async (req, res) => {
  try {
    console.log("🔥 Incoming request query:", req.query);
    const { code, realmId } = req.query;

    if (!code || !realmId) {
      console.error("Missing code or realmId");
      return res.status(400).send("Missing authorization code or realmId");
    }

    const clientId = process.env.QBO_CLIENT_ID;
    const clientSecret = process.env.QBO_CLIENT_SECRET;
    const redirectUri = process.env.QBO_REDIRECT_URI;
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const tokenUrl = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

    // official Intuit-compliant call
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
      validateStatus: false, // keep errors readable in logs
    });

    if (response.status !== 200) {
      console.error("❌ Intuit token exchange failed:", response.status, response.data);
      return res.status(response.status).send("OAuth token exchange failed.");
    }

    console.info("✅ Tokens received for realmId:", realmId);
    res.status(200).send("✅ QBO Authorization successful. Tokens received.");
  } catch (error) {
    console.error("❌ QBO OAuth Error:", error.response?.data || error.message);
    res.status(500).send("OAuth Error");
  }
});

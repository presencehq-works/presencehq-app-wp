// lib/server/firebaseAdmin.js
import "server-only";
import * as admin from "firebase-admin";
import { GoogleAuth } from "google-auth-library";

// --- Environment setup ---
const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_WORKLOAD_IDENTITY_PROVIDER = process.env.GOOGLE_WORKLOAD_IDENTITY_PROVIDER;
const GOOGLE_AUDIENCE = process.env.GOOGLE_AUDIENCE;
const VERCEL_OIDC_TOKEN = process.env.VERCEL_OIDC_TOKEN;

/**
 * Creates a Workload Identity Federation credential object that uses the
 * Vercel-provided OIDC token as the subject_token for Google STS.
 */
function createWIFCredentials() {
  return {
    type: "external_account",
    audience: GOOGLE_AUDIENCE,
    subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
    credential_source: {
      environment_variable: "VERCEL_OIDC_TOKEN",
    },
    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GOOGLE_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
  };
}

async function initializeAdmin() {
  if (admin.apps.length) return admin.app();

  try {
    const credentials = createWIFCredentials();
    const auth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    admin.initializeApp({
      projectId: GOOGLE_PROJECT_ID,
      credential: {
        getAccessToken: async () => {
          const tokenResponse = await auth.getAccessToken();
          if (!tokenResponse?.token) throw new Error("Failed to obtain STS token.");
          return {
            access_token: tokenResponse.token,
            expiration_time: Date.now() + 3600 * 1000,
          };
        },
      },
    });

    console.log("✅ Firebase Admin initialized via Workload Identity Federation");
    return admin.app();
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error);
    throw error;
  }
}

export const app = await initializeAdmin();
export const adminAuth = admin.auth(app);
export const adminDb = admin.firestore(app);

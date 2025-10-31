// lib/server/firebaseAdmin.js
import "server-only";
import * as admin from "firebase-admin";
import { GoogleAuth } from "google-auth-library";

// --- Debug info ---
console.log("🔥 firebaseAdmin.js loaded at runtime");
console.log("🔥 GOOGLE_PROJECT_ID:", process.env.GOOGLE_PROJECT_ID);
console.log("🔥 GOOGLE_SERVICE_ACCOUNT_EMAIL:", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
console.log("🔥 GOOGLE_WORKLOAD_IDENTITY_PROVIDER:", process.env.GOOGLE_WORKLOAD_IDENTITY_PROVIDER);
console.log("🔥 GOOGLE_AUDIENCE:", process.env.GOOGLE_AUDIENCE);
console.log("🔥 VERCEL_OIDC_TOKEN present:", !!process.env.VERCEL_OIDC_TOKEN);

// --- Environment setup ---
const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_WORKLOAD_IDENTITY_PROVIDER = process.env.GOOGLE_WORKLOAD_IDENTITY_PROVIDER;
const GOOGLE_AUDIENCE = process.env.GOOGLE_AUDIENCE;

/**
 * Creates a Workload Identity Federation credential object that uses the
 * Vercel-provided OIDC token as the subject_token for Google STS.
 */
function createWIFCredentials() {
  console.log("⚙️  Creating WIF credentials object...");
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

/**
 * Initializes Firebase Admin using manual Workload Identity Federation.
 */
async function initializeAdmin() {
  if (admin.apps.length) {
    console.log("⚙️  Firebase Admin already initialized, reusing existing app.");
    return admin.app();
  }

  try {
    console.log("✅ Initializing Firebase Admin via manual WIF...");
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

    console.log("✅ Firebase Admin initialized successfully via WIF");
    return admin.app();
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error);
    throw error;
  }
}

// ✅ Ensure top-level await works correctly in Edge/Node runtimes
let firebaseApp;
try {
  firebaseApp = await initializeAdmin();
} catch (err) {
  console.error("🔥 Failed to initialize Firebase Admin:", err);
  throw err;
}

export const app = firebaseApp;
export const adminAuth = admin.auth(app);
export const adminDb = admin.firestore(app);

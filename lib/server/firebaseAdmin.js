// lib/server/firebaseAdmin.js
import "server-only";
import fs from "fs";
import { initializeApp, getApps, getApp, cert, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let app;

// 🧠 Runtime check: are we on Vercel using Workload Identity Federation?
const isVercelWIF =
  process.env.GOOGLE_WORKLOAD_IDENTITY_PROVIDER &&
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

// 🪣 Step 1: Ensure credentials are present
if (getApps().length > 0) {
  app = getApp();
} else {
  if (isVercelWIF) {
    // ✅ Vercel WIF mode
    const credPath = "/tmp/vercel-wif-cred.json";

    // Build the minimal credential JSON dynamically
    const wifCred = {
      type: "external_account",
      audience: process.env.GOOGLE_WORKLOAD_IDENTITY_PROVIDER,
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      token_url: "https://sts.googleapis.com/v1/token",
      service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
      credential_source: {
        file: "/dev/null",
      },
    };

    fs.writeFileSync(credPath, JSON.stringify(wifCred));
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;

    app = initializeApp({
      credential: applicationDefault(),
      projectId: process.env.GOOGLE_PROJECT_ID,
    });
  } else {
    // ✅ Local dev or key-based
    app = initializeApp({
      credential: applicationDefault(),
      projectId: process.env.GOOGLE_PROJECT_ID,
    });
  }
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

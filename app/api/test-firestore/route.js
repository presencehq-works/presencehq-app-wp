// app/api/test-firestore/route.js
import { NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";
import { Firestore } from "@google-cloud/firestore";

export async function GET() {
  try {
    console.log("🧩 Test Firestore route invoked (using @google-cloud/firestore)");
    console.log("🔍 GOOGLE_PROJECT_ID:", process.env.GOOGLE_PROJECT_ID);

    // --- Build WIF credentials ---
    const credentials = {
      type: "external_account",
      audience: process.env.GOOGLE_AUDIENCE,
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      credential_source: { environment_variable: "VERCEL_OIDC_TOKEN" },
      service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
    };

    const auth = new GoogleAuth({
      credentials,
      scopes: [
        "https://www.googleapis.com/auth/cloud-platform",
        "https://www.googleapis.com/auth/datastore",
      ],
    });

    // --- Initialize Firestore client ---
    const firestoreClient = new Firestore({
      projectId: process.env.GOOGLE_PROJECT_ID,
      auth, // this automatically uses the ExternalAccountClient
    });

    // --- Test query ---
    const snap = await firestoreClient.collection("clientSizingSubmissions").limit(1).get();

    return NextResponse.json({
      status: "✅ Firestore connection successful via WIF",
      foundDocuments: snap.size,
      projectId: process.env.GOOGLE_PROJECT_ID,
    });
  } catch (err) {
    console.error("❌ Firestore test error:", err);
    return NextResponse.json(
      {
        status: "❌ Firestore connection failed",
        error: err.message,
        projectId: process.env.GOOGLE_PROJECT_ID,
      },
      { status: 500 }
    );
  }
}

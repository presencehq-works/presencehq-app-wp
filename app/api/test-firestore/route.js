// app/api/test-firestore/route.js
import { NextResponse } from "next/server";
import { ExternalAccountClient } from "google-auth-library";
import { Firestore } from "@google-cloud/firestore";

export async function GET() {
  try {
    console.log("🧩 Test Firestore route invoked (using ExternalAccountClient)");
    console.log("🔍 GOOGLE_PROJECT_ID:", process.env.GOOGLE_PROJECT_ID);
    console.log("🔍 OIDC token present:", !!process.env.VERCEL_OIDC_TOKEN);

    // --- STEP 1: Define a token supplier function ---
    const vercelOidcTokenSupplier = async () => {
      const token = process.env.VERCEL_OIDC_TOKEN;
      if (!token) throw new Error("VERCEL_OIDC_TOKEN not found in environment.");
      return token;
    };

    // --- STEP 2: Construct External Account credentials ---
    const externalAccountClientOptions = {
      type: "external_account",

      // ✅ CRITICAL FIX: Explicitly set client_id
      client_id: "vercel-provider", // replace with your provider ID if different

      // ✅ Ensure audience is exactly correct
      audience:
        "//iam.googleapis.com/projects/111425640751/locations/global/workloadIdentityPools/vercel-pool/providers/vercel-provider",

      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      token_url: "https://sts.googleapis.com/v1/token",

      service_account_impersonation_url:
        "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/firebase-adminsdk-fbsvc@presencehq-sandbox.iam.gserviceaccount.com:generateAccessToken",

      // ✅ Correct structure for credential source
      credential_source: {
        subject_token_supplier: vercelOidcTokenSupplier,
      },
    };

    // --- STEP 3: Create the ExternalAccountClient directly ---
    const externalAuthClient = new ExternalAccountClient(externalAccountClientOptions);

    // --- STEP 4: Initialize Firestore with the custom auth client ---
    const firestoreClient = new Firestore({
      projectId: process.env.GOOGLE_PROJECT_ID,
      authClient: externalAuthClient,
    });

    // --- STEP 5: Run a test query ---
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

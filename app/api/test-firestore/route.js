// app/api/test-firestore/route.js
import { NextResponse } from "next/server";
import { ExternalAccountClient } from "google-auth-library";
import { Firestore } from "@google-cloud/firestore";

export async function GET() {
  try {
    console.log("🧩 Firestore WIF final test route invoked");
    console.log("🔍 GOOGLE_PROJECT_ID:", process.env.GOOGLE_PROJECT_ID);
    console.log("🔍 OIDC token present:", !!process.env.VERCEL_OIDC_TOKEN);

    // --- STEP 1: Token supplier for Vercel OIDC ---
    const vercelOidcTokenSupplier = async () => {
      const token = process.env.VERCEL_OIDC_TOKEN;
      if (!token) throw new Error("VERCEL_OIDC_TOKEN missing");
      return token;
    };

    // --- STEP 2: Workload Identity Federation credentials ---
    const externalAccountClientOptions = {
      type: "external_account",
      client_id: "vercel-provider",
      audience:
        "//iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/vercel-pool/providers/vercel-provider",
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      token_url: "https://sts.googleapis.com/v1/token",
      service_account_impersonation_url:
        "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/SERVICE_ACCOUNT_EMAIL:generateAccessToken",

      // 🔑 Inject function directly (this is key)
      credential_source: { subject_token_supplier: vercelOidcTokenSupplier },

      // ✅ Required scope for Firestore
      scopes: ["https://www.googleapis.com/auth/datastore"],
    };

    // --- STEP 3: Use ExternalAccountClient directly ---
    const authClient = new ExternalAccountClient(externalAccountClientOptions);

    // --- STEP 4: Initialize Firestore with custom client ---
    const firestore = new Firestore({
      projectId: process.env.GOOGLE_PROJECT_ID,
      authClient,
    });

    // --- STEP 5: Query Firestore to confirm connectivity ---
    const snap = await firestore.collection("clientSizingSubmissions").limit(1).get();

    return NextResponse.json({
      status: "✅ Firestore connection successful via direct WIF",
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

// app/api/test-firestore/route.js
import { NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";
import { Firestore } from "@google-cloud/firestore";

export async function GET() {
  try {
    console.log("🧩 Firestore WIF hybrid test route invoked");
    console.log("🔍 GOOGLE_PROJECT_ID:", process.env.GOOGLE_PROJECT_ID);
    console.log("🔍 OIDC token present:", !!process.env.VERCEL_OIDC_TOKEN);

    // --- STEP 1: Define custom token supplier for Vercel OIDC ---
    const vercelOidcTokenSupplier = async () => {
      const token = process.env.VERCEL_OIDC_TOKEN;
      if (!token) throw new Error("VERCEL_OIDC_TOKEN missing");
      return token;
    };

    // --- STEP 2: Base WIF JSON config (without function) ---
    const baseExternalAccountOptions = {
      type: "external_account",
      client_id: "vercel-provider",
      audience:
        "//iam.googleapis.com/projects/111425640751/locations/global/workloadIdentityPools/vercel-pool/providers/vercel-provider",
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      token_url: "https://sts.googleapis.com/v1/token",
      service_account_impersonation_url:
        "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/firebase-adminsdk-fbsvc@presencehq-sandbox.iam.gserviceaccount.com:generateAccessToken",
      credential_source: {},
      scopes: ["https://www.googleapis.com/auth/datastore"],
    };

    // --- STEP 3: Initialize GoogleAuth using jsonContent ---
    const auth = new GoogleAuth({ jsonContent: baseExternalAccountOptions });

    // --- STEP 4: Create the actual auth client ---
    const authClient = await auth.getClient();

    // --- STEP 5: Inject the dynamic token supplier ---
    if (typeof authClient.retrieveSubjectToken === "function") {
      console.log("🔧 Injecting subject_token_supplier into authClient...");
      authClient.retrieveSubjectToken = vercelOidcTokenSupplier;
    } else {
      throw new Error("AuthClient does not expose retrieveSubjectToken");
    }

    // --- STEP 6: Initialize Firestore with this patched client ---
    const firestore = new Firestore({
      projectId: "presencehq-sandbox",
      authClient,
    });

    // --- STEP 7: Query Firestore to confirm success ---
    const snap = await firestore.collection("clientSizingSubmissions").limit(1).get();

    return NextResponse.json({
      status: "✅ Firestore connection successful via hybrid WIF patch",
      foundDocuments: snap.size,
      projectId: "presencehq-sandbox",
    });
  } catch (err) {
    console.error("❌ Firestore test error:", err);
    return NextResponse.json(
      {
        status: "❌ Firestore connection failed",
        error: err.message,
        projectId: "presencehq-sandbox",
      },
      { status: 500 }
    );
  }
}

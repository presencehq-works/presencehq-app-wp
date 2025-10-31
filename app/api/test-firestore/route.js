// app/api/test-firestore/route.js
import { NextResponse } from "next/server";
import { ExternalAccountClient } from "google-auth-library";
import { Firestore } from "@google-cloud/firestore";

export async function GET() {
  try {
    console.log("🧩 Firestore WIF Direct Client test route invoked");

    // 🔑 Step 1 — Define token supplier for Vercel OIDC
    const vercelOidcTokenSupplier = async () => {
      const token = process.env.VERCEL_OIDC_TOKEN;
      if (!token) throw new Error("VERCEL_OIDC_TOKEN missing");
      return token;
    };

    // ⚙️ Step 2 — External Account config (explicit, static)
    const externalAccountClientOptions = {
      type: "external_account",
      client_id: "vercel-provider",
      audience:
        "//iam.googleapis.com/projects/111425640751/locations/global/workloadIdentityPools/vercel-pool/providers/vercel-provider",
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      token_url: "https://sts.googleapis.com/v1/token",
      service_account_impersonation_url:
        "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/firebase-adminsdk-fbsvc@presencehq-sandbox.iam.gserviceaccount.com:generateAccessToken",

      // ✅ Step 3 — Inject dynamic token supplier
      credential_source: { subject_token_supplier: vercelOidcTokenSupplier },

      // Required Firestore scope
      scopes: ["https://www.googleapis.com/auth/datastore"],
    };

    // 🚀 Step 4 — Instantiate client directly (no GoogleAuth)
    const authClient = new ExternalAccountClient(externalAccountClientOptions);

    // 🧩 Step 5 — Initialize Firestore with the auth client
    const firestore = new Firestore({
      projectId: "presencehq-sandbox",
      auth: authClient,
    });

    // 🧠 Step 6 — Run a test query
    const snap = await firestore.collection("clientSizingSubmissions").limit(1).get();

    return NextResponse.json({
      status: "✅ Firestore connection successful via Direct WIF Client",
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

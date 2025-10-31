// app/api/test-firestore/route.js
import { NextResponse } from "next/server";
import { IdentityPoolClient } from "google-auth-library"; // ✅ explicit subclass
import { Firestore } from "@google-cloud/firestore";

export async function GET() {
  try {
    console.log("🧩 Firestore WIF (IdentityPoolClient) test route invoked");

    // Step 1: Supply Vercel OIDC token dynamically
    const vercelOidcTokenSupplier = async () => {
      const token = process.env.VERCEL_OIDC_TOKEN;
      if (!token) throw new Error("VERCEL_OIDC_TOKEN missing");
      return token;
    };

    // Step 2: Proper Identity Pool config
    const identityPoolClientOptions = {
      type: "external_account",
      client_id: "vercel-provider",
      audience:
        "//iam.googleapis.com/projects/111425640751/locations/global/workloadIdentityPools/vercel-pool/providers/vercel-provider",
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      token_url: "https://sts.googleapis.com/v1/token",
      service_account_impersonation_url:
        "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/firebase-adminsdk-fbsvc@presencehq-sandbox.iam.gserviceaccount.com:generateAccessToken",

      // ✅ This is what we needed all along — function-based supplier
      credential_source: { subject_token_supplier: vercelOidcTokenSupplier },

      scopes: ["https://www.googleapis.com/auth/datastore"],
    };

    // Step 3: Use IdentityPoolClient constructor
    const authClient = new IdentityPoolClient(identityPoolClientOptions);

    // Step 4: Firestore initialization
    const firestore = new Firestore({
      projectId: "presencehq-sandbox",
      auth: authClient,
    });

    // Step 5: Run a test query
    const snap = await firestore.collection("clientSizingSubmissions").limit(1).get();

    return NextResponse.json({
      status: "✅ Firestore connection successful via IdentityPoolClient",
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

import { NextResponse } from "next/server";
import { Firestore } from "@google-cloud/firestore";

export async function GET() {
  try {
    console.log("🧩 Firestore Service Account Auth test route invoked");

    // 1️⃣ Decode the Base64 environment variable back into JSON
    const base64Credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
    if (!base64Credentials) throw new Error("Missing GOOGLE_APPLICATION_CREDENTIALS_BASE64");

    const decoded = Buffer.from(base64Credentials, "base64").toString("utf8");
    const credentials = JSON.parse(decoded);

    // 2️⃣ Initialize Firestore with service account credentials
    const firestore = new Firestore({
      projectId: credentials.project_id,
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
    });

    // 3️⃣ Test Firestore query
    const snap = await firestore.collection("clientSizingSubmissions").limit(1).get();

    return NextResponse.json({
      status: "✅ Firestore connection successful",
      foundDocuments: snap.size,
      projectId: credentials.project_id,
    });
  } catch (err) {
    console.error("❌ Firestore test error:", err);
    return NextResponse.json(
      {
        status: "❌ Firestore connection failed",
        error: err.message,
      },
      { status: 500 }
    );
  }
}

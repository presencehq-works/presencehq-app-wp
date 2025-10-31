// app/api/admin/client-submissions/route.js
import { NextResponse } from "next/server";
import { Firestore } from "@google-cloud/firestore";

// ✅ Decode Base64-encoded service account key from env var
const base64Key = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
if (!base64Key) {
  throw new Error("Missing GOOGLE_APPLICATION_CREDENTIALS_BASE64 env var.");
}

// Decode the JSON key from Base64
const serviceAccount = JSON.parse(
  Buffer.from(base64Key, "base64").toString("utf8")
);

// ✅ Initialize Firestore using service account credentials
const firestore = new Firestore({
  projectId: serviceAccount.project_id,
  credentials: {
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key,
  },
});

export async function GET() {
  try {
    console.log("🔍 Fetching clientSizingSubmissions...");
    const snap = await firestore
      .collection("clientSizingSubmissions")
      .orderBy("timestamp", "desc")
      .get();

    const submissions = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      status: "✅ Success",
      count: submissions.length,
      submissions,
    });
  } catch (err) {
    console.error("❌ Firestore fetch failed:", err);
    return NextResponse.json(
      {
        status: "❌ Firestore fetch failed",
        error: err.message,
      },
      { status: 500 }
    );
  }
}

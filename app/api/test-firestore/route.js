// app/api/test-firestore/route.js
import { NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

console.log("🧩 Test Firestore route invoked");
console.log("🔍 GOOGLE_PROJECT_ID:", process.env.GOOGLE_PROJECT_ID);
console.log("🔍 GOOGLE_SERVICE_ACCOUNT_EMAIL:", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
console.log("🔍 GOOGLE_WORKLOAD_IDENTITY_PROVIDER:", process.env.GOOGLE_WORKLOAD_IDENTITY_PROVIDER);
console.log("🔍 GOOGLE_AUDIENCE:", process.env.GOOGLE_AUDIENCE);
console.log("🔍 VERCEL_OIDC_TOKEN present:", !!process.env.VERCEL_OIDC_TOKEN);

export async function GET() {
  try {
    // Initialize Firebase Admin if not already done
    const app =
      getApps().length > 0
        ? getApp()
        : initializeApp({
            projectId: process.env.GOOGLE_PROJECT_ID,
          });

    const db = getFirestore(app);

    // Try reading a known collection (or a dummy one)
    const snap = await db.collection("clientSizingSubmissions").limit(1).get();
    const count = snap.size;

    return NextResponse.json({
      status: "✅ Firestore connection successful",
      foundDocuments: count,
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

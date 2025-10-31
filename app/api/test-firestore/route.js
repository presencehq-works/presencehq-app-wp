// app/api/test-firestore/route.js
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { adminDb } from "@/lib/server/firebaseAdmin";

console.log("🧩 Test Firestore route invoked");
console.log("🔍 GOOGLE_PROJECT_ID:", process.env.GOOGLE_PROJECT_ID);
console.log("🔍 GOOGLE_SERVICE_ACCOUNT_EMAIL:", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
console.log("🔍 GOOGLE_WORKLOAD_IDENTITY_PROVIDER:", process.env.GOOGLE_WORKLOAD_IDENTITY_PROVIDER);
console.log("🔍 GOOGLE_AUDIENCE:", process.env.GOOGLE_AUDIENCE);
console.log("🔍 VERCEL_OIDC_TOKEN present:", !!process.env.VERCEL_OIDC_TOKEN);

export async function GET() {
  try {
    console.log("🧩 Firebase apps currently initialized:", admin.apps.length);
    console.log("🧩 Firebase app names:", admin.apps.map((a) => a.name));

    const snap = await adminDb.collection("clientSizingSubmissions").limit(1).get();
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

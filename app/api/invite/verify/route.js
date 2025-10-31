import { NextResponse } from "next/server";
import { Firestore } from "@google-cloud/firestore";

let firestore;

try {
  console.log("🧩 Checking env vars...");
  console.log("GOOGLE_PROJECT_ID:", process.env.GOOGLE_PROJECT_ID);
  console.log(
    "GOOGLE_CREDENTIALS_BASE64 length:",
    process.env.GOOGLE_CREDENTIALS_BASE64
      ? process.env.GOOGLE_CREDENTIALS_BASE64.length
      : "undefined"
  );

  const base64 = process.env.GOOGLE_CREDENTIALS_BASE64;
  if (!base64) throw new Error("GOOGLE_CREDENTIALS_BASE64 not set");

  const decoded = Buffer.from(base64, "base64").toString("utf8");
  console.log("Decoded starts with:", decoded.slice(0, 80));

  const credentials = JSON.parse(decoded);
  firestore = new Firestore({
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
  });
  console.log("✅ Firestore initialized successfully");
} catch (initError) {
  console.error("❌ Firestore initialization error:", initError);
}

export async function GET(req) {
  try {
    if (!firestore) throw new Error("Firestore client not initialized");

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    const docRef = firestore.doc(`invites/${token}`);
    const doc = await docRef.get();

    if (!doc.exists)
      return NextResponse.json({ status: "❌ Invalid token" }, { status: 404 });

    const data = doc.data();
    if (data.used)
      return NextResponse.json(
        { status: "⚠️ Token already used", email: data.email },
        { status: 403 }
      );

    await docRef.update({ used: true });
    return NextResponse.json({
      status: "✅ Valid token",
      valid: true,
      email: data.email,
      projectId: process.env.GOOGLE_PROJECT_ID,
    });
  } catch (error) {
    console.error("❌ Invite verification error:", error);
    return NextResponse.json(
      { status: "❌ Error verifying invite", error: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { Firestore } from "@google-cloud/firestore";

let firestore;

try {
  // Decode Base64 credentials
  const base64 = process.env.GOOGLE_CREDENTIALS_BASE64;
  if (!base64) throw new Error("GOOGLE_CREDENTIALS_BASE64 not set");

  const credentials = JSON.parse(
    Buffer.from(base64, "base64").toString("utf8")
  );

  // Initialize Firestore explicitly with credentials
  firestore = new Firestore({
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
  });
} catch (initError) {
  console.error("❌ Firestore initialization error:", initError);
}

export async function GET(req) {
  try {
    if (!firestore) throw new Error("Firestore client not initialized");

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.json({ status: "❌ Missing token" }, { status: 400 });
    }

    const docRef = firestore.doc(`invites/${token}`);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { status: "❌ Invalid token", valid: false },
        { status: 404 }
      );
    }

    const data = doc.data();
    if (data.used) {
      return NextResponse.json(
        { status: "⚠️ Token already used", valid: false, email: data.email },
        { status: 403 }
      );
    }

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

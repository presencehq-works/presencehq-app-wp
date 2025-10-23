// app/api/auth/forgot-password/route.js
import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";

if (!getApps().length) {
  initializeApp({ credential: applicationDefault() });
}

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const link = await getAuth().generatePasswordResetLink(email);
    return NextResponse.json({ success: true, link });
  } catch (err) {
    console.error("Password reset error:", err);
    return NextResponse.json(
      { error: "Unable to send reset link" },
      { status: 500 }
    );
  }
}


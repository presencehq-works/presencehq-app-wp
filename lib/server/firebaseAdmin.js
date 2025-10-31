// lib/server/firebaseAdmin.js
import "server-only";
import { initializeApp, getApps, getApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Detect environment (local vs Vercel)
const isVercel = !!process.env.VERCEL;

// --- Initialize Firebase Admin ---
const app =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        // ✅ Use workload identity (applicationDefault) when on Vercel
        credential: isVercel
          ? applicationDefault()
          : undefined,
        projectId: process.env.GOOGLE_PROJECT_ID || "presencehq-sandbox",
      });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

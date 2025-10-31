// lib/server/firebaseAdmin.js
import "server-only";
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Parse the JSON key stored in your environment
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY_JSON);

const app =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        credential: cert(serviceAccount),
        projectId: "presencehq-sandbox",
      });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

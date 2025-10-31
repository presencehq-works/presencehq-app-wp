// lib/server/firebaseAdmin.js
import "server-only";
import { initializeApp, getApps, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// When using Workload Identity Federation (no JSON key needed)
const app =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

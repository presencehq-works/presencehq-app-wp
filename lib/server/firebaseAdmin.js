// lib/server/firebaseAdmin.js
import 'server-only';
import { initializeApp, applicationDefault, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const app = getApps().length
  ? getApp()
  : initializeApp({
      // Uses Application Default Credentials locally.
      credential: applicationDefault(),
      // Helps when multiple projects are on your machine.
      projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
    });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

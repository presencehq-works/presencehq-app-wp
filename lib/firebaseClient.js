// lib/firebaseClient.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app;
try {
  if (!firebaseConfig.apiKey) {
    throw new Error("⚠️ Firebase config missing — check NEXT_PUBLIC_FIREBASE_* vars.");
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log("✅ Firebase initialized (client)");
  } else {
    app = getApp();
    console.log("♻️ Using existing Firebase app (client)");
  }
} catch (err) {
  console.error("❌ Firebase init error:", err);
}

const auth = app ? getAuth(app) : null;
export { app, auth };

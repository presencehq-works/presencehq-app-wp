// lib/firebaseClient.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ✅ Initialize or reuse app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Get auth instance and enforce persistent login
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('⚠️ Failed to set persistence:', err.message);
});

// ✅ TEMPORARY DEBUG HOOK
if (typeof window !== 'undefined') {
  window.auth = auth;
  console.log('🧩 Firebase Auth exposed globally for debugging');
}

export { app, auth };

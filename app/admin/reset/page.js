// app/admin/reset/page.js
"use client";

import { Suspense, useEffect, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { useSearchParams, useRouter } from "next/navigation";
import { validatePassword } from "@/utils/validation";

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  useEffect(() => {
    if (mode !== "resetPassword" || !oobCode) return;

    verifyPasswordResetCode(auth, oobCode)
      .then((email) => setEmail(email))
      .catch(() => setError("Invalid or expired password reset link."));
  }, [mode, oobCode]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol."
      );
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
      setTimeout(() => router.replace("/admin/login"), 2000);
    } catch (err) {
      console.error(err);
      setError("Error resetting password. Try again.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-presence-dark text-presence-light">
        <p className="text-presence-green text-lg">
          ✅ Password updated! Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-presence-dark text-presence-light">
      <form
        onSubmit={handleReset}
        className="bg-presence-mid/40 border border-presence-mid rounded-xl p-8 w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center text-presence-accent">
          Reset Password
        </h1>

        {email && (
          <p className="text-center text-sm opacity-80 mb-3">
            for <span className="text-presence-accent">{email}</span>
          </p>
        )}

        {/* ✅ New password with toggle */}
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            id="new-password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-2 rounded-md bg-transparent border border-presence-mid focus:ring-2 focus:ring-presence-accent outline-none pr-10"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-2 text-sm text-presence-accent hover:text-presence-accent2 focus:outline-none"
          >
            {showNew ? "Hide" : "Show"}
          </button>
        </div>

        {/* ✅ Confirm password with toggle */}
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            id="confirm-password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-2 rounded-md bg-transparent border border-presence-mid focus:ring-2 focus:ring-presence-accent outline-none pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-2 text-sm text-presence-accent hover:text-presence-accent2 focus:outline-none"
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>

        {error && <p className="text-center text-presence-red">{error}</p>}

        <button
          type="submit"
          className="w-full bg-presence-accent hover:bg-presence-accent2 text-white py-2 rounded-md font-medium transition"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}

// ✅ Wrap in Suspense to fix Next.js 15 build error
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading reset form...</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}

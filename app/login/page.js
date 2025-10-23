// app/login/page.js
"use client";

import { useState, useEffect } from "react";
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  getAuth,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Complete magic-link sign-in
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isSignInWithEmailLink(auth, window.location.href)) {
      const storedEmail = window.localStorage.getItem("emailForSignIn");
      if (!storedEmail) {
        setMessage("Please re-enter your email to complete sign-in.");
        return;
      }

      signInWithEmailLink(auth, storedEmail, window.location.href)
        .then(() => {
          window.localStorage.removeItem("emailForSignIn");
          router.replace("/client-sizing");
        })
        .catch((error) => {
          console.error("Sign-in error:", error);
          setMessage(`Error signing in: ${error.message}`);
        });
    }
  }, [router]);

  // ✅ Send sign-in link
  const handleSendLink = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const emailId = email.toLowerCase().trim();
      const safeEmailId = emailId.replace(/[.#$[\]@]/g, "_");

      // Check if the user has already submitted
      const existing = await getDoc(doc(db, "submissionEmails", safeEmailId));
      if (existing.exists()) {
        setMessage("✅ We already have your submission. No need to sign in again.");
        setLoading(false);
        return;
      }

      // Action code settings for magic link
      const actionCodeSettings = {
        url: "http://localhost:3000/login", // redirect to same page to complete sign-in
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, emailId, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", emailId);
      setMessage(`✅ Sign-in link sent to ${emailId}. Check your inbox.`);
    } catch (error) {
      console.error("Error sending link:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-presence-dark text-presence-light">
      <form
        onSubmit={handleSendLink}
        className="bg-presence-mid/40 border border-presence-mid rounded-xl p-8 w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center text-presence-accent">
          PresenceHQ Sign In
        </h1>
        <p className="text-sm text-center opacity-80">
          Enter your email to receive a secure sign-in link.
        </p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full p-2 rounded-md bg-transparent border border-presence-mid focus:ring-2 focus:ring-presence-accent outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-presence-accent hover:bg-presence-accent2 text-white py-2 rounded-md font-medium transition"
        >
          {loading ? "Sending..." : "Send Sign-In Link"}
        </button>

        {message && (
          <p className="text-center text-sm mt-3 text-presence-light">{message}</p>
        )}
      </form>
    </div>
  );
}

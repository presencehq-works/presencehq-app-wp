// app/page.js
"use client";

import { useEffect } from "react";
import { isSignInWithEmailLink, getAuth, signInWithEmailLink } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../firebaseConfig";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // If this URL contains a sign-in link, complete it and then go to client-sizing.
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const email = window.localStorage.getItem("emailForSignIn");
      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then(() => {
            window.localStorage.removeItem("emailForSignIn");
            router.replace("/client-sizing");
          })
          .catch(() => router.replace("/login"));
      } else {
        router.replace("/login");
      }
    } else {
      // Default: always go to login page
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <p>Redirecting...</p>
    </div>
  );
}

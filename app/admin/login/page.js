// app/admin/login/page.js
"use client";

console.log("🧩 Firebase env check:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/firebaseConfig"; // ✅ use shared config

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const tokenResult = await userCred.user.getIdTokenResult();
      const role = tokenResult.claims?.role || "user";

      // ✅ Check admin claim
      if (role !== "admin") {
        setError("Access denied: not an admin account.");
        await signOut(auth);
        return;
      }

      // ✅ Store secure cookie via API route (server-side)
      const token = tokenResult.token;
      await fetch("/api/set-admin-cookie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      router.replace("/admin/client-submissions");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid credentials or access denied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-presence-dark text-presence-light">
      <form
        onSubmit={handleLogin}
        className="bg-presence-mid/40 border border-presence-mid rounded-xl p-8 w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center text-presence-accent">
          Admin Login
        </h1>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full p-2 rounded-md bg-transparent border border-presence-mid focus:ring-2 focus:ring-presence-accent outline-none"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full p-2 rounded-md bg-transparent border border-presence-mid focus:ring-2 focus:ring-presence-accent outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-presence-accent hover:bg-presence-accent2 text-white py-2 rounded-md font-medium transition"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        {error && (
          <p className="text-center text-presence-red mt-2">{error}</p>
        )}
      </form>
    </div>
  );
}

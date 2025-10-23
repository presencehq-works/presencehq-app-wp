
"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSent(false);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-presence-dark text-presence-light">
      <form
        onSubmit={handleSubmit}
        className="bg-presence-mid/40 border border-presence-mid rounded-xl p-8 w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center text-presence-accent">
          Reset Password
        </h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="w-full p-2 rounded-md bg-transparent border border-presence-mid focus:ring-2 focus:ring-presence-accent outline-none"
        />
        <button
          type="submit"
          className="w-full bg-presence-accent hover:bg-presence-accent2 text-white py-2 rounded-md font-medium transition"
        >
          Send Reset Link
        </button>
        {sent && (
          <p className="text-center text-presence-green mt-2">
            Reset link sent! Check your inbox.
          </p>
        )}
        {error && (
          <p className="text-center text-presence-red mt-2">{error}</p>
        )}
      </form>
    </div>
  );
}
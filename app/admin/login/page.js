'use client';
import { useState, useEffect } from 'react';
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  // Handle return from magic link
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let storedEmail = window.localStorage.getItem('emailForSignIn');
      if (!storedEmail) storedEmail = window.prompt('Confirm your email');
      signInWithEmailLink(auth, storedEmail, window.location.href)
        .then(() => {
          window.localStorage.removeItem('emailForSignIn');
          setStatus('✅ Signed in!');
          window.location.href = '/admin/client-submissions';
        })
        .catch((error) => {
          console.error('❌ Sign-in failed:', error);
          setStatus('❌ Sign-in failed');
        });
    }
  }, []);

  const handleSendLink = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/admin/login`,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setStatus(`✅ Login link sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send link:', error);
      setStatus('❌ Failed to send link');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form
        onSubmit={handleSendLink}
        className="bg-gray-800 rounded-2xl shadow-xl p-10 w-full max-w-sm flex flex-col items-center space-y-4 border border-gray-700"
      >
        <h1 className="text-2xl font-semibold text-center text-[#5efc8d]">
          PresenceHQ Admin Login
        </h1>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5efc8d]"
          required
        />

        <button
          type="submit"
          className="w-full bg-[#5efc8d] text-gray-900 font-semibold py-2 rounded-md hover:bg-[#49d67a] transition-colors"
        >
          Send Login Link
        </button>

        {status && (
          <p className="text-sm text-center mt-2">
            {status.includes('✅') ? (
              <span className="text-green-400">{status}</span>
            ) : (
              <span className="text-red-400">{status}</span>
            )}
          </p>
        )}
      </form>
    </div>
  );
}

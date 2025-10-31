'use client';
import { useState, useEffect } from 'react';
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  // ✅ Detect existing session and auto-redirect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        window.location.href = '/admin/client-submissions';
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Handle sign-in via email link
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let storedEmail = window.localStorage.getItem('emailForSignIn');
      if (!storedEmail) {
        storedEmail = window.prompt('Confirm your email address');
      }
      signInWithEmailLink(auth, storedEmail, window.location.href)
        .then(() => {
          window.localStorage.removeItem('emailForSignIn');
          setStatus('✅ Signed in!');
          window.location.href = '/admin/client-submissions';
        })
        .catch((error) => {
          console.error('❌ Sign-in failed:', error);
          window.localStorage.removeItem('emailForSignIn');
          setStatus('⚠️ Invalid or expired link. Please request a new one.');
        });
    }
  }, []);

  // ✅ Send login link
  const handleSendLink = async (e) => {
    e.preventDefault();
    try {
      const actionCodeSettings = {
        url: 'https://presencehq-sandbox.vercel.app/admin/login',
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
    <div style={{ maxWidth: 400, margin: '100px auto', textAlign: 'center' }}>
      <h2>PresenceHQ Admin Login</h2>
      <form onSubmit={handleSendLink}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: 10,
            marginBottom: 10,
            border: '1px solid #999',
            borderRadius: 6,
          }}
          required
        />
        <button
          type="submit"
          style={{
            width: '100%',
            padding: 10,
            background: '#222',
            color: '#fff',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Send Login Link
        </button>
      </form>
      <p>{status}</p>
    </div>
  );
}

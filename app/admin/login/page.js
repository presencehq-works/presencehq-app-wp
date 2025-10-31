'use client';
import { useState, useEffect } from 'react';
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import { auth } from '@/lib/firebaseClient'; // ✅ import shared instance

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  // Automatically handle the link click when coming from email
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
          setStatus('❌ Sign-in failed');
        });
    }
  }, []);

  // Send login link
  const handleSendLink = async (e) => {
    e.preventDefault();
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
    <div style={{ maxWidth: 400, margin: '100px auto', textAlign: 'center' }}>
      <h2>PresenceHQ Admin Login</h2>
      <form onSubmit={handleSendLink}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 10 }}
          required
        />
        <button type="submit">Send Login Link</button>
      </form>
      <p>{status}</p>
    </div>
  );
}

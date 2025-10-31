'use client';
import { useState, useEffect, useRef } from 'react';
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('🟡 Starting...');
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState({});
  const hasRedirected = useRef(false);

  // ✅ Listen for existing user sessions — NO redirect for now
  useEffect(() => {
    const d = {};
    d.authDefined = !!auth;

    if (!auth) {
      d.error = '❌ Firebase Auth not initialized';
      setStatus('⚠️ Firebase not configured correctly');
      setDebug(d);
      setLoading(false);
      return;
    }

    d.beforeListener = true;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      d.listenerTriggered = true;
      d.user = user ? user.email || '(user exists)' : 'no user';

      if (user) {
        setStatus(`✅ Logged in as ${user.email}`);
      } else {
        setStatus('👀 No active session — ready for login.');
      }

      setDebug(d);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Handle magic-link sign-in (no redirect yet)
  useEffect(() => {
    if (!auth) return;

    if (isSignInWithEmailLink(auth, window.location.href)) {
      setStatus('📩 Handling sign-in link...');
      let storedEmail = window.localStorage.getItem('emailForSignIn');
      if (!storedEmail) storedEmail = window.prompt('Confirm your email address');

      signInWithEmailLink(auth, storedEmail, window.location.href)
        .then(() => {
          window.localStorage.removeItem('emailForSignIn');
          setStatus(`✅ Signed in as ${storedEmail}`);
        })
        .catch((error) => {
          console.error('❌ Sign-in failed:', error);
          setStatus(`❌ Sign-in failed: ${error.message}`);
        });
    }
  }, []);

  // ✅ Send login link to email
  const handleSendLink = async (e) => {
    e.preventDefault();
    if (!auth) {
      setStatus('⚠️ Firebase not initialized');
      return;
    }
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
      setStatus(`❌ Failed to send link: ${error.message}`);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0b0b0b',
        color: '#e3e3e3',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        fontFamily: 'monospace',
      }}
    >
      <h2 style={{ color: '#00ff99' }}>PresenceHQ Login Debug</h2>
      <p>{status}</p>
      <pre
        style={{
          textAlign: 'left',
          background: '#111',
          padding: '1rem',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '600px',
          overflow: 'auto',
          color: '#00ff99',
          fontSize: '0.8rem',
        }}
      >
        {JSON.stringify(debug, null, 2)}
      </pre>

      {!loading && (
        <form
          onSubmit={handleSendLink}
          style={{
            background: '#121212',
            border: '1px solid #333',
            padding: '1.5rem',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '360px',
            textAlign: 'center',
            marginTop: '1rem',
          }}
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '8px',
              border: '1px solid #444',
              background: '#1c1c1c',
              color: '#fff',
            }}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              background: '#00ff99',
              color: '#000',
              fontWeight: 600,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Send Login Link
          </button>
        </form>
      )}
    </div>
  );
}

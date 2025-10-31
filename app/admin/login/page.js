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
  const [status, setStatus] = useState('🟡 Initializing...');
  const [loading, setLoading] = useState(true);
  const hasRedirected = useRef(false);
  const listenerAttached = useRef(false);

  // ✅ Attach listener ONCE
  useEffect(() => {
    if (!auth || listenerAttached.current) return;
    listenerAttached.current = true;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !hasRedirected.current) {
        hasRedirected.current = true;
        setStatus(`✅ Logged in as ${user.email} — redirecting...`);
        // short delay for UI feedback
        setTimeout(() => {
          window.location.replace('/admin/client-submissions');
        }, 1000);
      } else if (!user) {
        setStatus('👀 No active session — ready for login.');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Handle magic link sign-in once
  useEffect(() => {
    if (!auth) return;
    const href = window.location.href;
    if (isSignInWithEmailLink(auth, href)) {
      setStatus('📩 Handling sign-in link...');
      let storedEmail = window.localStorage.getItem('emailForSignIn');
      if (!storedEmail) storedEmail = window.prompt('Confirm your email address');
      signInWithEmailLink(auth, storedEmail, href)
        .then(() => {
          window.localStorage.removeItem('emailForSignIn');
          setStatus(`✅ Signed in as ${storedEmail}`);
        })
        .catch((error) => {
          console.error('❌ Sign-in failed:', error);
          setStatus(`❌ Sign-in failed: ${error.message}`);
          setLoading(false);
        });
    } else {
      setLoading(false);
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
      setStatus(`❌ Failed to send link: ${error.message}`);
    }
  };

  if (loading)
    return (
      <div
        style={{
          color: '#00ff99',
          textAlign: 'center',
          marginTop: 150,
          fontFamily: 'sans-serif',
        }}
      >
        {status}
      </div>
    );

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
        fontFamily: 'sans-serif',
      }}
    >
      <form
        onSubmit={handleSendLink}
        style={{
          background: '#121212',
          border: '1px solid #333',
          padding: '2rem',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '380px',
          textAlign: 'center',
          boxShadow: '0 0 20px rgba(0,255,100,0.1)',
        }}
      >
        <h2 style={{ color: '#00ff99', marginBottom: '1rem' }}>
          PresenceHQ Admin Login
        </h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '12px',
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
            transition: 'background 0.3s ease',
          }}
          onMouseOver={(e) => (e.target.style.background = '#00e88a')}
          onMouseOut={(e) => (e.target.style.background = '#00ff99')}
        >
          Send Login Link
        </button>

        <p style={{ marginTop: '1rem', color: '#00ff99' }}>{status}</p>
      </form>
    </div>
  );
}

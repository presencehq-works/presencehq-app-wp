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
  const [loading, setLoading] = useState(true);

  // ✅ Detect session, redirect only once
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && window.location.pathname === '/admin/login') {
        // Only redirect if we're *on* the login page
        window.location.replace('/admin/client-submissions');
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Handle magic link sign-in
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
          window.location.replace('/admin/client-submissions');
        })
        .catch((error) => {
          console.error('❌ Sign-in failed:', error);
          window.localStorage.removeItem('emailForSignIn');
          setStatus('⚠️ Invalid or expired link. Please request a new one.');
        });
    }
  }, []);

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

  if (loading) return <div style={{ color: '#0f0', textAlign: 'center', marginTop: 100 }}>Loading...</div>;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0b0b0b',
        color: '#e3e3e3',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
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

        {status && (
          <p
            style={{
              marginTop: '1rem',
              color: status.includes('✅')
                ? '#00ff99'
                : status.includes('⚠️')
                ? '#ffcc00'
                : '#ff4444',
            }}
          >
            {status}
          </p>
        )}
      </form>
    </div>
  );
}

'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  onAuthStateChanged,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendSignInLinkToEmail,
} from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('Checking authentication...');
  const [redirecting, setRedirecting] = useState(false);
  const [linkVerificationComplete, setLinkVerificationComplete] = useState(false);
  const hasRedirected = useRef(false);

  // 🔹 Handle existing logged-in users (only redirects if not from link)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !redirecting && !hasRedirected.current) {
        if (linkVerificationComplete) {
          // Let link verification handle its own redirect
          setStatus(`✅ Logged in as ${user.email} (link verified handled redirect)`);
          return;
        }

        hasRedirected.current = true;
        setRedirecting(true);
        setStatus(`✅ Logged in as ${user.email} — redirecting...`);
        setTimeout(() => router.replace('/admin/client-submissions'), 100);
      }
    });

    return () => unsubscribe();
  }, [router, redirecting, linkVerificationComplete]);

  // 🔹 Handle sign-in via email link
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let storedEmail = window.localStorage.getItem('emailForSignIn');
      if (!storedEmail) storedEmail = window.prompt('Confirm your email address');
      if (!storedEmail) {
        setStatus('❌ Sign-in failed: Email required.');
        return;
      }

      setStatus('⏳ Verifying sign-in link...');
      signInWithEmailLink(auth, storedEmail, window.location.href)
        .then(() => {
          window.localStorage.removeItem('emailForSignIn');
          setLinkVerificationComplete(true);
          hasRedirected.current = true;
          setRedirecting(true);
          setStatus('✅ Sign-in link verified — redirecting...');
          setTimeout(() => router.replace('/admin/client-submissions'), 500);
        })
        .catch((error) => {
          console.error('❌ Sign-in failed:', error);
          setStatus(`❌ Sign-in failed: ${error.message}`);
          router.replace('/admin/login');
        });
    } else {
      // Clear stale email if not in link flow
      window.localStorage.removeItem('emailForSignIn');
    }
  }, [router]);

  // 🔹 Send the login link
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

  // 🔹 UI
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
      <h2 style={{ color: '#00ff99' }}>PresenceHQ Admin Login</h2>
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
      </form>

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
    </div>
  );
}

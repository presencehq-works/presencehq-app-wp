'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      console.log('✅ Redirecting authenticated user...');
      router.replace('/admin/client-submissions');
    }
  }, [loading, user, router]);

  // ✅ Handle email link verification
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const storedEmail = window.localStorage.getItem('emailForSignIn');
      if (!storedEmail) {
        setStatus('❌ Missing stored email — please enter it again.');
        return;
      }
      setStatus('⏳ Verifying sign-in link...');
      signInWithEmailLink(auth, storedEmail, window.location.href)
        .then(() => {
          window.localStorage.removeItem('emailForSignIn');
          setStatus('✅ Sign-in successful — redirecting...');
          setTimeout(() => router.replace('/admin/client-submissions'), 600);
        })
        .catch((err) => setStatus(`❌ ${err.message}`));
    }
  }, [router]);

  const handleSendLink = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setStatus('⏳ Sending login link...');
    try {
      const settings = {
        url: 'https://presencehq-sandbox.vercel.app/admin/login',
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, settings);
      window.localStorage.setItem('emailForSignIn', email);
      setStatus(`✅ Login link sent to ${email}`);
    } catch (err) {
      setStatus(`❌ ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p style={{ color: '#00ff99', textAlign: 'center', marginTop: '4rem' }}>Authenticating...</p>;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0b0b0b',
        color: '#e3e3e3',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        fontFamily: 'sans-serif',
      }}
    >
      <h2 style={{ color: '#00ff99', marginBottom: '1rem' }}>PresenceHQ Admin Login</h2>
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
          disabled={sending}
          style={{
            width: '100%',
            padding: '10px',
            background: sending ? '#444' : '#00ff99',
            color: '#000',
            fontWeight: 600,
            border: 'none',
            borderRadius: '8px',
            cursor: sending ? 'not-allowed' : 'pointer',
            transition: 'background 0.3s ease',
          }}
        >
          {sending ? '⏳ Sending...' : 'Send Login Link'}
        </button>

        {status && (
          <p
            style={{
              marginTop: '1rem',
              color: status.startsWith('✅')
                ? '#00ff99'
                : status.startsWith('⏳')
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

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const storedEmail = window.localStorage.getItem('emailForSignIn');
      if (!storedEmail) {
        setStatus('❌ Missing stored email.');
        return;
      }
      setStatus('⏳ Verifying...');
      signInWithEmailLink(auth, storedEmail, window.location.href)
        .then(() => {
          window.localStorage.removeItem('emailForSignIn');
          setStatus('✅ Signed in — redirecting...');
          router.replace('/admin/client-submissions');
        })
        .catch(err => setStatus(`❌ ${err.message}`));
    }
  }, [router]);

  const handleSendLink = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus('⏳ Sending link...');
    try {
      await sendSignInLinkToEmail(auth, email, {
        url: 'https://presencehq-sandbox.vercel.app/admin/login',
        handleCodeInApp: true,
      });
      window.localStorage.setItem('emailForSignIn', email);
      setStatus(`✅ Link sent to ${email}`);
    } catch (err) {
      setStatus(`❌ ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleSendLink}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={sending}>
          {sending ? 'Sending...' : 'Send Login Link'}
        </button>
      </form>
      <p>{status}</p>
    </div>
  );
}

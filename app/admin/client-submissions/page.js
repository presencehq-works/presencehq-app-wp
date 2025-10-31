'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ClientSubmissionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 🔒 Redirect if not logged in once loading finishes
  useEffect(() => {
    if (!loading && !user) {
      console.log('🚫 No user, redirecting to login...');
      router.replace('/admin/login');
    }
  }, [user, loading, router]);

  // 🕓 Show loading message while auth state is initializing
  if (loading) {
    return (
      <div
        style={{
          color: '#00ff99',
          textAlign: 'center',
          marginTop: '5rem',
          fontFamily: 'sans-serif',
        }}
      >
        Authenticating...
      </div>
    );
  }

  // 🚫 While redirecting, show a quick message instead of blank
  if (!user) {
    return (
      <div
        style={{
          color: '#ff4444',
          textAlign: 'center',
          marginTop: '5rem',
          fontFamily: 'sans-serif',
        }}
      >
        Redirecting to login...
      </div>
    );
  }

  // ✅ Authenticated content
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0b0b0b',
        color: '#e3e3e3',
        fontFamily: 'sans-serif',
        padding: '2rem',
      }}
    >
      <h1 style={{ color: '#00ff99' }}>Welcome, {user.email}</h1>
      <p>✅ You’re successfully logged in to the PresenceHQ admin dashboard.</p>
      <p style={{ opacity: 0.8 }}>
        This is where client submissions and admin tools will appear.
      </p>
    </div>
  );
}

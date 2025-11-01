'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ClientSubmissionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('🚫 No user — redirecting to login');
        router.replace('/admin/login');
      } else {
        console.log('✅ Authenticated user:', user.email);
      }
    }
  }, [loading, user, router]);

  // While loading, don't render or redirect yet
  if (loading) {
    return (
      <div style={{ color: '#00ff99', textAlign: 'center', marginTop: 100 }}>
        Loading session...
      </div>
    );
  }

  // If no user (redirect will happen), render nothing to avoid flicker
  if (!user) return null;

  // ✅ Authenticated view
  return (
    <div
      style={{
        color: '#e3e3e3',
        background: '#0b0b0b',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <h1 style={{ color: '#00ff99' }}>Client Submissions</h1>
      <p>Welcome, {user.email}</p>
      <p>This means the redirect loop is officially dead 🎯</p>
    </div>
  );
}

'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ClientSubmissionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/admin/login');
  }, [user, loading, router]);

  if (loading)
    return (
      <div style={{ textAlign: 'center', color: '#00ff99', marginTop: '4rem' }}>
        Authenticating...
      </div>
    );

  if (!user) return null;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0b0b0b',
        color: '#e3e3e3',
        padding: '2rem',
        fontFamily: 'sans-serif',
      }}
    >
      <h1 style={{ color: '#00ff99' }}>Welcome, {user.email}</h1>
      <p>You are logged in successfully 🎉</p>
    </div>
  );
}

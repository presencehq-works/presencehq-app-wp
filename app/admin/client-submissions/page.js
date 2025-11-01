'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ClientSubmissionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/admin/login');
  }, [loading, user, router]);

  if (loading) return <p style={{ color: '#00ff99', textAlign: 'center', marginTop: 100 }}>Loading session...</p>;
  if (!user) return null;

  return (
    <div style={{ color: '#e3e3e3', background: '#0b0b0b', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#00ff99' }}>Welcome, {user.email}</h1>
      <p>✅ Authenticated successfully. Protected route works.</p>
    </div>
  );
}

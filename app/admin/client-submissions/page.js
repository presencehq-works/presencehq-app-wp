'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ClientSubmissionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/admin/login');
    }
  }, [loading, user, router]);

  if (loading) return <div>Loading user session...</div>;
  if (!user) return null;

  return (
    <div style={{ color: '#00ff99', textAlign: 'center', marginTop: '4rem' }}>
      <h1>Welcome, {user.email}</h1>
      <p>You are authenticated. Client submissions load below.</p>
    </div>
  );
}

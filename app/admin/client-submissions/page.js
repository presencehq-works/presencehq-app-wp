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

  if (loading || !user) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#00ff99' }}>
        Loading protected page...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Client Submissions</h1>
      <p>Welcome, {user.email}</p>
    </div>
  );
}

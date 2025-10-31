'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ClientSubmissionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [status, setStatus] = useState('Loading submissions...');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/admin/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && user) {
      fetch('/api/admin/client-submissions')
        .then((r) => r.json())
        .then((d) => {
          setData(d.submissions || []);
          setStatus('');
        })
        .catch(() => setStatus('❌ Failed to load submissions'));
    }
  }, [loading, user]);

  if (loading || !user)
    return <p style={{ textAlign: 'center', color: '#00ff99', marginTop: '4rem' }}>Authenticating...</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', color: '#e3e3e3' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#00ff99' }}>
        Client Submissions
      </h1>
      {status && <p style={{ textAlign: 'center' }}>{status}</p>}
      {data.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No submissions found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #333' }}>
          <thead>
            <tr style={{ backgroundColor: '#1c1c1c', color: '#00ff99' }}>
              <th style={{ padding: '8px', border: '1px solid #333' }}>Business</th>
              <th style={{ padding: '8px', border: '1px solid #333' }}>Industry</th>
              <th style={{ padding: '8px', border: '1px solid #333' }}>Revenue</th>
              <th style={{ padding: '8px', border: '1px solid #333' }}>Employees</th>
              <th style={{ padding: '8px', border: '1px solid #333' }}>Email</th>
              <th style={{ padding: '8px', border: '1px solid #333' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.id}>
                <td style={{ padding: '8px', border: '1px solid #333' }}>{s.businessName}</td>
                <td style={{ padding: '8px', border: '1px solid #333' }}>{s.industry}</td>
                <td style={{ padding: '8px', border: '1px solid #333' }}>{s.monthlyRevenue}</td>
                <td style={{ padding: '8px', border: '1px solid #333' }}>{s.employees}</td>
                <td style={{ padding: '8px', border: '1px solid #333' }}>{s.email}</td>
                <td style={{ padding: '8px', border: '1px solid #333' }}>
                  {new Date(s.timestamp).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

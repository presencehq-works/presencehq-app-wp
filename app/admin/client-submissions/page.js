'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';

export default function ClientSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // ✅ Check authentication state first
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setAuthChecked(true);
      } else {
        // no user — redirect to login after short delay
        setTimeout(() => {
          window.location.replace('/admin/login');
        }, 800);
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Fetch submissions only after auth confirmed
  useEffect(() => {
    if (!authChecked || !user) return;

    async function fetchSubmissions() {
      try {
        const res = await fetch('/api/admin/client-submissions');
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to load submissions');

        setSubmissions(data.submissions || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  }, [authChecked, user]);

  if (!authChecked) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#00ff99' }}>
        Checking authentication...
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#00ff99' }}>
        Loading submissions...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        <h3>❌ Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem',
        color: '#e3e3e3',
        backgroundColor: '#0b0b0b',
        minHeight: '100vh',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Client Submissions</h1>
        <div>
          <span style={{ marginRight: '1rem', color: '#00ff99' }}>{user?.email}</span>
          <button
            onClick={() => signOut(auth).then(() => window.location.replace('/admin/login'))}
            style={{
              background: '#00ff99',
              color: '#000',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {submissions.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>No submissions found.</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #333',
            borderRadius: '8px',
            overflow: 'hidden',
            marginTop: '2rem',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#121212' }}>
              <th style={{ padding: '10px', border: '1px solid #333' }}>Business</th>
              <th style={{ padding: '10px', border: '1px solid #333' }}>Industry</th>
              <th style={{ padding: '10px', border: '1px solid #333' }}>Revenue</th>
              <th style={{ padding: '10px', border: '1px solid #333' }}>Employees</th>
              <th style={{ padding: '10px', border: '1px solid #333' }}>Email</th>
              <th style={{ padding: '10px', border: '1px solid #333' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.id}>
                <td style={{ padding: '10px', border: '1px solid #333' }}>{s.businessName}</td>
                <td style={{ padding: '10px', border: '1px solid #333' }}>{s.industry}</td>
                <td style={{ padding: '10px', border: '1px solid #333' }}>{s.monthlyRevenue}</td>
                <td style={{ padding: '10px', border: '1px solid #333' }}>{s.employees}</td>
                <td style={{ padding: '10px', border: '1px solid #333' }}>{s.email}</td>
                <td style={{ padding: '10px', border: '1px solid #333' }}>
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

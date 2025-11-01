'use client';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function DebugPage() {
  const [state, setState] = useState('Checking...');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    console.log('🔥 Starting Firebase auth debug test...');
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('✅ Firebase user detected:', user.email);
        setState(`✅ Firebase sees ${user.email}`);
        setDetails({
          uid: user.uid,
          emailVerified: user.emailVerified,
          lastLogin: user.metadata?.lastSignInTime,
        });
      } else {
        console.log('❌ No Firebase user detected.');
        setState('❌ No Firebase user detected.');
      }
    });
  }, []);

  return (
    <div style={{ color: '#00ff99', padding: 50, fontFamily: 'monospace' }}>
      <h2>Firebase Debug</h2>
      <p>{state}</p>
      {details && (
        <pre style={{ color: '#ccc', background: '#111', padding: '1rem' }}>
          {JSON.stringify(details, null, 2)}
        </pre>
      )}
    </div>
  );
}

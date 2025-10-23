// app/admin/client-submissions/page.js
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '../../../lib/server/firebaseAdmin';

function fmtMoney(n) {
  if (n == null || n === '') return '—';
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return '$' + num.toLocaleString();
}

function fmtDate(ts) {
  try {
    if (!ts) return '—';
    const d = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
    return d.toLocaleString();
  } catch {
    return '—';
  }
}

export default async function ClientSubmissionsAdmin() {
  // 1) Read cookie on the server
  const token = cookies().get('__session')?.value;
  if (!token) {
    redirect('/admin/login');
  }

  // 2) Verify token + role on the server
  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    redirect('/admin/login');
  }

  if (decoded?.role !== 'admin') {
    redirect('/admin/login');
  }

  // 3) Fetch Firestore server-side
  const snap = await adminDb
    .collection('clientSizingSubmissions')
    .orderBy('submittedAt', 'desc')
    .get();

  const submissions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // 4) Render HTML (no client hooks)
  return (
    <div className="min-h-screen bg-presence-dark text-presence-light px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-presence-accent">
          Client Submissions
        </h1>
        <div className="text-sm opacity-80">
          {decoded?.email ?? 'Admin'}
          <a
            href="/admin/logout"
            className="ml-3 inline-flex items-center px-3 py-1 rounded-md border border-presence-mid hover:bg-presence-mid/50"
          >
            Sign out
          </a>
        </div>
      </div>

      <div className="overflow-x-auto border border-presence-mid rounded-xl">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-presence-mid/30 text-presence-light uppercase text-xs">
            <tr>
              <th className="p-3 text-left">Business</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Revenue</th>
              <th className="p-3 text-left">Employees</th>
              <th className="p-3 text-left">Industry</th>
              <th className="p-3 text-left">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center opacity-60">
                  No submissions found.
                </td>
              </tr>
            ) : (
              submissions.map((s) => (
                <tr key={s.id} className="border-t border-presence-mid hover:bg-presence-mid/20">
                  <td className="p-3">{s.businessName || '—'}</td>
                  <td className="p-3 opacity-80">{s.email || '—'}</td>
                  <td className="p-3">{fmtMoney(s.monthlyRevenue)}</td>
                  <td className="p-3">{s.employees ?? '—'}</td>
                  <td className="p-3">{s.industry || '—'}</td>
                  <td className="p-3 opacity-70">{fmtDate(s.submittedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

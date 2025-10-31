// app/admin/client-submissions/page.js
"use client";

import { useEffect, useState } from "react";

export default function ClientSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const res = await fetch("/api/admin/client-submissions");
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch data");

        setSubmissions(data.submissions || []);
      } catch (err) {
        console.error("❌ Error fetching submissions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  }, []);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">
        Loading client submissions...
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center text-red-600">
        ❌ Error loading submissions: {error}
      </div>
    );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Client Submissions
      </h1>

      {submissions.length === 0 ? (
        <p className="text-gray-600">No submissions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left border-b">Business Name</th>
                <th className="p-3 text-left border-b">Email</th>
                <th className="p-3 text-left border-b">Industry</th>
                <th className="p-3 text-left border-b">Revenue</th>
                <th className="p-3 text-left border-b">Employees</th>
                <th className="p-3 text-left border-b">Challenge</th>
                <th className="p-3 text-left border-b">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{s.businessName}</td>
                  <td className="p-3">{s.email}</td>
                  <td className="p-3">{s.industry}</td>
                  <td className="p-3">{s.monthlyRevenue}</td>
                  <td className="p-3">{s.employees}</td>
                  <td className="p-3 max-w-xs truncate">{s.challenge}</td>
                  <td className="p-3 text-gray-500 text-xs">
                    {new Date(s.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

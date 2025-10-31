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

        if (!res.ok) throw new Error(data.error || "Failed to load submissions");

        setSubmissions(data.submissions || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h3>Loading submissions...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
        <h3>❌ Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
        Client Submissions
      </h1>

      {submissions.length === 0 ? (
        <p style={{ textAlign: "center" }}>No submissions found.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ccc",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Business</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Industry</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Revenue</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Employees</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Email</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.id}>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{s.businessName}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{s.industry}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{s.monthlyRevenue}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{s.employees}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{s.email}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>
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

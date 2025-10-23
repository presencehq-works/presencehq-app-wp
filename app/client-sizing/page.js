"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ClientSizingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ new loading gate
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    monthlyRevenue: "",
    industry: "",
    employees: "",
    challenge: "",
    includeAutomation: false,
    accountingTool: "",
    notes: "",
  });

  // ✅ Ensure user is logged in and check submission
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.replace("/login");
        return;
      }

      setUser(u);

      // Check if submission already exists
      const docRef = doc(db, "clientSizingSubmissions", u.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSubmitted(true);
      }

      setLoading(false); // ✅ only render UI after checks complete
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const safeEmail = user.email.replace(/[.#$[\]@]/g, "_");

      // Check if already submitted
      const existing = await getDoc(doc(db, "submissionEmails", safeEmail));
      if (existing.exists()) {
        setSubmitted(true);
        return;
      }

      // Save main submission
      await setDoc(doc(db, "clientSizingSubmissions", user.uid), {
        ...formData,
        email: user.email,
        timestamp: new Date().toISOString(),
      });

      // Create index record
      await setDoc(doc(db, "submissionEmails", safeEmail), {
        uid: user.uid,
        createdAt: new Date().toISOString(),
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  // ✅ Block render until loading is done
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-800">
        <p className="animate-pulse text-sm text-gray-500">
          Checking your session...
        </p>
      </div>
    );

  if (!user) return null;

  if (submitted)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-800">
        <p className="text-lg font-medium">
          ✅ Your submission has been received. Thank you!
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-6 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white border border-gray-200 rounded-lg shadow-lg p-10 space-y-8"
      >
        <h1 className="text-2xl text-red-600 font-semibold tracking-wide text-center mb-4">
          PresenceHQ Whiteout
        </h1>

        <input
          placeholder="Business Name"
          value={formData.businessName}
          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
          className="w-full border-b border-gray-300 focus:border-red-500 p-2 outline-none"
        />
        <input
          type="number"
          placeholder="Monthly Revenue"
          value={formData.monthlyRevenue}
          onChange={(e) => setFormData({ ...formData, monthlyRevenue: e.target.value })}
          className="w-full border-b border-gray-300 focus:border-red-500 p-2 outline-none"
        />
        <input
          type="number"
          placeholder="Employees"
          value={formData.employees}
          onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
          className="w-full border-b border-gray-300 focus:border-red-500 p-2 outline-none"
        />
        <select
          value={formData.industry}
          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
          className="w-full border-b border-gray-300 focus:border-red-500 p-2 outline-none appearance-none"
        >
          <option value="" disabled hidden>
            Industry
          </option>
          <option>Hospitality</option>
          <option>Retail</option>
          <option>Professional Services</option>
        </select>
        <textarea
          placeholder="Your biggest challenge..."
          rows="3"
          value={formData.challenge}
          onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
          className="w-full border-b border-gray-300 focus:border-red-500 p-2 outline-none resize-none"
        ></textarea>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.includeAutomation}
            onChange={(e) =>
              setFormData({ ...formData, includeAutomation: e.target.checked })
            }
            className="accent-red-600"
          />
          <span className="text-gray-700 text-sm">Include automation setup</span>
        </div>

        <div className="text-sm space-y-2 text-gray-600">
          <p className="uppercase text-[10px] text-red-600 tracking-wider">
            Accounting Tool
          </p>
          {["QuickBooks", "Xero", "Other"].map((opt) => (
            <label key={opt} className="flex items-center gap-2">
              <input
                type="radio"
                name="acct"
                checked={formData.accountingTool === opt}
                onChange={() => setFormData({ ...formData, accountingTool: opt })}
                className="accent-red-600"
              />
              {opt}
            </label>
          ))}
        </div>

        <textarea
          placeholder="Additional notes..."
          rows="2"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full border-b border-gray-300 focus:border-red-500 p-2 outline-none resize-none"
        ></textarea>

        <button className="block w-full mt-10 py-2 bg-red-600 text-white rounded-md tracking-widest text-sm hover:bg-red-700 transition">
          SUBMIT
        </button>
      </form>
    </div>
  );
}

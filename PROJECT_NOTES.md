# PresenceHQ Project Notes

---

## 🔹 Snapshot: Oct 23, 2025
- Repo successfully uploaded to GitHub  
- Magic Link login + Firestore submission lock verified  
- Collections: `clientSizingSubmissions`, `submissionEmails`
- Firebase Rules: strict, single-submission enforced  
- Environment: sandbox  
- Known issues: none currently  

---

## 🔹 Previous Setup Steps
(paste everything I gave you before here)# PresenceHQ Dev Log

## 🗓 Snapshot — 2025-10-23
**State:** ✅ Stable  
**Environment:** Local (localhost:3000)  
**Goal:** Working magic link login + client-sizing questionnaire with one-submission rule.

---

### 🔧 Core Components
**Firebase Config:**  
- Auth via magic link (Email Link Sign-In)  
- Firestore collections:
  - `clientSizingSubmissions`
  - `submissionEmails`
- Firestore Rules enforce:
  - One submission per user (`!exists()` logic)
  - Admin-only backend access
  - Public read for submissionEmails index

**Auth Behavior:**
- `/login`:
  - Sends magic link
  - Checks if email already submitted → blocks duplicate links
- `/client-sizing`:
  - Auth required (`onAuthStateChanged`)
  - Shows form once; subsequent logins show ✅ thank-you message
  - Protected with `loading` gate to prevent UI flash

---

### 📂 Current Working Files
- `app/login/page.js`
- `app/client-sizing/page.js`
- `firebaseConfig.js`
- `firebase.rules`
- `.env.local`

---

### ⚙️ Behavior Summary
| Action | Expected Result |
|--------|------------------|
| User enters email → click link | Magic link arrives; redirects to /client-sizing |
| User fills form + submits | Creates 2 docs: `clientSizingSubmissions/{uid}`, `submissionEmails/{email}` |
| User tries again | Immediately sees “✅ Your submission has been received” (no duplicate allowed) |
| User opens /client-sizing directly | Sees “Checking your session…” then either thank-you or login redirect |
| Unauthorized access | Blocked by rules unless admin |

---

### 🪣 Firestore Rules Snapshot
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ✅ Client submissions (one per user)
    match /clientSizingSubmissions/{userId} {
      // Admins can do everything
      allow read, write: if request.auth.token.role == "admin";

      // Regular users — can only create/read their own doc once
      allow create: if request.auth != null
                    && request.auth.uid == userId
                    && !exists(/databases/$(database)/documents/clientSizingSubmissions/$(userId));
      allow read: if request.auth != null && request.auth.uid == userId;
    }

    // ✅ Email index (used for login checks)
    match /submissionEmails/{emailId} {
      // Public read — needed for login form to verify existing emails
      allow read: if true;
      // Only admins (or backend) can write
      allow write: if request.auth.token.role == "admin";
    }

    // ✅ Global fallback — block everything else for non-admins
    match /{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.token.role == "admin";
    }
  }
}
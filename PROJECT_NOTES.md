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


# PresenceHQ Project Notes

---

## 🧾 Snapshot — Oct 30, 2025
**Environment:** `presencehq-sandbox`  
**State:** ✅ Verified  
**Goal:** Full Intuit OAuth → Firebase Cloud Function → Token exchange flow successful.  
**Next Step:** Mirror this setup into production (`presencehq-prod`).

---

## 🔹 Firebase Environment
- Auth: Magic link (Email Link Sign-In)
- Collections:
  - `clientSizingSubmissions`
  - `submissionEmails`
- Firestore Rules:
  - One submission per user
  - Admin-only backend write access
- Hosting: Vercel + Firebase backend
- Firestore location: `us-east4`

---

## 🔹 QuickBooks OAuth Integration

### ✅ Cloud Function Deployment
| Field | Value |
|-------|--------|
| **Project ID** | `presencehq-sandbox` |
| **Function Name** | `qboAuthCallback` |
| **Region** | `us-central1` |
| **Runtime** | `nodejs22` |
| **Entry Point** | `qboAuthCallback` |
| **Ingress** | `ALLOW_ALL` |
| **IAM Binding** | `roles/cloudfunctions.invoker` → `allUsers` |
| **Status** | ✅ Working (Token successfully received) |

---

### ⚙️ Environment Variables (stored in Cloud Function)
| Variable | Example Value / Note |
|-----------|----------------------|
| `QBO_CLIENT_ID` | `{{INTUIT_SANDBOX_CLIENT_ID}}` |
| `QBO_CLIENT_SECRET` | `{{INTUIT_SANDBOX_CLIENT_SECRET}}` |
| `QBO_REDIRECT_URI` | `https://qboauthcallback-ymjifxoyva-uc.a.run.app` |
| `LOG_EXECUTION_ID` | `true` |

> 🔒 *Actual credentials are stored securely in GCP Function settings — not committed to source.*

---

### 🌐 OAuth URLs
| Type | URL |
|------|-----|
| **OAuth Authorization** | `https://appcenter.intuit.com/connect/oauth2` |
| **Token Endpoint (Sandbox + Prod)** | `https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer` |
| **Redirect URI (registered)** | `https://qboauthcallback-ymjifxoyva-uc.a.run.app` |
| **API Base (Sandbox)** | `https://sandbox-quickbooks.api.intuit.com/v3/company/` |
| **API Base (Production)** | `https://quickbooks.api.intuit.com/v3/company/` |

---

### 🔐 IAM & Organization Policy
| Item | Status / Note |
|------|----------------|
| **Tag Key** | `public-ingress` |
| **Tag Value** | `allow` |
| **Tag Path** | `444148389269/public-ingress/allow` |
| **Binding Command** | `gcloud resource-manager tags bindings create --tag-value=... --parent=projects/presencehq-sandbox` |
| **Policy** | Reverted to secure default ✅ |
| **Effect** | Cloud Function remains public & accessible |

---

### 🧩 Function Code Summary
**File:** `functions/index.js`

```js
const functions = require("firebase-functions");
const axios = require("axios");

exports.qboAuthCallback = functions.https.onRequest(async (req, res) => {
  try {
    console.log("🔥 Incoming request query:", req.query);
    const { code, realmId } = req.query;
    if (!code || !realmId) return res.status(400).send("Missing authorization code or realmId");

    const clientId = process.env.QBO_CLIENT_ID;
    const clientSecret = process.env.QBO_CLIENT_SECRET;
    const redirectUri = process.env.QBO_REDIRECT_URI;
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const tokenUrl = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.info("✅ Tokens received for realmId:", realmId);
    res.status(200).send("✅ QBO Authorization successful. Tokens received.");
  } catch (error) {
    console.error("❌ QBO OAuth Error:", error.response?.data || error.message);
    res.status(500).send("OAuth Error");
  }
});
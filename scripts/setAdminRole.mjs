// scripts/setAdminRole.mjs
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'presencehq-sandbox';

initializeApp({
  credential: applicationDefault(),
  projectId,
});

async function main() {
  const email = process.argv[2];
  const role = process.argv[3] || 'admin';

  if (!email) {
    console.error('Usage: node scripts/setAdminRole.mjs <email> [role]');
    process.exit(1);
  }

  try {
    const user = await getAuth().getUserByEmail(email);
    const current = user.customClaims || {};
    const updated = { ...current, role };
    await getAuth().setCustomUserClaims(user.uid, updated);
    console.log(`✅ Set custom claim for ${email}:`, updated);
    console.log('Note: The user must sign out/in (or refresh ID token) to see the new role in the app.');
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
}

main();

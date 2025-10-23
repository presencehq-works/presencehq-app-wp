import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

initializeApp({
  credential: applicationDefault(),
});

const email = process.argv[2];

if (!email) {
  console.error("Usage: node scripts/checkUserClaims.mjs <email>");
  process.exit(1);
}

const auth = getAuth();

const main = async () => {
  const user = await auth.getUserByEmail(email);
  console.log(`Claims for ${email}:`, user.customClaims || {});
};

main();

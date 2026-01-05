import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

// 🔴 PUT YOUR EMAIL HERE
const email = "rizulgupta2811@gmail.com";

const auth = getAuth();
const user = await auth.getUserByEmail(email);

await auth.setCustomUserClaims(user.uid, { admin: true });

console.log(`✅ Admin claim set for ${email}`);

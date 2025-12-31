// import admin from "firebase-admin";

// if (!admin.apps.length) {
//   const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

//   if (!serviceAccountBase64) {
//     throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_BASE64");
//   }

//   const serviceAccount = JSON.parse(
//     Buffer.from(serviceAccountBase64, "base64").toString("utf-8")
//   );

//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }

// export const adminDb = admin.firestore();
import admin from "firebase-admin";

if (!admin.apps.length) {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!base64) {
    throw new Error("❌ FIREBASE_SERVICE_ACCOUNT_BASE64 is missing");
  }

  const json = Buffer.from(base64, "base64").toString("utf8");

  console.log("🔥 RAW JSON STRING:", json.slice(0, 200));

  const serviceAccount = JSON.parse(json);

  console.log("🔥 SERVICE ACCOUNT KEYS:", Object.keys(serviceAccount));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminDb = admin.firestore();

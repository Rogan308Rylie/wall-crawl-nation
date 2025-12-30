import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!serviceAccountBase64) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_BASE64");
  }

  const serviceAccount = JSON.parse(
    Buffer.from(serviceAccountBase64, "base64").toString("utf-8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminDb = admin.firestore();

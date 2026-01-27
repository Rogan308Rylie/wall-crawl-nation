// lib/firebaseAdmin.ts
import admin from "firebase-admin";

export function getAdminApp() {
  if (!admin.apps.length) {
    const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!base64) {
      throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_BASE64");
    }

    const serviceAccount = JSON.parse(
      Buffer.from(base64, "base64").toString("utf8")
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  return admin.app();
}

export function getAdminDb() {
  return getAdminApp().firestore();
}

export function getAdminAuth() {
  return getAdminApp().auth();
}

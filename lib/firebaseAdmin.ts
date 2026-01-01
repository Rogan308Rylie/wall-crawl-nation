// lib/firebaseAdmin.ts
import admin from "firebase-admin";

let app: admin.app.App | null = null;

export function getAdminApp() {
  if (!app) {
    const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!base64) {
      throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_BASE64");
    }

    const serviceAccount = JSON.parse(
      Buffer.from(base64, "base64").toString("utf8")
    );

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  return app;
}

export function getAdminDb() {
  return getAdminApp().firestore();
}

export function getAdminAuth() {
  return getAdminApp().auth();
}

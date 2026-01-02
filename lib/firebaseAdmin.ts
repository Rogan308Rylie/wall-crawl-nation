import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
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

// Firestore instance
export const adminDb: Firestore = getFirestore();

// Admin DB accessor (for consistency with getAdminAuth)
export function getAdminDb() {
  return adminDb;
}

// Admin Auth accessor
export function getAdminAuth() {
  return getAuth();
}
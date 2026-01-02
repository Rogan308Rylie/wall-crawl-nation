import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let adminDbInstance: Firestore | null = null;
let adminAuthInstance: ReturnType<typeof getAuth> | null = null;

function initializeAdminApp() {
  if (getApps().length > 0) {
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin: Missing required environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)"
    );
  }

  try {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    throw error;
  }
}

// Lazy getters to ensure initialization only when needed (not during build)
function getAdminDbInstance(): Firestore {
  if (!adminDbInstance) {
    initializeAdminApp();
    adminDbInstance = getFirestore();
  }
  return adminDbInstance;
}

function getAdminAuthInstance() {
  if (!adminAuthInstance) {
    initializeAdminApp();
    adminAuthInstance = getAuth();
  }
  return adminAuthInstance;
}

// Export functions instead of direct instances to avoid build-time initialization
export function getAdminDb(): Firestore {
  return getAdminDbInstance();
}

export function getAdminAuth() {
  return getAdminAuthInstance();
}
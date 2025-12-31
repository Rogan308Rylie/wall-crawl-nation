import { adminAuth, adminDb } from "./firebaseAdmin";

export async function isAdmin(req: Request): Promise<boolean> {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return false;

    const token = authHeader.split("Bearer ")[1];

    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const userSnap = await adminDb.collection("users").doc(uid).get();

    return userSnap.exists && userSnap.data()?.role === "admin";
  } catch (err) {
    console.error("isAdmin check failed:", err);
    return false;
  }
}

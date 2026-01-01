// lib/isAdmin.ts
import { getAdminAuth, getAdminDb } from "./firebaseAdmin";

export async function isAdminFromRequest(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;

  const token = authHeader.split("Bearer ")[1];

  const decoded = await getAdminAuth().verifyIdToken(token);
  const uid = decoded.uid;

  const snap = await getAdminDb().collection("users").doc(uid).get();
  return snap.exists && snap.data()?.role === "admin";
}

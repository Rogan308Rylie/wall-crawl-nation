import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ── Server-side admin guard ──────────────────────────────────
  // 1. Check session cookie exists
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) {
    redirect("/");
  }

  // 2. Verify session cookie is valid + check admin role in Firestore
  try {
    const decoded = await getAdminAuth().verifySessionCookie(session!, true);
    const snap = await getAdminDb().collection("users").doc(decoded.uid).get();

    if (!snap.exists || snap.data()?.role !== "admin") {
      redirect("/");
    }
  } catch {
    // Invalid or expired session
    redirect("/");
  }
  // ─────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: "240px",
          padding: "1.5rem",
          borderRight: "1px solid #333",
        }}
      >
        <h2>Admin</h2>
        <nav style={{ marginTop: "1rem" }}>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li>
              <Link href="/admin">Dashboard</Link>
            </li>
            <li>
              <Link href="/admin/orders">Orders</Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: "2rem" }}>{children}</main>
    </div>
  );
}

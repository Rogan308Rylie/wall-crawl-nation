import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1️⃣ Read session cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) {
    redirect("/login");
  }

const decoded = await getAdminAuth().verifySessionCookie(
  sessionCookie,
  true
);

console.log("🔐 decoded.uid:", decoded.uid);

const userSnap = await getAdminDb()
  .collection("users")
  .doc(decoded.uid)
  .get();

console.log("📄 userSnap.exists:", userSnap.exists);
console.log("📄 userSnap.data():", userSnap.data());

if (!userSnap.exists || userSnap.data()?.role !== "admin") {
  redirect("/");
}


  // ✅ ONLY ADMINS REACH HERE
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

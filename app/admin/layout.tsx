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
    <div className="flex min-h-screen bg-gradient-to-br from-black via-[#0d0d0d] to-black">
      {/* Animated background layer */}
      <div className="fixed inset-0 -z-20 opacity-30 animate-bgshift" />

      {/* Sidebar */}
      <aside className="
        w-64
        flex-shrink-0
        border-r
        border-white/10
        bg-black/40
        backdrop-blur-sm
        p-6
        sticky
        top-0
        h-screen
        overflow-y-auto
      ">
        <div className="mb-8">
          <h2 className="text-lg font-semibold tracking-wide">
            WCN
          </h2>
          <p className="text-l text-white/40 mt-1">Admin Dashboard</p>
        </div>

        <nav className="space-y-1">
          <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4 font-semibold">
            Navigation
          </h3>

          <Link
            href="/admin"
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition"
          >
            Dashboard
          </Link>

          <Link
            href="/admin/orders"
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition"
          >
            Orders
          </Link>

          <Link
            href="/admin/posters"
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition"
          >
            Posters
          </Link>

          <Link
            href="/admin/collections"
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition"
          >
            Collections
          </Link>

          <Link
            href="/admin/tags"
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition"
          >
            Tags
          </Link>
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 mt-8 pt-6">
          <Link
            href="/"
            className="text-xs text-white/50 hover:text-white/80 transition"
          >
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="
          mx-auto
          max-w-6xl
          rounded-2xl
          bg-[#111]
          p-8
          ring-1
          ring-white/10
          shadow-[0_20px_40px_rgba(0,0,0,0.4)]
        ">
          {children}
        </div>
      </main>
    </div>
  );
}

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
    redirect("/login?redirect=/admin");
  }

  let decoded;
  try {
    decoded = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true
    );
  } catch {
    redirect("/login?expired=true&redirect=/admin");
  }

  const userSnap = await getAdminDb()
    .collection("users")
    .doc(decoded.uid)
    .get();

  if (!userSnap.exists || userSnap.data()?.role !== "admin") {
    redirect("/");
  }

  // ✅ ONLY ADMINS REACH HERE
  return (
    <div className="flex min-h-screen bg-[#f0f0f0] text-black">
      {/* Sidebar */}
      <aside className="
        w-64
        flex-shrink-0
        border-r-8
        border-black
        bg-white
        p-8
        sticky
        top-0
        h-screen
        overflow-y-auto
        z-10
      ">
        <div className="mb-10 border-b-4 border-black pb-4">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-black">
            WCN
          </h2>
          <p className="text-sm font-bold text-black uppercase mt-2 bg-[#A3FF12] inline-block px-2 py-1 border-2 border-black shadow-[2px_2px_0_0_#000]">Admin</p>
        </div>

        <nav className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-black/50 mb-6">
            Navigation
          </h3>

          <Link
            href="/admin"
            className="block px-4 py-3 border-4 border-transparent hover:border-black font-black uppercase text-black hover:bg-[#A3FF12] transition-colors"
          >
            Dashboard
          </Link>

          <Link
            href="/admin/orders"
            className="block px-4 py-3 border-4 border-transparent hover:border-black font-black uppercase text-black hover:bg-[#A3FF12] transition-colors"
          >
            Orders
          </Link>

          <Link
            href="/admin/posters"
            className="block px-4 py-3 border-4 border-transparent hover:border-black font-black uppercase text-black hover:bg-[#A3FF12] transition-colors"
          >
            Posters
          </Link>

          <Link
            href="/admin/collections"
            className="block px-4 py-3 border-4 border-transparent hover:border-black font-black uppercase text-black hover:bg-[#A3FF12] transition-colors"
          >
            Collections
          </Link>

          <Link
            href="/admin/tags"
            className="block px-4 py-3 border-4 border-transparent hover:border-black font-black uppercase text-black hover:bg-[#A3FF12] transition-colors"
          >
            Tags
          </Link>

          <Link
            href="/admin/coupons"
            className="block px-4 py-3 border-4 border-transparent hover:border-black font-black uppercase text-black hover:bg-[#A3FF12] transition-colors"
          >
            Coupons
          </Link>
        </nav>

        {/* Footer */}
        <div className="border-t-4 border-black mt-10 pt-6">
          <Link
            href="/"
            className="text-sm font-black uppercase text-black hover:text-[#A3FF12] hover:bg-black px-3 py-2 border-2 border-transparent hover:border-black transition-all inline-block"
          >
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto bg-[#f0f0f0]">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}

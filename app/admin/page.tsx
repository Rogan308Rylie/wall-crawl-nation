import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/isAdmin";

export default async function AdminPage() {
  const cookieStore = await cookies(); // 👈 THIS IS THE FIX
  const token = cookieStore.get("__session")?.value;

  // Not logged in
  if (!token) {
    redirect("/login");
  }

  // Fake request object for isAdmin()
  const req = new Request("http://internal", {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  const allowed = await isAdmin(req);

  // Logged in but not admin
  if (!allowed) {
    redirect("/");
  }

  // Admin OK
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin panel.</p>
    </main>
  );
}
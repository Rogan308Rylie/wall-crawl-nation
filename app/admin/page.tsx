"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <div>
      <h1>Admin Panel</h1>
      <Link href="/admin/orders">View Orders</Link>
    </div>
  );
}

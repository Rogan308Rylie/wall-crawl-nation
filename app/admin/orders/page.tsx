// app/admin/orders/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type Order = {
  orderId: string;
  totalAmount: number;
  status: string;
};

export default async function AdminOrdersPage() {
  const headersList = headers();
  const host = (await headersList).get("host");

  if (!host) redirect("/");

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/admin/orders`, {
    cache: "no-store",
  });

  if (!res.ok) redirect("/");

  const orders: Order[] = await res.json();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Admin Orders</h1>

      {orders.length === 0 && <p>No orders found.</p>}

      <ul>
        {orders.map((order) => (
          <li key={order.orderId} style={{ marginBottom: "1rem" }}>
            <strong>Order ID:</strong> {order.orderId} <br />
            <strong>Amount:</strong> ₹{order.totalAmount} <br />
            <strong>Status:</strong> {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

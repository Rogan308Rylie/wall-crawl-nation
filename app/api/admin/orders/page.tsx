import { cookies } from "next/headers";

type Order = {
  orderId: string;
  userId: string;
  totalAmount: number;
  status: string;
  paidAt?: string;
};

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("__session")?.value;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/orders`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }

  const orders: Order[] = await res.json();

  return (
    <>
      <h1>Orders</h1>

      <table border={1} cellPadding={10} style={{ marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Paid At</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.orderId}>
              <td>{o.orderId}</td>
              <td>{o.userId}</td>
              <td>₹{o.totalAmount}</td>
              <td>{o.status}</td>
              <td>{o.paidAt ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

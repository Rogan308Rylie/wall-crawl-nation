"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  orderId: string;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  items: {
    title: string;
    quantity: number;
    price: number;
  }[];
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const res = await fetch("/api/admin/orders", {
        cache: "no-store",
      });

      const data = await res.json();

      // ✅ YOUR API RETURNS AN ARRAY DIRECTLY
      setOrders(data);
      setLoading(false);
    }

    loadOrders();
  }, []);

  if (loading) return <p>Loading orders…</p>;

  return (
    <div>
      <h1>Orders</h1>

      {orders.length === 0 && <p>No orders found.</p>}

      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            border: "1px solid #444",
            padding: "12px",
            marginBottom: "12px",
          }}
        >
          <p><strong>Order ID:</strong> {order.orderId}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Payment:</strong> {order.paymentStatus}</p>
          <p><strong>Total:</strong> ₹{order.totalAmount}</p>

          <ul>
            {order.items.map((item, i) => (
              <li key={i}>
                {item.title} × {item.quantity} (₹{item.price})
              </li>
            ))}
          </ul>

          <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
  {order.status === "confirmed" && (
    <button
      onClick={() => console.log("PACK", order.id)}
      style={{
        padding: "6px 10px",
        background: "#111",
        color: "#fff",
        border: "1px solid #444",
        cursor: "pointer",
      }}
    >
      Mark as Packed
    </button>
  )}

  {order.status === "packed" && (
    <button
      onClick={() => console.log("SHIP", order.id)}
      style={{
        padding: "6px 10px",
        background: "#111",
        color: "#fff",
        border: "1px solid #444",
        cursor: "pointer",
      }}
    >
      Mark as Shipped
    </button>
  )}

  {order.status === "shipped" && (
    <button
      onClick={() => console.log("DELIVER", order.id)}
      style={{
        padding: "6px 10px",
        background: "#111",
        color: "#fff",
        border: "1px solid #444",
        cursor: "pointer",
      }}
    >
      Mark as Delivered
    </button>
  )}
</div>

        </div>
      ))}
    </div>
  );
}

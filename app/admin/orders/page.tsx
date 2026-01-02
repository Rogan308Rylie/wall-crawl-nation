"use client";

import { useEffect, useState } from "react";
import { Order } from "@/types/order";

type AdminOrder = Order & {
  id: string; // Document ID from Firestore
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const res = await fetch("/api/admin/orders", {
        cache: "no-store",
      });

      const data = await res.json();

      // ✅ API RETURNS { orders: [...] }
      setOrders(data.orders || []);
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
          <p><strong>Total:</strong> ₹{order.totalAmount}</p>

          <ul>
            {order.items.map((item, i) => (
              <li key={i}>
                {item.title} × {item.quantity} (₹{item.price})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

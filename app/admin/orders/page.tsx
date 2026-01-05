"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import  firebaseApp  from "@/lib/firebase"; // client firebase init

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

  async function updateOrderStatus(orderId: string, status: string) {
    try {
      const auth = getAuth(firebaseApp);
      const user = auth.currentUser;

      if (!user) {
        alert("Not authenticated");
        return;
      }

      const token = await user.getIdToken();

      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔑 correct auth
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update order");
        return;
      }

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  }

  useEffect(() => {
    async function loadOrders() {
      const res = await fetch("/api/admin/orders", {
        cache: "no-store",
      });

      const data = await res.json();
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
              <button onClick={() => updateOrderStatus(order.id, "packed")}>
                Mark as Packed
              </button>
            )}

            {order.status === "packed" && (
              <button onClick={() => updateOrderStatus(order.id, "shipped")}>
                Mark as Shipped
              </button>
            )}

            {order.status === "shipped" && (
              <button onClick={() => updateOrderStatus(order.id, "delivered")}>
                Mark as Delivered
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

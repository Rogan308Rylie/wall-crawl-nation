"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import firebaseApp from "@/lib/firebase";

type OrderItem = {
  title: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  orderId: string;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  items: OrderItem[];
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
  deliveryAddress?: {
    fullName?: string;
    email?: string;
    phone?: string;
    block?: string;
    hostelNumber?: string;
    roomNumber?: string;
    additionalNotes?: string;
  };
};

const statusBadgeStyle = (status: string) => {
  switch (status) {
    case "confirmed":
      return { background: "#444", color: "#fff" };
    case "packed":
      return { background: "#b58900", color: "#000" };
    case "shipped":
      return { background: "#268bd2", color: "#fff" };
    case "delivered":
      return { background: "#2aa198", color: "#000" };
    default:
      return { background: "#333", color: "#fff" };
  }
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
          Authorization: `Bearer ${token}`,
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
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = await res.json();

      data.sort((a: Order, b: Order) => {
        const aTime = a.createdAt?.seconds ?? 0;
        const bTime = b.createdAt?.seconds ?? 0;
        return aTime - bTime; // oldest first
      });

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
            padding: "14px",
            marginBottom: "16px",
          }}
        >
          <p><strong>Order ID:</strong> {order.orderId}</p>

          <p>
            <strong>Status:</strong>{" "}
            <span
              style={{
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "0.85rem",
                marginLeft: "6px",
                ...statusBadgeStyle(order.status),
              }}
            >
              {order.status.toUpperCase()}
            </span>
          </p>

          <p><strong>Payment:</strong> {order.paymentStatus}</p>
          <p><strong>Total:</strong> ₹{order.totalAmount}</p>

          <p>
  <strong>Ordered at:</strong>{" "}
  {order.createdAt
    ? (() => {
        // Firestore Timestamp can arrive in different shapes
        const ts: any = order.createdAt;

        if (typeof ts === "string" || typeof ts === "number") {
          return new Date(ts).toLocaleString();
        }

        if (ts.seconds) {
          return new Date(ts.seconds * 1000).toLocaleString();
        }

        if (ts._seconds) {
          return new Date(ts._seconds * 1000).toLocaleString();
        }

        return "—";
      })()
    : "—"}
</p>


          <ul>
            {order.items.map((item, i) => (
              <li key={i}>
                {item.title} × {item.quantity} (₹{item.price})
              </li>
            ))}
          </ul>

          <hr style={{ margin: "12px 0", borderColor: "#333" }} />

          <div style={{ fontSize: "0.95rem" }}>
            <p><strong>Customer Details</strong></p>
            <p>Name: {order.deliveryAddress?.fullName || "—"}</p>
            <p>Email: {order.deliveryAddress?.email || "—"}</p>
            <p>Phone: {order.deliveryAddress?.phone || "—"}</p>
          </div>

          <div style={{ marginTop: "8px", fontSize: "0.95rem" }}>
            <p><strong>Delivery Address</strong></p>
            <p>
              Block {order.deliveryAddress?.block || "—"}, Hostel{" "}
              {order.deliveryAddress?.hostelNumber || "—"}, Room{" "}
              {order.deliveryAddress?.roomNumber || "—"}
            </p>
            {order.deliveryAddress?.additionalNotes && (
              <p>Notes: {order.deliveryAddress.additionalNotes}</p>
            )}
          </div>

          <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
            {order.status === "confirmed" && (
              <button
                onClick={() => updateOrderStatus(order.id, "packed")}
                style={buttonStyle}
              >
                📦 Mark as Packed
              </button>
            )}

            {order.status === "packed" && (
              <button
                onClick={() => updateOrderStatus(order.id, "shipped")}
                style={buttonStyle}
              >
                🚚 Mark as Shipped
              </button>
            )}

            {order.status === "shipped" && (
              <button
                onClick={() => updateOrderStatus(order.id, "delivered")}
                style={buttonStyle}
              >
                ✅ Mark as Delivered
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const buttonStyle = {
  padding: "8px 14px",
  border: "1px solid #888",
  background: "transparent",
  color: "#fff",
  borderRadius: "4px",
  cursor: "pointer",
};

"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import firebaseApp from "@/lib/firebase";
import { buttons } from "@/lib/ui/buttons";

type OrderItem = {
  type?: "poster" | "collection";
  title: string;
  quantity: number;
  price: number;
  posterIds?: string[];
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
      return "bg-[#A3FF12] text-black border-2 border-black drop-shadow-[2px_2px_0_#000]";
    case "packed":
      return "bg-black text-[#A3FF12] border-2 border-transparent";
    case "shipped":
      return "bg-blue-600 text-white border-2 border-black drop-shadow-[2px_2px_0_#000]";
    case "delivered":
      return "bg-green-600 text-white border-2 border-black drop-shadow-[2px_2px_0_#000]";
    default:
      return "bg-white text-black border-2 border-black drop-shadow-[2px_2px_0_#000]";
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

  if (loading) return <p className="text-2xl font-black uppercase text-black">Loading orders…</p>;

  return (
    <div>
      <h1 className="text-5xl font-black uppercase tracking-tighter text-black mb-8 border-b-8 border-black inline-block pr-8 pb-2">Orders</h1>

      {orders.length === 0 && <p className="text-2xl font-black uppercase">No orders found.</p>}

      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white border-4 border-black p-8 mb-10 shadow-[12px_12px_0_0_#A3FF12]"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b-4 border-black pb-4">
            <p className="text-xl font-bold uppercase text-black"><strong>Order ID:</strong> {order.orderId}</p>

            <div className="flex items-center gap-4">
              <span className="text-xl font-bold uppercase text-black">Status:</span>
              <span
                className={`px-3 py-1 text-sm font-black uppercase tracking-widest ${statusBadgeStyle(order.status)}`}
              >
                {order.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <p className="text-lg text-black font-bold uppercase"><strong>Payment:</strong> <span className="underline decoration-[#A3FF12] decoration-4">{order.paymentStatus}</span></p>
            <p className="text-lg text-black font-bold uppercase"><strong>Total:</strong> <span className="bg-[#A3FF12] border-2 border-black shadow-[2px_2px_0_0_#000] px-2">₹{order.totalAmount}</span></p>
            
            <p className="text-lg text-black font-bold uppercase flex items-center gap-2">
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
          </div>

          <ul className="mb-6 space-y-3">
            {order.items.map((item, i) => (
              <li key={i} className="flex flex-wrap items-center gap-3">
                <span className="text-xl font-black uppercase text-black">
                  {item.title} × {item.quantity} (₹{item.price})
                </span>
                {item.type === "collection" && (
                  <span
                    className="inline-block bg-black text-[#A3FF12] border-2 border-black px-3 py-1 text-sm font-black tracking-widest uppercase shadow-[2px_2px_0_0_#A3FF12]"
                  >
                    BUNDLE ({item.posterIds?.length || 0} posters)
                  </span>
                )}
                {item.type === "poster" && (
                  <span
                    className="inline-block bg-black text-white border-2 border-black px-3 py-1 text-sm font-black tracking-widest uppercase shadow-[2px_2px_0_0_#A3FF12]"
                  >
                    POSTER
                  </span>
                )}
              </li>
            ))}
          </ul>

          <hr className="my-6 border-b-4 border-black" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-black font-bold text-lg uppercase space-y-2 border-l-4 border-black pl-4">
              <p className="font-black text-xl mb-3">Customer Details</p>
              <p>Name: {order.deliveryAddress?.fullName || "—"}</p>
              <p>Email: {order.deliveryAddress?.email || "—"}</p>
              <p>Phone: {order.deliveryAddress?.phone || "—"}</p>
            </div>

            <div className="text-black font-bold text-lg uppercase space-y-2 border-l-4 border-black pl-4">
              <p className="font-black text-xl mb-3">Delivery Address</p>
              <p>
                Block {order.deliveryAddress?.block || "—"}, Hostel{" "}
                {order.deliveryAddress?.hostelNumber || "—"}, Room{" "}
                {order.deliveryAddress?.roomNumber || "—"}
              </p>
              {order.deliveryAddress?.additionalNotes && (
                <p>Notes: {order.deliveryAddress.additionalNotes}</p>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t-4 border-black">
            {order.status === "confirmed" && (
              <button
                onClick={() => updateOrderStatus(order.id, "packed")}
                className={buttons.primary}
              >
                📦 Mark as Packed
              </button>
            )}

            {order.status === "packed" && (
              <button
                onClick={() => updateOrderStatus(order.id, "shipped")}
                className={buttons.primary}
              >
                🚚 Mark as Shipped
              </button>
            )}

            {order.status === "shipped" && (
              <button
                onClick={() => updateOrderStatus(order.id, "delivered")}
                className={buttons.primary}
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

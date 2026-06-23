"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import firebaseApp from "@/lib/firebase";
import { buttons } from "@/lib/ui/buttons";
import { useToast } from "@/context/ToastContext";

type OrderItem = {
  type?: "poster" | "collection" | "custom";
  title: string;
  quantity: number;
  price: number;
  posterIds?: string[];
  images?: string[];
  notes?: string;
};

type Order = {
  id: string;
  orderId: string;
  totalAmount: number;
  cartTotal?: number;
  deliveryFee?: number;
  paymentStatus: string;
  status: string;
  items: OrderItem[];
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
  deliveryAddress?: {
    isNitkkr?: boolean;
    fullName?: string;
    email?: string;
    phone?: string;
    block?: string;
    hostelNumber?: string;
    roomNumber?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    pincode?: string;
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
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();

  async function updateOrderStatus(orderId: string, status: string) {
    try {
      const auth = getAuth(firebaseApp);
      const user = auth.currentUser;

      if (!user) {
        showToast("Not authenticated", "error");
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
        showToast(data.error || "Failed to update order", "error");
        return;
      }

      window.location.reload();
    } catch (err) {
      console.error(err);
      showToast("Something went wrong", "error");
    }
  }

  useEffect(() => {
    async function loadOrders() {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = await res.json();

      data.sort((a: Order, b: Order) => {
        const aTime = a.createdAt?.seconds ?? 0;
        const bTime = b.createdAt?.seconds ?? 0;
        return bTime - aTime; // newest first
      });

      setOrders(data);
      setLoading(false);
    }

    loadOrders();
  }, []);

  if (loading) return <p className="text-2xl font-black uppercase text-black">Loading orders…</p>;

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    return (
      order.orderId.toLowerCase().includes(q) ||
      order.deliveryAddress?.fullName?.toLowerCase().includes(q) ||
      order.deliveryAddress?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b-8 border-black pb-4">
        <h1 className="text-5xl font-black uppercase tracking-tighter text-black">Orders</h1>
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search Order ID, Name, Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-black font-black uppercase border-4 border-black px-4 py-3 shadow-[6px_6px_0_0_#A3FF12] focus:outline-none focus:translate-y-[2px] focus:shadow-[4px_4px_0_0_#A3FF12] transition-all"
          />
        </div>
      </div>

      {filteredOrders.length === 0 && <p className="text-2xl font-black uppercase">No orders found.</p>}

      {filteredOrders.map((order) => (
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
            <p className="text-lg text-black font-bold uppercase">
              <strong>Total:</strong>{" "}
              <span className="bg-[#A3FF12] border-2 border-black shadow-[2px_2px_0_0_#000] px-2 mr-2">
                ₹{order.totalAmount}
              </span>
              {typeof order.deliveryFee === "number" && (
                <span className="text-xs text-black/60 font-bold lowercase">
                  (₹{order.cartTotal ?? (order.totalAmount - order.deliveryFee)} + ₹{order.deliveryFee} delivery)
                </span>
              )}
            </p>

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

                  return "-";
                })()
                : "-"}
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
                {item.type === "custom" && (
                  <div className="w-full flex flex-col items-start gap-3 mt-2">
                    <span
                      className="inline-block bg-[#A3FF12] text-black border-2 border-black px-3 py-1 text-sm font-black tracking-widest uppercase shadow-[2px_2px_0_0_#000]"
                    >
                      CUSTOM POSTERS
                    </span>
                    {item.images && item.images.length > 0 && (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 w-full max-w-2xl">
                        {item.images.map((img, idx) => (
                          <img key={idx} src={img} alt={`Custom image ${idx + 1}`} className="w-full h-auto aspect-[1/1.4] object-cover border-2 border-black" />
                        ))}
                      </div>
                    )}
                    {item.notes && (
                      <div className="mt-2 p-3 bg-yellow-100 border-2 border-black text-black font-bold text-sm w-full max-w-2xl">
                        <span className="uppercase font-black text-xs block mb-1">Customer Notes:</span>
                        {item.notes}
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>

          <hr className="my-6 border-b-4 border-black" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-black font-bold text-lg uppercase space-y-2 border-l-4 border-black pl-4">
              <p className="font-black text-xl mb-3">Customer Details</p>
              <p>Name: {order.deliveryAddress?.fullName || "-"}</p>
              <p>Email: {order.deliveryAddress?.email || "-"}</p>
              <p>Phone: {order.deliveryAddress?.phone || "-"}</p>
            </div>

            <div className="text-black font-bold text-lg uppercase space-y-2 border-l-4 border-black pl-4">
              <p className="font-black text-xl mb-3">Delivery Address</p>
              {order.deliveryAddress?.isNitkkr !== false ? (
                <p>
                  Block {order.deliveryAddress?.block || "-"}, Hostel{" "}
                  {order.deliveryAddress?.hostelNumber || "-"}, Room{" "}
                  {order.deliveryAddress?.roomNumber || "-"}
                </p>
              ) : (
                <p>
                  {order.deliveryAddress?.addressLine || "-"}<br />
                  {order.deliveryAddress?.city || "-"}, {order.deliveryAddress?.state || "-"} - {order.deliveryAddress?.pincode || "-"}
                </p>
              )}
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

            {order.items.some((i) => i.type === "custom") && (
              <a
                href={`/api/admin/download-zip?orderId=${order.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttons.secondary}
              >
                📥 Download Images ZIP
              </a>
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

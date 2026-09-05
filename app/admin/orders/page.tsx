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
    case "completed":
      return "bg-green-600 text-white border-2 border-black drop-shadow-[2px_2px_0_#000]";
    case "cancelled":
      return "bg-gray-300 text-black line-through border-2 border-black drop-shadow-[2px_2px_0_#000]";
    default:
      return "bg-white text-black border-2 border-black drop-shadow-[2px_2px_0_#000]";
  }
};

function sortOrders(list: Order[]): Order[] {
  return [...list].sort((a: Order, b: Order) => {
    const isAClosed =
      a.status === "delivered" ||
      a.status === "completed" ||
      a.status === "cancelled";
    const isBClosed =
      b.status === "delivered" ||
      b.status === "completed" ||
      b.status === "cancelled";

    // Active orders on top; completed/cancelled orders shoved to the bottom
    if (isAClosed && !isBClosed) return 1;
    if (!isAClosed && isBClosed) return -1;

    const aTime = a.createdAt?.seconds ?? 0;
    const bTime = b.createdAt?.seconds ?? 0;
    return bTime - aTime; // newest first within category
  });
}

function formatOrderDate(createdAt?: any): string {
  if (!createdAt) return "-";
  try {
    if (typeof createdAt === "string" || typeof createdAt === "number") {
      return new Date(createdAt).toLocaleString();
    }
    if (createdAt.seconds) {
      return new Date(createdAt.seconds * 1000).toLocaleString();
    }
    if (createdAt._seconds) {
      return new Date(createdAt._seconds * 1000).toLocaleString();
    }
  } catch {
    return "-";
  }
  return "-";
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const { showToast } = useToast();

  function toggleOrder(orderId: string) {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  }

  function toggleAll(expand: boolean) {
    const next: Record<string, boolean> = {};
    filteredOrders.forEach((o) => {
      next[o.id] = expand;
    });
    setExpandedOrders(next);
  }

  async function updateOrderStatus(orderId: string, status: string, silent = false) {
    try {
      const auth = getAuth(firebaseApp);
      const user = auth.currentUser;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (user) {
        try {
          const token = await user.getIdToken();
          headers["Authorization"] = `Bearer ${token}`;
        } catch (e) {
          console.warn("Could not retrieve user ID token, relying on session cookie", e);
        }
      }

      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status, silent }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Failed to update order", "error");
        return;
      }

      setOrders((prev) =>
        sortOrders(
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        )
      );

      showToast(
        silent
          ? `Order marked as ${status} (No email sent)`
          : `Order status updated to ${status}`,
        "success"
      );
    } catch (err) {
      console.error(err);
      showToast("Something went wrong", "error");
    }
  }

  async function deleteOrder(orderId: string, orderDisplayId: string) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete order "${orderDisplayId}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const auth = getAuth(firebaseApp);
      const user = auth.currentUser;

      const headers: Record<string, string> = {};

      if (user) {
        try {
          const token = await user.getIdToken();
          headers["Authorization"] = `Bearer ${token}`;
        } catch (e) {
          console.warn("Could not retrieve user ID token, relying on session cookie", e);
        }
      }

      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Failed to delete order", "error");
        return;
      }

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast("Order deleted successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete order", "error");
    }
  }

  useEffect(() => {
    async function loadOrders() {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = await res.json();
      setOrders(sortOrders(data));
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
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-black">Orders</h1>
          <p className="text-xs font-black uppercase tracking-widest text-black/60 mt-1">
            {filteredOrders.length} total orders ({filteredOrders.filter(o => o.status !== "delivered" && o.status !== "completed" && o.status !== "cancelled").length} active)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleAll(true)}
              className="border-2 border-black bg-white hover:bg-black hover:text-[#A3FF12] text-black font-black uppercase text-xs px-3 py-2 shadow-[2px_2px_0_0_#000] active:translate-y-0.5 transition-all cursor-pointer"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={() => toggleAll(false)}
              className="border-2 border-black bg-white hover:bg-black hover:text-[#A3FF12] text-black font-black uppercase text-xs px-3 py-2 shadow-[2px_2px_0_0_#000] active:translate-y-0.5 transition-all cursor-pointer"
            >
              Collapse All
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search Order ID, Name, Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-black font-black uppercase border-4 border-black px-4 py-2.5 shadow-[4px_4px_0_0_#A3FF12] focus:outline-none focus:translate-y-[2px] focus:shadow-[2px_2px_0_0_#A3FF12] transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 && <p className="text-2xl font-black uppercase">No orders found.</p>}

      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const isClosed =
            order.status === "delivered" ||
            order.status === "completed" ||
            order.status === "cancelled";

          const isExpanded = Boolean(expandedOrders[order.id]);
          const totalItemsCount = order.items.reduce(
            (sum, item) => sum + (item.quantity || 1),
            0
          );

          return (
            <div
              key={order.id}
              className={`border-4 border-black transition-all ${
                isClosed
                  ? "bg-gray-100 shadow-[6px_6px_0_0_#999] opacity-90 hover:opacity-100"
                  : "bg-white shadow-[8px_8px_0_0_#A3FF12]"
              }`}
            >
              {/* 📋 Dropdown Header / Summary Bar (Always Visible, Click to Toggle) */}
              <div
                onClick={() => toggleOrder(order.id)}
                className="cursor-pointer p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 select-none hover:bg-black/5 transition-colors"
              >
                {/* Left Section: Order ID, Customer, Count & Date */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <span className="text-base sm:text-lg font-black uppercase text-black tracking-tight flex items-center gap-2">
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-black text-[#A3FF12] font-mono border border-black">
                      ORDER
                    </span>
                    {order.orderId}
                  </span>

                  {order.deliveryAddress?.fullName && (
                    <span className="text-xs sm:text-sm font-bold uppercase text-black bg-white border-2 border-black px-2.5 py-0.5 shadow-[2px_2px_0_0_#000]">
                      👤 {order.deliveryAddress.fullName}
                    </span>
                  )}

                  <span className="text-xs font-black uppercase text-black/60 bg-gray-200 border border-black/30 px-2 py-0.5">
                    {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
                  </span>

                  <span className="text-xs font-bold text-black/50 hidden md:inline">
                    {formatOrderDate(order.createdAt)}
                  </span>
                </div>

                {/* Right Section: Amount, Status badge, Toggle Button */}
                <div className="flex items-center gap-3 ml-auto">
                  <span className="text-base sm:text-lg font-black text-black bg-[#A3FF12] border-2 border-black px-3 py-1 shadow-[2px_2px_0_0_#000]">
                    ₹{order.totalAmount}
                  </span>

                  <span
                    className={`px-3 py-1 text-xs font-black uppercase tracking-widest ${statusBadgeStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOrder(order.id);
                    }}
                    className="p-1.5 sm:px-3 sm:py-1.5 border-2 border-black bg-white hover:bg-[#A3FF12] shadow-[2px_2px_0_0_#000] active:translate-y-0.5 transition-all text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    aria-label={isExpanded ? "Collapse order details" : "Expand order details"}
                  >
                    <span className="hidden sm:inline text-[11px] uppercase tracking-wider">
                      {isExpanded ? "Hide" : "Details"}
                    </span>
                    <span
                      className={`inline-block transform transition-transform duration-200 text-xs ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                </div>
              </div>

              {/* 📂 Expanded Detailed View */}
              {isExpanded && (
                <div className="border-t-4 border-black p-6 sm:p-8 bg-white animate-in fade-in duration-200">
                  {/* Payment, Total & Timestamp Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <p className="text-lg text-black font-bold uppercase">
                      <strong>Payment:</strong>{" "}
                      <span className="underline decoration-[#A3FF12] decoration-4">
                        {order.paymentStatus}
                      </span>
                    </p>
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
                      {formatOrderDate(order.createdAt)}
                    </p>
                  </div>

                  {/* Items List */}
                  <ul className="mb-6 space-y-3">
                    {order.items.map((item, i) => (
                      <li key={i} className="flex flex-wrap items-center gap-3">
                        <span className="text-xl font-black uppercase text-black">
                          {item.title} × {item.quantity} (₹{item.price})
                        </span>
                        {item.type === "collection" && (
                          <span className="inline-block bg-black text-[#A3FF12] border-2 border-black px-3 py-1 text-sm font-black tracking-widest uppercase shadow-[2px_2px_0_0_#A3FF12]">
                            BUNDLE ({item.posterIds?.length || 0} posters)
                          </span>
                        )}
                        {item.type === "poster" && (
                          <span className="inline-block bg-black text-white border-2 border-black px-3 py-1 text-sm font-black tracking-widest uppercase shadow-[2px_2px_0_0_#A3FF12]">
                            POSTER
                          </span>
                        )}
                        {item.type === "custom" && (
                          <div className="w-full flex flex-col items-start gap-3 mt-2">
                            <span className="inline-block bg-[#A3FF12] text-black border-2 border-black px-3 py-1 text-sm font-black tracking-widest uppercase shadow-[2px_2px_0_0_#000]">
                              CUSTOM POSTERS
                            </span>
                            {item.images && item.images.length > 0 && (
                              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 w-full max-w-2xl">
                                {item.images.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`Custom image ${idx + 1}`}
                                    className="w-full h-auto aspect-[1/1.4] object-cover border-2 border-black"
                                  />
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

                  {/* Customer & Address Details */}
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
                          {order.deliveryAddress?.city || "-"}, {order.deliveryAddress?.state || "-"}{" "}
                          - {order.deliveryAddress?.pincode || "-"}
                        </p>
                      )}
                      {order.deliveryAddress?.additionalNotes && (
                        <p>Notes: {order.deliveryAddress.additionalNotes}</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="mt-8 flex flex-wrap items-center gap-3 pt-6 border-t-4 border-black">
                    {/* Step-by-Step Notification Workflow */}
                    {(order.status === "confirmed" || order.status === "pending") && (
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

                    {/* Silent Clean Actions (For test orders or direct completion without notifying customer) */}
                    {!isClosed ? (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, "delivered", true)}
                          title="Directly mark completed/delivered without sending email (moves to bottom)"
                          className="bg-[#A3FF12] hover:bg-[#8fe010] text-black border-2 border-black font-black uppercase tracking-wider px-3.5 py-2.5 shadow-[3px_3px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0 transition-all text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          ⚡ Complete (No Email)
                        </button>

                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Cancel order "${order.orderId}" silently without sending an email?`
                              )
                            ) {
                              updateOrderStatus(order.id, "cancelled", true);
                            }
                          }}
                          title="Cancel order without sending email (moves to bottom)"
                          className="bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black font-black uppercase tracking-wider px-3.5 py-2.5 shadow-[3px_3px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0 transition-all text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          ❌ Cancel (No Email)
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-gray-500 bg-gray-200 px-3 py-2 border-2 border-black">
                          {order.status === "cancelled" ? "Cancelled (Closed)" : "Delivered (Closed)"}
                        </span>
                        <button
                          onClick={() => updateOrderStatus(order.id, "confirmed", true)}
                          className="bg-white hover:bg-gray-100 text-black border-2 border-black font-black uppercase text-xs px-3 py-2 shadow-[2px_2px_0_0_#000] hover:-translate-y-0.5 transition-all cursor-pointer"
                          title="Revert status to Confirmed to re-enable step-by-step buttons"
                        >
                          ↩ Reset to Confirmed
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, "packed", true)}
                          className="bg-white hover:bg-gray-100 text-black border-2 border-black font-black uppercase text-xs px-3 py-2 shadow-[2px_2px_0_0_#000] hover:-translate-y-0.5 transition-all cursor-pointer"
                          title="Revert status to Packed"
                        >
                          📦 Reset to Packed
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, "shipped", true)}
                          className="bg-white hover:bg-gray-100 text-black border-2 border-black font-black uppercase text-xs px-3 py-2 shadow-[2px_2px_0_0_#000] hover:-translate-y-0.5 transition-all cursor-pointer"
                          title="Revert status to Shipped"
                        >
                          🚚 Reset to Shipped
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => deleteOrder(order.id, order.orderId)}
                      className="sm:ml-auto bg-red-500 hover:bg-red-600 text-white border-2 border-black font-black uppercase tracking-wider px-4 py-2.5 shadow-[3px_3px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0 transition-all text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      🗑️ Delete Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

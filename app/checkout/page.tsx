"use client";

import { useCart } from "../../context/CartContext";
import { useEffect, useState } from "react";
import { DeliveryAddress, Order } from "@/types/order";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";


type AddressFormState = {
  fullName: string;
  phone: string;
  email: string;
  hostelNumber: string;
  roomNumber: string;
  block: string;
  gender: "" | "male" | "female" | "other";
  additionalNotes: string;
};



export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [mounted, setMounted] = useState(false);
  
const initialAddressState: AddressFormState = {
  fullName: "",
  phone: "",
  email: "",
  hostelNumber: "",
  roomNumber: "",
  block: "",
  gender: "",        // ✅ truly empty initially
  additionalNotes: "",
};

  const [address, setAddress] = useState<AddressFormState>(initialAddressState);


    
    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
  if (!loading && !user) {
    router.replace("/login");
  }
}, [user, loading, router]);

  
    if (!mounted || loading || !user) {
      return null;
    }

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  async function placeOrder() {
  if (!user) return;

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  // basic validation (UI already does required, but backend must double-check)
  if (
    !address.fullName ||
    !address.phone ||
    !address.gender ||
    !address.email ||
    !address.hostelNumber ||
    !address.roomNumber ||
    !address.block
  ) {
    alert("Please fill all required delivery details.");
    return;
  }

  const orderId = crypto.randomUUID();

  const order = {
    orderId,
    userId: user.uid,
    items: cart,
    totalAmount,
    deliveryAddress: address,
    status: "pending",
    paymentStatus: "unpaid",
    createdAt: serverTimestamp(),
  };
  setPlacing(true);
  try {
    await setDoc(doc(db, "orders", orderId), order);

    clearCart();
    setAddress(initialAddressState);
    alert("Order placed successfully!");
    router.push("/");
  } catch (error) {
    console.error("Order failed:", error);
    alert("Failed to place order. Please try again.");
  }
  finally {
    setPlacing(false);
  }
}



  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Address Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Delivery Details</h2>

          <form className="space-y-4">
  {/* Name */}
  <input
    type="text"
    placeholder="Full Name"
    required
    value={address.fullName}
    onChange={(e) =>
      setAddress({ ...address, fullName: e.target.value })
    }
    className="w-full p-3 border border-white bg-transparent rounded"
  />

  {/* Phone */}
  <input
    type="tel"
    placeholder="Contact Number"
    required
    value={address.phone}
    onChange={(e) =>
      setAddress({ ...address, phone: e.target.value })
    }
    className="w-full p-3 border border-white bg-transparent rounded"
  />

  {/* Gender */}
  <select
    required
    value={address.gender}
    onChange={(e) =>
      setAddress({ ...address, gender: e.target.value as AddressFormState["gender"] })
    }
    className={`w-full p-3 border border-white bg-black rounded ${ address.gender === "" ? "text-gray-400" : "text-white"}`}>
        
    <option value="" disabled className="text-gray-400">
      Select Gender
    </option>
    <option value="female" className="bg-black text-white">
      Female
    </option>
    <option value="male" className="bg-black text-white">
      Male
    </option>
    <option value="other" className="bg-black text-white">
      Other
    </option>
  </select>

  {/* Email */}
  <input
    type="email"
    placeholder="Email Address"
    required
    value={address.email}
    onChange={(e) =>
      setAddress({ ...address, email: e.target.value })
    }
    className="w-full p-3 border border-white bg-transparent rounded"
  />

  {/* Hostel Number */}
  <input
  type="text"
  placeholder="Hostel Number"
  required
  inputMode="numeric"
  pattern="[0-9]*"
  value={address.hostelNumber}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, "");
    setAddress({ ...address, hostelNumber: value });
  }}
  className="w-full p-3 border border-white bg-transparent rounded"
/>

<div className="flex gap-4">
  
  {/* Room + Block */}
    <input
      type="text"
      placeholder="Room Number"
      required
      value={address.roomNumber}
      onChange={(e) =>
        setAddress({ ...address, roomNumber: e.target.value })
      }
      className="w-full p-3 border border-white bg-transparent rounded"
    />

    <input
  type="text"
  placeholder="Block"
  required
  maxLength={1}
  value={address.block}
  onChange={(e) => {
    const value = e.target.value
      .replace(/[^a-zA-Z]/g, "")
      .toUpperCase();
    setAddress({ ...address, block: value });
  }}
  className="w-full p-3 border border-white bg-transparent rounded"
/>

</div>


  {/* Notes */}
  <textarea
    placeholder="Additional Notes (optional)"
    value={address.additionalNotes}
    onChange={(e) =>
      setAddress({ ...address, additionalNotes: e.target.value })
    }
    rows={3}
    className="w-full p-3 border border-white bg-transparent rounded"
  />
          </form>


        </div>

        {/* Order Summary */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

          <div className="space-y-4 border border-white p-4 rounded-lg">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.title} × {item.quantity}
                </span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}

            <div className="border-t border-white pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{totalAmount}</span>
            </div>

            <button
              type="button"
              onClick={placeOrder}
              disabled={placing}
              className={`w-full mt-4 py-3 bg-white text-black font-semibold rounded transition ${ placing ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
            >
            {placing ? "Placing Order..." : "Place Order"}
           </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCart } from "../../context/CartContext";
import { useEffect, useState } from "react";
import { DeliveryAddress, Order } from "@/types/order";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { buttons } from "@/lib/ui/buttons";


type AddressFormState = {
  isNitkkr: boolean;
  fullName: string;
  phone: string;
  email: string;
  hostelNumber: string;
  roomNumber: string;
  block: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
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
  isNitkkr: true,
  fullName: "",
  phone: "",
  email: "",
  hostelNumber: "",
  roomNumber: "",
  block: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
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
  
  async function createRazorpayOrder(amount: number, orderId: string) {
  const res = await fetch("/api/razorpay/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, orderId }),
  });

  if (!res.ok) {
    throw new Error("Failed to create Razorpay order");
  }

  return res.json();
}

console.log("NEW RAZORPAY PLACE ORDER CALLED");

async function placeOrder() {
  if (!user) return;

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  if (
    !address.fullName ||
    !address.phone ||
    !address.gender ||
    !address.email
  ) {
    alert("Please fill all required delivery details.");
    return;
  }

  if (address.isNitkkr) {
    if (!address.hostelNumber || !address.roomNumber || !address.block) {
      alert("Please fill all required hostel delivery details.");
      return;
    }
  } else {
    if (!address.addressLine || !address.city || !address.state || !address.pincode) {
      alert("Please fill all required address details.");
      return;
    }
  }

  // ✅ Validate cart items
  for (const item of cart) {
    if (!item.id || !item.title || !item.price || !item.type) {
      alert("Invalid item in cart");
      return;
    }

    if (item.type !== "poster" && item.type !== "collection") {
      alert("Invalid item type");
      return;
    }

    if (item.type === "collection") {
      if (!("posterIds" in item) || !item.posterIds || item.posterIds.length === 0) {
        alert("Invalid collection item - missing posters");
        return;
      }
    }
  }

  setPlacing(true);

  const orderId = crypto.randomUUID();

  try {
    const finalAddress = address.isNitkkr
      ? {
          isNitkkr: true,
          fullName: address.fullName,
          phone: address.phone,
          email: address.email,
          gender: address.gender,
          hostelNumber: address.hostelNumber,
          roomNumber: address.roomNumber,
          block: address.block,
          additionalNotes: address.additionalNotes,
        }
      : {
          isNitkkr: false,
          fullName: address.fullName,
          phone: address.phone,
          email: address.email,
          gender: address.gender,
          addressLine: address.addressLine,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          additionalNotes: address.additionalNotes,
        };

    // 1️⃣ Create internal order (UNPAID)
    await setDoc(doc(db, "orders", orderId), {
      orderId,
      userId: user.uid,
      items: cart,
      totalAmount,
      deliveryAddress: finalAddress,
      status: "pending",
      paymentStatus: "created",
      createdAt: serverTimestamp(),
    });

    // 2️⃣ Create Razorpay order (SERVER)
    const razorpayOrder = await createRazorpayOrder(
      totalAmount,
      orderId
    );

    // 3️⃣ Open Razorpay Checkout (CLIENT)
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // we'll add this next
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Wall Crawl Nation",
      description: "Order Payment",
      order_id: razorpayOrder.razorpayOrderId,
      handler: async function (response: any) {
  try {
    const verifyRes = await fetch("/api/razorpay/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        orderId,
      }),
    });

    if (!verifyRes.ok) {
      throw new Error("Verification failed");
    }

    // ✅ ONLY after server confirms
    clearCart();
    router.replace("/thank-you");
  } catch (err) {
    console.error(err);
    alert("Payment succeeded but verification failed. Please contact support.");
  }
},


      prefill: {
        name: address.fullName,
        email: address.email,
        contact: address.phone,
      },
      theme: { color: "#ffffff" },
    };

    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error(err);
    alert("Payment initialization failed");
  } finally {
    setPlacing(false);
  }
}

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
      <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-black mb-12 border-b-8 border-black pb-4 inline-block">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Address Form */}
        <div className="border-4 border-black p-8 shadow-[12px_12px_0_0_#A3FF12] bg-white">
          <h2 className="text-3xl font-black uppercase tracking-widest text-black mb-8">Delivery Details</h2>

          <form className="space-y-6">
            <div className="flex items-center justify-between p-4 border-4 border-black bg-[#A3FF12] mb-6">
              <span className="font-black uppercase text-black text-xl">Deliver to NITKKR?</span>
              <button
                type="button"
                onClick={() => setAddress({ ...address, isNitkkr: !address.isNitkkr })}
                className={`w-16 h-8 border-4 border-black rounded-full flex items-center transition-colors ${
                  address.isNitkkr ? "bg-black justify-end" : "bg-white justify-start"
                } px-1`}
              >
                <div className={`w-5 h-5 rounded-full border-2 border-black ${address.isNitkkr ? "bg-[#A3FF12]" : "bg-black"}`}></div>
              </button>
            </div>
  {/* Name */}
  <input
    type="text"
    placeholder="Full Name"
    required
    value={address.fullName}
    onChange={(e) =>
      setAddress({ ...address, fullName: e.target.value })
    }
    className="w-full p-4 border-4 border-black bg-[#f0f0f0] text-black font-bold uppercase placeholder-black/50 focus:outline-none focus:bg-[#A3FF12] transition-colors"
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
    className="w-full p-4 border-4 border-black bg-[#f0f0f0] text-black font-bold uppercase placeholder-black/50 focus:outline-none focus:bg-[#A3FF12] transition-colors"
  />

  {/* Gender */}
  <select
    required
    value={address.gender}
    onChange={(e) =>
      setAddress({ ...address, gender: e.target.value as AddressFormState["gender"] })
    }
    className={`w-full p-4 border-4 border-black bg-[#f0f0f0] font-bold uppercase appearance-none focus:outline-none focus:bg-[#A3FF12] transition-colors cursor-pointer ${ address.gender === "" ? "text-black/50" : "text-black"}`}>
        
    <option value="" disabled className="text-black/50">
      Select Gender
    </option>
    <option value="female" className="bg-white text-black font-bold uppercase">
      Female
    </option>
    <option value="male" className="bg-white text-black font-bold uppercase">
      Male
    </option>
    <option value="other" className="bg-white text-black font-bold uppercase">
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
    className="w-full p-4 border-4 border-black bg-[#f0f0f0] text-black font-bold uppercase placeholder-black/50 focus:outline-none focus:bg-[#A3FF12] transition-colors"
  />

  {address.isNitkkr ? (
    <>
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
        className="w-full p-4 border-4 border-black bg-[#f0f0f0] text-black font-bold uppercase placeholder-black/50 focus:outline-none focus:bg-[#A3FF12] transition-colors"
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
          className="w-full p-4 border-4 border-black bg-[#f0f0f0] text-black font-bold uppercase placeholder-black/50 focus:outline-none focus:bg-[#A3FF12] transition-colors"
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
          className="w-full p-4 border-4 border-black bg-[#f0f0f0] text-black font-bold uppercase placeholder-black/50 focus:outline-none focus:bg-[#A3FF12] transition-colors"
        />
      </div>
    </>
  ) : (
    <>
      {/* Address Line */}
      <input
        type="text"
        placeholder="Address Line"
        required
        value={address.addressLine}
        onChange={(e) =>
          setAddress({ ...address, addressLine: e.target.value })
        }
        className="w-full p-4 border-4 border-black bg-[#f0f0f0] text-black font-bold uppercase placeholder-black/50 focus:outline-none focus:bg-[#A3FF12] transition-colors"
      />

      <div className="flex gap-4">
        {/* City + State */}
        <input
          type="text"
          placeholder="City"
          required
          value={address.city}
          onChange={(e) =>
            setAddress({ ...address, city: e.target.value })
          }
          className="w-full p-4 border-4 border-black bg-[#f0f0f0] text-black font-bold uppercase placeholder-black/50 focus:outline-none focus:bg-[#A3FF12] transition-colors"
        />
        <input
          type="text"
          placeholder="State"
          required
          value={address.state}
          onChange={(e) =>
            setAddress({ ...address, state: e.target.value })
          }
          className="w-full p-4 border-4 border-black bg-[#f0f0f0] text-black font-bold uppercase placeholder-black/50 focus:outline-none focus:bg-[#A3FF12] transition-colors"
        />
      </div>
      
      {/* Pincode */}
      <input
        type="text"
        placeholder="Pincode"
        required
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        value={address.pincode}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, "");
          setAddress({ ...address, pincode: value });
        }}
        className="w-full p-4 border-4 border-black bg-[#f0f0f0] text-black font-bold uppercase placeholder-black/50 focus:outline-none focus:bg-[#A3FF12] transition-colors"
      />
    </>
  )}


  {/* Notes */}
  <textarea
    placeholder="Additional Notes (optional)"
    value={address.additionalNotes}
    onChange={(e) =>
      setAddress({ ...address, additionalNotes: e.target.value })
    }
    rows={3}
    className="w-full p-4 border-4 border-black bg-[#f0f0f0] text-black font-bold uppercase placeholder-black/50 focus:outline-none focus:bg-[#A3FF12] transition-colors"
  />
          </form>


        </div>

        {/* Order Summary */}
        <div className="h-fit sticky top-24 border-4 border-black p-8 shadow-[12px_12px_0_0_#A3FF12] bg-white">
          <h2 className="text-3xl font-black uppercase tracking-widest text-black mb-8 border-b-4 border-black pb-4">Order Summary</h2>

          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-[#f0f0f0] p-4 border-4 border-black">
                <span className="font-bold uppercase text-black">
                  {item.title} × {item.quantity}
                </span>
                <span className="font-black text-xl text-black bg-[#A3FF12] px-2 py-1 border-2 border-black">₹{item.price * item.quantity}</span>
              </div>
            ))}

            <div className="border-t-8 border-black pt-6 mt-8 flex justify-between font-black text-3xl uppercase text-black items-center">
              <span>Total</span>
              <span className="text-[#A3FF12] bg-black px-4 py-2 drop-shadow-[4px_4px_0_#A3FF12]">₹{totalAmount}</span>
            </div>

            <button
              type="button"
              onClick={placeOrder}
              disabled={placing}
              className={`${buttons.primary} w-full mt-8 text-2xl py-6 ${ placing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
            {placing ? "Processing..." : "Pay Now"}
           </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCart } from "../../context/CartContext";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const { cart } = useCart();

  const [mounted, setMounted] = useState(false);
  
  
  const [address, setAddress] = useState({
  fullName: "",
  phone: "",
  gender: "",
  email: "",
  hostelNumber: "",
  roomNumber: "",
  block: "",
  additionalNotes: "",
});

    
    useEffect(() => {
      setMounted(true);
    }, []);
  
    if (!mounted) {
      return null;
    }

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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
      setAddress({ ...address, gender: e.target.value })
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
    value={address.hostelNumber}
    onChange={(e) =>
      setAddress({ ...address, hostelNumber: e.target.value })
    }
    className="w-full p-3 border border-white bg-transparent rounded"
  />

  {/* Room + Block */}
  <div className="flex gap-4">
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
      value={address.block}
      onChange={(e) =>
        setAddress({ ...address, block: e.target.value })
      }
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
              className="w-full mt-4 py-3 bg-white text-black font-semibold rounded hover:opacity-90 transition"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

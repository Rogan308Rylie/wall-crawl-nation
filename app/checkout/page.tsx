"use client";

import { useCart } from "../../context/CartContext";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const { cart } = useCart();

  const [mounted, setMounted] = useState(false);
  
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
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 border border-white bg-transparent rounded"
            />

            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full p-3 border border-white bg-transparent rounded"
            />

            <textarea
              placeholder="Complete Address"
              rows={4}
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

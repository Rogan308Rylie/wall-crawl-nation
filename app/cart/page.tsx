"use client";

import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const { cart } = useCart();

  if (cart.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="space-y-4">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center border border-white p-4 rounded"
          >
            <div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm opacity-80">
                Quantity: {item.quantity}
              </p>
            </div>

            <div className="font-semibold">
              ₹{item.price * item.quantity}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

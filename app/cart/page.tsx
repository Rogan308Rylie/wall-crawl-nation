"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";



export default function CartPage() {
  const { cart, increaseQuantity, decreaseQuantity } = useCart();
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();


  useEffect(() => {
    setMounted(true);
  }, []);
  
  if(!mounted) {
    return null;
  }

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
          <div key={item.id} className="flex justify-between items-center border border-white p-5 rounded-lg bg-black/40">
            <div>
                <h3 className="font-semibold">{item.title}</h3>

                <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => decreaseQuantity(item.id)} className="px-2 py-1 border border-white rounded hover:bg-white hover:text-black transition"
                    >
                      −
                    </button>

                    <span>Quantity: {item.quantity}</span>

                    <button onClick={() => increaseQuantity(item.id)} className="px-2 py-1 border border-white rounded hover:bg-white hover:text-black transition">
                      +
                    </button>
                </div>
            </div>


            <div className="font-semibold">
              ₹{item.price * item.quantity}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-right text-2xl font-extrabold">
        Total: ₹{totalAmount}
      </div>

      {cart.length > 0 && (
     <button
       onClick={() => router.push("/checkout")}
       className="w-full mt-6 py-3 bg-white text-black font-semibold rounded hover:opacity-90 transition"
     >
       Proceed to Checkout
     </button>
)}


    </div>
  );
}

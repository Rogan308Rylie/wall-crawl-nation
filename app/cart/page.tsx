"use client";

import { useCart } from "../../context/CartContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buttons } from "@/lib/ui/buttons";



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
      <div className="text-center text-white/60">
  <p className="text-sm">Your cart is empty.</p>
  <p className="mt-1 text-xs">
    Add some posters to make your wall look sick.
  </p>
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
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className={`${buttons.secondary} px-2 py-1 text-xs`}
                    >
                      −
                    </button>

                    <span>Quantity: {item.quantity}</span>

                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className={`${buttons.secondary} px-2 py-1 text-xs`}
                    >
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
       className={`${buttons.primary} w-full mt-6`}
     >
       Proceed to Checkout
     </button>
)}


    </div>
  );
}

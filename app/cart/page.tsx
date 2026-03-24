"use client";

import Image from "next/image";
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

  if (!mounted) {
    return null;
  }

  if (cart.length === 0) {
    return (
      <div className="text-center text-black border-4 border-black p-12 bg-white shadow-[12px_12px_0_0_#A3FF12] max-w-2xl mx-auto mt-20">
        <p className="text-2xl font-black uppercase">Your cart is empty.</p>
        <p className="mt-4 font-bold border-2 border-black inline-block px-4 py-2 bg-[#A3FF12]">Add some posters to make your wall look sick.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="mb-10 text-5xl font-black uppercase tracking-tighter text-black border-b-8 border-black inline-block pr-8 pb-2">Your Cart</h1>

      <div className="space-y-6">
        {cart.map((item) => (
          <div
            key={item.id}
            className="
              flex flex-col gap-4
              border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#A3FF12]
              sm:flex-row sm:items-center sm:justify-between sm:gap-6
            "
          >
            <div className="flex items-center gap-6">
              <div className="relative h-32 w-24 overflow-hidden border-4 border-black bg-[#f0f0f0]">
                <Image
                  src={(item.type === "poster" ? item.imagePath : item.coverImage) || "/placeholder.jpg"}
                  alt={item.title}
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-black uppercase tracking-widest text-black">{item.title}</h3>
                  {item.type === "collection" && (
                    <span className="text-xs font-black bg-black text-[#A3FF12] px-2 py-1 uppercase shadow-[2px_2px_0_0_#A3FF12]">
                      Bundle
                    </span>
                  )}
                </div>

                {/* Quantity Controls - For both Posters and Collections */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="h-10 w-10 border-2 border-black bg-[#A3FF12] text-black font-black text-xl hover:bg-black hover:text-[#A3FF12] transition-colors"
                  >
                    -
                  </button>

                  <span className="text-xl font-black text-black w-8 text-center">{item.quantity}</span>

                  <button
                    onClick={() => increaseQuantity(item.id)}
                    className="h-10 w-10 border-2 border-black bg-[#A3FF12] text-black font-black text-xl hover:bg-black hover:text-[#A3FF12] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="text-2xl font-black border-4 border-black px-4 py-2 bg-[#A3FF12] shadow-[4px_4px_0_0_#000]">₹{item.price * item.quantity}</div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 border-4 border-black bg-white shadow-[12px_12px_0_0_#A3FF12] text-right">
        <div className="text-4xl font-black uppercase text-black">Total: <span className="text-[#A3FF12] drop-shadow-[2px_2px_0_#000]">₹{totalAmount}</span></div>
      </div>

      {cart.length > 0 && (
        <button onClick={() => router.push("/checkout")} className={`${buttons.primary} mt-6 w-full`}>
          Proceed to Checkout
        </button>
      )}
    </div>
  );
}

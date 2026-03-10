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
      <div className="text-center text-white/60">
        <p className="text-sm">Your cart is empty.</p>
        <p className="mt-1 text-xs">Add some posters to make your wall look sick.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Your Cart</h1>

      <div className="space-y-4">
        {cart.map((item) => (
          <div
            key={item.id}
            className="
              flex flex-col gap-4
              rounded-2xl bg-[#111] p-4 ring-1 ring-white/10
              sm:flex-row sm:items-center sm:justify-between sm:gap-6
            "
          >
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-16 overflow-hidden rounded-md bg-[#0a0a0a] ring-1 ring-white/5">
                <Image
                  src={item.type === "poster" ? item.imagePath : item.coverImage}
                  alt={item.title}
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium">{item.title}</h3>
                  {item.type === "collection" && (
                    <span className="text-xs bg-purple-600/80 text-white px-2 py-0.5 rounded">
                      Bundle
                    </span>
                  )}
                </div>

                {/* Quantity Controls - For both Posters and Collections */}
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="h-8 w-8 rounded-md bg-[#1a1a1a] text-white/70 transition hover:bg-[#222]"
                  >
                    -
                  </button>

                  <span className="text-sm text-white/80">{item.quantity}</span>

                  <button
                    onClick={() => increaseQuantity(item.id)}
                    className="h-8 w-8 rounded-md bg-[#1a1a1a] text-white/70 transition hover:bg-[#222]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="text-sm font-semibold">₹{item.price * item.quantity}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-right text-2xl font-extrabold">Total: ₹{totalAmount}</div>

      {cart.length > 0 && (
        <button onClick={() => router.push("/checkout")} className={`${buttons.primary} mt-6 w-full`}>
          Proceed to Checkout
        </button>
      )}
    </div>
  );
}

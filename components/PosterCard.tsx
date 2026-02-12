"use client";

import Image from "next/image";
import { useCart } from "../context/CartContext";
import { buttons } from "@/lib/ui/buttons";

type PosterCardProps = {
  id: string;
  title: string;
  price: number;
  imagePath: string;
};

export default function PosterCard({
  id,
  title,
  price,
  imagePath,
}: PosterCardProps) {
  const { cart, addToCart, increaseQuantity, decreaseQuantity } = useCart();
  const cartItem = cart.find((item) => item.id === id);
  const quantity = cartItem?.quantity || 0;

  return (
    <div
      className="
    group
    relative
    flex
    flex-col
    gap-4
    rounded-2xl
    bg-gradient-to-b
    from-[#141414]
    to-[#0d0d0d]
    p-4
    transition-all
    duration-300
    hover:-translate-y-1
    hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]
  "
    >
      {/* Poster frame */}
      <div
        className="
    relative
    w-full
    aspect-[210/297]
    rounded-xl
    bg-[#0a0a0a]
    flex
    items-center
    justify-center
    overflow-hidden
    ring-1
    ring-white/5
  "
      >
        <Image
          src={imagePath}
          alt={title || "Poster image"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 300px"
          className="
    object-contain
    transition-transform
    duration-300
    group-hover:scale-[1.02]
    drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]
  "
        />
      </div>

      {/* Text */}
      <div>
        <h3 className="text-[13px] font-medium leading-snug tracking-wide">{title}</h3>
        <p className="mt-1.5 text-xs text-white/60">₹{price}</p>
      </div>

      {/* CTA - Morphs between Add to Cart and Quantity Controls */}
      {quantity === 0 ? (
        <button
          onClick={() => addToCart({ id, title, price, imagePath })}
          className={`${buttons.primary} mt-auto w-full`}
        >
          Add to Cart
        </button>
      ) : (
        <div className="mt-auto flex items-center justify-between gap-2 rounded-xl bg-[#1a1a1a] p-2">
          <button
            onClick={() => decreaseQuantity(id)}
            className="h-8 w-8 flex items-center justify-center rounded-md bg-[#111] text-white/70 hover:bg-[#222] transition"
          >
            −
          </button>

          <span
            key={quantity}
            className="flex-1 text-center text-sm font-semibold animate-pop"
          >
            {quantity}
          </span>

          <button
            onClick={() => increaseQuantity(id)}
            className="h-8 w-8 flex items-center justify-center rounded-md bg-[#111] text-white/70 hover:bg-[#222] transition"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}

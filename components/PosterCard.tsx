"use client";

import Image from "next/image";
import { useCart } from "../context/CartContext";
import { buttons } from "@/lib/ui/buttons";

type PosterCardProps = {
  id: string;
  title: string;
  price: number;
  imagePath: string;
  tags?: string[];
};

export default function PosterCard({
  id,
  title,
  price,
  imagePath,
  tags,
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
    border-4
    border-black
    bg-white
    p-4
    shadow-[8px_8px_0_0_#A3FF12]
    transition-all
    duration-200
    hover:-translate-y-1
    hover:translate-x-1
    hover:shadow-[12px_12px_0_0_#A3FF12]
  "
    >
      {/* Poster frame */}
      <div
        className="
    relative
    w-full
    aspect-[210/297]
    bg-[#f0f0f0]
    flex
    items-center
    justify-center
    overflow-hidden
    border-4
    border-black
  "
      >
        <Image
          src={imagePath || "/placeholder.jpg"}
          alt={title || "Poster image"}
          fill
          unoptimized
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
        <h3 className="text-lg font-black uppercase leading-snug tracking-widest text-black">{title}</h3>
        <p className="mt-1.5 text-base font-bold text-black border-2 border-black inline-block px-2 bg-[#A3FF12]">₹{price}</p>

        {/* Tag tablets */}
        {tags && tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-4">
            {[...tags].sort().map((tag) => (
              <span
                key={tag}
                className="border-2 border-black px-2 py-0.5 text-xs font-black uppercase text-black bg-white"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* CTA - Morphs between Add to Cart and Quantity Controls */}
      {quantity === 0 ? (
        <button
          onClick={() => addToCart({ type: "poster", id, title, price, imagePath })}
          onMouseEnter={(e) => (e.currentTarget.style.cursor = "pointer")}
          className={`${buttons.primary} mt-auto w-full`}
        >
          Add to Cart
        </button>
      ) : (
        <div className="mt-auto flex items-center justify-between gap-2 border-4 border-black bg-white p-2">
          <button
            onClick={() => decreaseQuantity(id)}
            className="h-10 w-10 flex items-center justify-center border-2 border-black bg-[#A3FF12] text-black font-black text-xl hover:bg-black hover:text-[#A3FF12] transition-colors"
          >
            −
          </button>

          <span
            key={quantity}
            className="flex-1 text-center text-xl font-black text-black animate-pop"
          >
            {quantity}
          </span>

          <button
            onClick={() => increaseQuantity(id)}
            className="h-10 w-10 flex items-center justify-center border-2 border-black bg-[#A3FF12] text-black font-black text-xl hover:bg-black hover:text-[#A3FF12] transition-colors"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}

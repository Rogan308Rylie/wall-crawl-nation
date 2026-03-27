"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import { buttons } from "@/lib/ui/buttons";
import PosterDetailsModal from "./shop/PosterDetailsModal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const cartItem = cart.find((item) => item.id === id);
  const quantity = cartItem?.quantity || 0;

  return (
    <>
      <div
        className="
      group
      relative
      flex
      flex-col
      gap-3
      border-4
      border-black
      bg-white
      p-3
      shadow-[6px_6px_0_0_#A3FF12]
      transition-all
      duration-200
      hover:-translate-y-1
      hover:translate-x-1
      hover:shadow-[10px_10px_0_0_#A3FF12]
    "
      >
        {/* Poster frame */}
        <div
          onClick={() => setIsModalOpen(true)}
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
      cursor-zoom-in
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
      duration-500
      group-hover:scale-105
      drop-shadow-[0_15px_30px_rgba(0,0,0,0.3)]
    "
          />
          
          {/* Overlay to hint interaction */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-white border-2 border-black px-3 py-1 text-[10px] font-black uppercase text-black transform rotate-2">
              Detail view
            </span>
          </div>
        </div>

        <div onClick={() => setIsModalOpen(true)} className="cursor-pointer group/info">
          <div className="flex items-start justify-between gap-1">
            <h3 className="flex-1 text-sm sm:text-base font-black uppercase leading-tight tracking-wider text-black group-hover/info:text-black line-clamp-2">
              {title}
            </h3>
            <span className="shrink-0 text-sm font-black text-black bg-[#A3FF12] border-2 border-black px-1.5 shadow-[2px_2px_0_0_#000]">
              ₹{price}
            </span>
          </div>
        </div>

        {/* CTA - Morphs between Add to Cart and Quantity Controls */}
        {quantity === 0 ? (
          <button
            onClick={() => addToCart({ type: "poster", id, title, price, imagePath })}
            className={`${buttons.primary} mt-auto w-full text-xs sm:text-sm py-2 sm:py-2.5 shadow-[4px_4px_0_0_#000] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all`}
          >
            Add to Cart
          </button>
        ) : (
          <div className="mt-auto flex items-center justify-between gap-2 border-4 border-black bg-white p-1.5 shadow-[4px_4px_0_0_#000]">
            <button
              onClick={() => decreaseQuantity(id)}
              className="h-8 sm:h-9 w-8 sm:w-9 flex items-center justify-center border-2 border-black bg-[#A3FF12] text-black font-black text-lg hover:bg-black hover:text-[#A3FF12] transition-colors"
            >
              −
            </button>

            <span
              key={quantity}
              className="flex-1 text-center text-lg font-black text-black animate-pop"
            >
              {quantity}
            </span>

            <button
              onClick={() => increaseQuantity(id)}
              className="h-8 sm:h-9 w-8 sm:w-9 flex items-center justify-center border-2 border-black bg-[#A3FF12] text-black font-black text-lg hover:bg-black hover:text-[#A3FF12] transition-colors"
            >
              +
            </button>
          </div>
        )}
      </div>

      <PosterDetailsModal
        id={id}
        title={title}
        price={price}
        imagePath={imagePath}
        tags={tags}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

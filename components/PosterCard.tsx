"use client";

import Image from "next/image";
import { useCart } from "../context/CartContext";

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
  const { addToCart } = useCart();

  return (
    <div className="border border-white p-4 rounded-lg hover:scale-[1.02] transition flex flex-col gap-3">
      <div className="relative w-full aspect-[210/297] bg-gray-800 rounded overflow-hidden">
        <Image
          src={imagePath}
          alt={title || "Poster image"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 300px"
          className="object-cover"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm opacity-80">₹{price}</p>
      </div>

      <button
        onClick={() => addToCart({ id, title, price })}
        className="mt-auto px-3 py-1 border border-white rounded hover:bg-white hover:text-black transition"
      >
        Add to Cart
      </button>
    </div>
  );
}

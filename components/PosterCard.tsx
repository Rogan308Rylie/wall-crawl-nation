"use client";
import { useCart } from "@/context/CartContext";

export default function PosterCard({
  id,
  title,
  price,
}: {
  id: number;
  title: string;
  price: number;
}) {
  const { addToCart } = useCart();

  return (
    <div className="border border-white p-4 rounded-lg hover:scale-[1.02] transition">
      <div className="h-40 bg-gray-800 mb-4 rounded" />

      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm opacity-80 mb-3">₹{price}</p>

      <button
        onClick={() => addToCart({ id, title, price })}
        className="mt-auto px-3 py-1 border border-white rounded hover:bg-white hover:text-black transition"
      >
        Add to Cart
      </button>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-white">
      <div className="text-xl font-bold">
        Wall Crawl Nation
      </div>

      <div className="flex gap-6">
        <Link
          href="/"
          className={pathname === "/" ? "underline font-semibold" : "hover:underline"}
        >
          Home
        </Link>

        <Link
          href="/shop"
          className={pathname === "/shop" ? "underline font-semibold" : "hover:underline"}
        >
          Shop
        </Link>

        <Link
          href="/cart"
          className={pathname === "/cart" ? "underline font-semibold" : "hover:underline"}
        >
          Cart ({cartCount})
        </Link>
      </div>
    </nav>
  );
}

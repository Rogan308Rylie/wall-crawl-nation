"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

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
          Cart
        </Link>
      </div>
    </nav>
  );
}

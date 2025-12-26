"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";


export default function Navbar() {
    const pathname = usePathname();
    const { cart } = useCart();
    const { user, logout, loading } = useAuth();
    const[mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);


    // Logout shortcut for devs: Ctrl + Shift + L
    useEffect(() => {
  function handleKey(e: KeyboardEvent) {
    if (e.ctrlKey && e.shiftKey && e.key === "L") {
      logout();
      console.log("Logged out (dev shortcut)");
    }
  }

  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}, [logout]);

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

        <Link href="/cart" className={`relative ${ pathname === "/cart" ? "font-semibold underline" : "hover:underline"}`}>
            Cart
            {mounted && cartCount > 0 && ( <span className="absolute -top-2 -right-4 bg-white text-black text-xs font-bold px-2 py-0.5 rounded-full">
            {cartCount}
            </span>
            )}

        </Link>

        {!loading && !user && (
    <>
      <Link
        href="/login"
        className="hover:underline"
      >
        Login
      </Link>
      <Link
        href="/signup"
        className="border border-white px-3 py-1 rounded hover:bg-white hover:text-black transition"
      >
        Sign Up
      </Link>
    </>
  )}

  {!loading && user && (
    <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition">
  {user.photoURL ? (
    <img
      src={user.photoURL}
      alt={user.displayName || "User"}
      className="w-8 h-8 rounded-full object-cover border border-white"
      referrerPolicy="no-referrer"
    />
  ) : (
    <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center text-xs font-semibold">
      {(user.displayName || user.email || "U")[0].toUpperCase()}
    </div>
  )}

  <span className="text-sm opacity-80 max-w-[140px] truncate">
    {user.displayName || user.email}
  </span>
</div>



  )}
      </div>
    </nav>
  );
}

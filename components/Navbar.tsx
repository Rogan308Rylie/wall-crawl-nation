"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { buttons } from "@/lib/ui/buttons";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useCart();
  const { user, logout, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("nightMode");
    if (saved === "true") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark-mode");
    }
  }, []);

  const toggleNightMode = () => {
    const newState = !isDarkMode;
    setIsDarkMode(newState);
    if (newState) {
      document.documentElement.classList.add("dark-mode");
      localStorage.setItem("nightMode", "true");
    } else {
      document.documentElement.classList.remove("dark-mode");
      localStorage.setItem("nightMode", "false");
    }
  };

  function navLink(path: string) {
    const isActive = pathname === path;

    return `relative px-4 py-2 border-2 text-sm font-black uppercase tracking-widest transition-all duration-200 ${
      isActive ? "border-black bg-black text-[#A3FF12] shadow-[4px_4px_0_0_#A3FF12]" : "border-transparent text-black hover:border-black hover:shadow-[4px_4px_0_0_#000]"
    }`;
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Ctrl + Shift + L → Logout
      if (e.ctrlKey && e.shiftKey && e.key === "L") {
        logout();
        console.log("Logged out (dev shortcut)");
      }
      // Ctrl + Shift + K → Admin page
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        router.push("/admin");
        console.log("Navigated to admin (dev shortcut)");
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [logout, router]);

  return (
    <nav
      className="
        sticky top-0 z-50
        border-b-8 border-black
        bg-white
      "
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-black uppercase tracking-widest text-black hover:-translate-y-1 hover:drop-shadow-[4px_4px_0_#A3FF12] transition-all">
          Wall Crawl Nation
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className={navLink("/")}>
            Home
          </Link>

          <Link href="/shop" className={navLink("/shop")}>
            Shop
          </Link>

          <Link href="/cart" className={navLink("/cart")}>
            Cart
            {mounted && cartCount > 0 && (
              <span className="absolute -top-3 -right-3 border-2 border-black bg-[#A3FF12] px-2 py-0.5 text-xs font-black text-black shadow-[4px_4px_0_0_#000]">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            onClick={toggleNightMode}
            className="w-32 text-center px-4 py-2 text-sm font-black uppercase tracking-widest text-[#A3FF12] bg-black border-2 border-transparent hover:border-black hover:-translate-y-1 shadow-[4px_4px_0_0_#A3FF12] hover:shadow-[6px_6px_0_0_#A3FF12] transition-all cursor-pointer"
            title="Toggle Night Mode"
          >
            {mounted ? (isDarkMode ? "☾ NIGHT" : "☀ DAY") : "☀ DAY"}
          </button>

          {!loading && !user && (
            <>
              <Link href="/login" className="px-4 py-2 text-sm font-black uppercase tracking-widest text-black border-2 border-transparent hover:border-black transition-all">
                Login
              </Link>
              <Link href="/signup" className={buttons.primary}>
                Sign Up
              </Link>
            </>
          )}

          {!loading && user && (
            <div className="flex cursor-pointer items-center gap-3 border-4 border-black px-4 py-2 bg-white shadow-[6px_6px_0_0_#000] transition-transform hover:-translate-y-1 hover:translate-x-1 hover:shadow-[10px_10px_0_0_#000] active:translate-y-0 active:translate-x-0 active:shadow-[0_0_0_0_#000]">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="h-8 w-8 rounded-none object-cover border-2 border-black"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center bg-[#A3FF12] text-black border-2 border-black text-sm font-black uppercase">
                  {(user.displayName || user.email || "U")[0].toUpperCase()}
                </div>
              )}

              <span className="max-w-[140px] truncate text-xs font-black uppercase tracking-widest text-black">{user.displayName || user.email}</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

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
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  function navLink(path: string) {
    const isActive = pathname === path;

    return `relative rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
      isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
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
        border-b border-white/10
        bg-black/60
        backdrop-blur-md
      "
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-wide transition hover:opacity-80">
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
              <span className="absolute -top-2 -right-3 rounded-full bg-[#A3FF12] px-2 py-0.5 text-xs font-bold text-black shadow-[0_0_10px_rgba(163,255,18,0.6)]">
                {cartCount}
              </span>
            )}
          </Link>

          {!loading && !user && (
            <>
              <Link href="/login" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
                Login
              </Link>
              <Link href="/signup" className={buttons.primary}>
                Sign Up
              </Link>
            </>
          )}

          {!loading && user && (
            <div className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-white/5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-white/20"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ring-1 ring-white/20">
                  {(user.displayName || user.email || "U")[0].toUpperCase()}
                </div>
              )}

              <span className="max-w-[140px] truncate text-sm opacity-80">{user.displayName || user.email}</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

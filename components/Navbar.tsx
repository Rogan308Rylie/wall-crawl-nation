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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
        <Link 
          href="/" 
          className="text-lg sm:text-2xl font-black uppercase tracking-widest text-black hover:-translate-y-1 hover:drop-shadow-[4px_4px_0_#A3FF12] transition-all"
          onClick={() => setIsMenuOpen(false)}
        >
          Wall Crawl Nation
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6">
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

        {/* Mobile menu controls */}
        <div className="flex lg:hidden items-center gap-4">
          <Link href="/cart" className="relative p-2 border-4 border-black bg-[#A3FF12] shadow-[4px_4px_0_0_#000]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.1-5.38a1 1 0 0 0-1-1.21H5.74"/></svg>
            {mounted && cartCount > 0 && (
              <span className="absolute -top-2 -right-2 border-2 border-black bg-white px-1.5 py-0.5 text-[10px] font-black text-black shadow-[2px_2px_0_0_#000]">
                {cartCount}
              </span>
            )}
          </Link>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 border-4 border-black bg-white shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all"
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden border-t-8 border-black bg-white p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          <Link 
            href="/" 
            className={navLink("/")}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/shop" 
            className={navLink("/shop")}
            onClick={() => setIsMenuOpen(false)}
          >
            Shop
          </Link>
          <Link 
            href="/cart" 
            className={navLink("/cart")}
            onClick={() => setIsMenuOpen(false)}
          >
            Cart ({cartCount})
          </Link>
          
          <button
            onClick={() => {
              toggleNightMode();
              setIsMenuOpen(false);
            }}
            className="w-full text-center py-4 text-sm font-black uppercase tracking-widest text-[#A3FF12] bg-black border-4 border-black shadow-[6px_6px_0_0_#A3FF12] transition-all"
          >
            {isDarkMode ? "☾ NIGHT MODE" : "☀ DAY MODE"}
          </button>

          {!loading && !user && (
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Link 
                href="/login" 
                className="py-4 text-center text-sm font-black uppercase tracking-widest text-black border-4 border-black bg-white shadow-[4px_4px_0_0_black]"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="py-4 text-center text-sm font-black uppercase tracking-widest text-black border-4 border-black bg-[#A3FF12] shadow-[4px_4px_0_0_black]"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}

          {!loading && user && (
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-center gap-4 border-4 border-black p-4 bg-white shadow-[6px_6px_0_0_#000]">
                 {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="h-10 w-10 border-2 border-black" />
                 ) : (
                    <div className="h-10 w-10 flex items-center justify-center bg-[#A3FF12] border-2 border-black font-black uppercase">{user.displayName?.[0] || user.email?.[0]}</div>
                 )}
                 <div className="flex-1 truncate font-black uppercase text-xs">{user.displayName || user.email}</div>
              </div>
              <button 
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="py-4 text-center text-sm font-black uppercase bg-black text-white border-4 border-black shadow-[4px_4px_0_0_#A3FF12]"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

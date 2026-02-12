"use client";

import Link from "next/link";
import { buttons } from "@/lib/ui/buttons";
import FeaturedPostersGrid from "@/components/FeaturedPostersGrid";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0d0d0d] to-black">
      {/* 1️⃣ HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-36">
        <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight max-w-4xl">
          Built for Rebels.
          <br />
          Framed for Legends.
        </h1>

        <p className="mt-6 max-w-xl text-white/60 text-base md:text-lg">
          Premium A4 wall art inspired by pop culture, individuality and rebellion.
        </p>

        <div className="mt-10 flex gap-4 flex-wrap justify-center">
          <Link href="/shop" className={buttons.primary}>
            Shop Posters
          </Link>

          <Link href="/shop" className={buttons.secondary}>
            View Collection
          </Link>
        </div>
      </section>

      {/* 2️⃣ FEATURED POSTERS SECTION */}
      <section className="px-4 sm:px-6 py-24">
        <h2 className="text-2xl md:text-3xl font-semibold mb-10">
          Featured Posters
        </h2>
        <FeaturedPostersGrid />
      </section>

      {/* 4️⃣ QUALITY / TRUST SECTION */}
      <section className="px-6 py-24">
        <div className="grid md:grid-cols-3 gap-12 text-center">
          <div>
            <h3 className="text-lg font-semibold">Premium A4 Prints</h3>
            <p className="text-white/60 text-sm mt-2">
              Designed to look sharp and bold on any wall.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Secure Payments</h3>
            <p className="text-white/60 text-sm mt-2">
              Safe checkout powered by Razorpay.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Fast Processing</h3>
            <p className="text-white/60 text-sm mt-2">
              Orders confirmed and processed quickly.
            </p>
          </div>
        </div>
      </section>

      {/* 5️⃣ FINAL CLOSING CTA */}
      <section className="px-6 py-32 text-center">
        <h2 className="text-4xl md:text-5xl font-semibold">
          Your Walls Deserve Better.
        </h2>

        <div className="mt-8">
          <Link href="/shop" className={buttons.primary}>
            Explore Posters
          </Link>
        </div>
      </section>

      {/* 6️⃣ CUSTOM DESIGNS CTA (Soft Version) */}
      <section className="px-6 py-28 text-center border-t border-white/10">
        <h2 className="text-3xl font-semibold">
          Want Something Personal?
        </h2>

        <p className="mt-4 text-white/60 text-base">
          We create custom posters tailored just for you.
        </p>

        <a
          href="https://wa.me/919306553798?text=Hi%20I%20want%20a%20custom%20poster"
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttons.primary} mt-8 inline-block`}
        >
          Chat on WhatsApp
        </a>
      </section>

      
    </main>
  );
}
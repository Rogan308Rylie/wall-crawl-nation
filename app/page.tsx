"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { buttons } from "@/lib/ui/buttons";
import FeaturedPostersGrid from "@/components/FeaturedPostersGrid";

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent">
      {/* MARQUEE TAPE TOP */}
      <div className="w-full overflow-hidden border-b-4 border-black bg-black py-3 text-[#A3FF12] flex whitespace-nowrap">
        <div className="animate-marquee text-sm font-black uppercase tracking-[0.3em] whitespace-nowrap flex">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="pr-4">
               // NO RULES // JUST ART // WALL CRAWL NATION // REDEFINING SPACES // ART WITHOUT LIMITS // DESIGNED FOR THE BOLD // CURATED COLLECTIONS // REBEL AGAINST BLANK WALLS 
            </span>
          ))}
        </div>
      </div>

      {/* 1️⃣ HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32 border-b-8 border-black bg-white bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:16px_16px]">
        <h1 className="text-6xl md:text-[8rem] font-black uppercase leading-[0.8] tracking-tighter text-black w-full break-words">
          WALL CRAWL <br />
          <span className="text-[#A3FF12] drop-shadow-[6px_6px_0_black]">NATION.</span>
        </h1>

        <p className="mt-12 max-w-2xl bg-black px-6 py-3 text-white font-bold tracking-[0.2em] uppercase border-4 border-black shadow-[8px_8px_0_0_#A3FF12]">
          Premium wall art inspired by Culture, Individuality and Expression.
        </p>

        <div className="mt-16 flex gap-6 flex-wrap justify-center">
          <Link href="/shop" className={buttons.primary}>
            Shop Posters
          </Link>

          <Link href="/shop" className={buttons.secondary}>
            View Collection
          </Link>
        </div>
      </section>
      
      {/* MARQUEE TAPE BOTTOM OF HERO */}
      <div className="w-full overflow-hidden border-b-8 border-black bg-[#A3FF12] py-4 text-black flex whitespace-nowrap">
        <div className="animate-marquee text-xl font-black uppercase tracking-[0.2em] whitespace-nowrap flex">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="pr-4">
               EXCLUSIVE PRINTS // MUSEUM QUALITY // BOLD AESTHETICS // BUILT FOR THE CULTURE // ZERO COMPROMISES // PREMIUM ARCHIVAL PAPER // OWN YOUR SPACE // TRUE EXPRESSION // ELEVATE YOUR WALLS // 
            </span>
          ))}
        </div>
      </div>

      {/* 2️⃣ FEATURED POSTERS SECTION */}
      <section className="px-4 sm:px-6 py-24 border-b-8 border-black bg-white">
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black bg-[#A3FF12] border-4 border-black inline-block px-8 py-4 shadow-[8px_8px_0_0_black] -rotate-2 relative left-1/2 -translate-x-1/2 mb-20">
          Featured Posters
        </h2>
        <FeaturedPostersGrid />
      </section>

      {/* 4️⃣ QUALITY / TRUST SECTION */}
      <section className="px-6 py-24 border-b-8 border-black bg-black">
        <div className="grid md:grid-cols-3 gap-8 text-center text-black">
          <div className="border-4 border-black p-8 bg-white shadow-[12px_12px_0_0_#A3FF12] hover:-translate-y-2 hover:translate-x-2 transition-transform">
            <h3 className="text-3xl font-black uppercase tracking-wider">Premium Prints</h3>
            <p className="font-bold mt-4 text-lg">Designed to look sharp and bold on any wall. <br /> No compromise in quality</p>
          </div>

          <div className="border-4 border-black p-8 bg-white shadow-[12px_12px_0_0_#A3FF12] hover:-translate-y-2 hover:translate-x-2 transition-transform">
            <h3 className="text-3xl font-black uppercase tracking-wider">Secure Payments</h3>
            <p className="font-bold mt-4 text-lg">Safe checkout powered by Razorpay. <br /> #SaavdhanRahenSatarkRahen</p>
          </div>

          <div className="border-4 border-black p-8 bg-white shadow-[12px_12px_0_0_#A3FF12] hover:-translate-y-2 hover:translate-x-2 transition-transform">
            <h3 className="text-3xl font-black uppercase tracking-wider">Fast Processing</h3>
            <p className="font-bold mt-4 text-lg">Orders confirmed and processed quickly <br /> Because who has the time to wait?</p>
          </div>
        </div>
      </section>

      {/* 5️⃣ FINAL CLOSING CTA */}
      <section className="px-6 py-32 text-center bg-[#A3FF12] border-b-8 border-black">
        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-black drop-shadow-[4px_4px_0_white]">
          Your Room Should Reflect Your Personality.
        </h2>

        <div className="mt-12">
          <Link href="/shop" className={buttons.primary}>
            Explore Posters
          </Link>
        </div>
      </section>

      {/* 6️⃣ CUSTOM ORDERS CTA */}
      <section className="px-6 py-28 bg-white">
        <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-center text-black bg-[#A3FF12] border-4 border-black inline-block px-8 py-4 shadow-[8px_8px_0_0_black] -rotate-2 relative left-1/2 -translate-x-1/2">
          Want Something Custom?
        </h2>

        <div className="mt-20 max-w-xl mx-auto space-y-12">
          {/* Custom Posters */}
          <div className="text-center border-4 border-black p-8 shadow-[12px_12px_0_0_#A3FF12]">
            <h3 className="text-3xl font-black uppercase">Custom Posters</h3>
            <p className="mt-4 text-black font-bold text-lg">
              We create custom posters tailored just for you. <br />  Any design, any vibe.
            </p>
            <a
              href="https://wa.me/919306553798?text=Hi%20I%20want%20a%20custom%20poster"
              target="_blank"
              rel="noopener noreferrer"
              className={`${buttons.primary} mt-8`}
            >
              Get Posters
            </a>
          </div>

          {/* Polaroids */}
          <div className="text-center border-4 border-black p-8 shadow-[12px_12px_0_0_#A3FF12]">
            <h3 className="text-3xl font-black uppercase">Polaroid Photos</h3>
            <p className="mt-4 text-black font-bold text-lg">
              Turn your memories into aesthetic polaroid-style prints.
              <br />
              Perfect for your walls, desk, or as a gift.
            </p>
            <a
              href="https://wa.me/919306553798?text=Hi%20I%20want%20some%20polaroids"
              target="_blank"
              rel="noopener noreferrer"
              className={`${buttons.primary} mt-8`}
            >
              Get Polaroids
            </a>
          </div>
        </div>
      </section>

      
    </main>
  );
}
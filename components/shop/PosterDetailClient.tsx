"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { buttons } from "@/lib/ui/buttons";
import { motion } from "framer-motion";
import { Gift, Link as LinkIcon, Smartphone, Twitter, Dices, ArrowLeft } from "lucide-react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PosterDetailClientProps {
  id: string;
  title: string;
  price: number;
  imagePath: string;
  tags?: string[];
}

export default function PosterDetailClient({
  id,
  title,
  price,
  imagePath,
  tags,
}: PosterDetailClientProps) {
  const { cart, addToCart, increaseQuantity, decreaseQuantity } = useCart();
  const cartItem = cart.find((item) => item.id === id);
  const quantity = cartItem?.quantity || 0;
  const { showToast } = useToast();
  const router = useRouter();

  const [isMobile, setIsMobile] = useState(true);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(window.matchMedia("(hover: none)").matches);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const normalizedX = (mouseX / width) - 0.5;
    const normalizedY = (mouseY / height) - 0.5;

    const rotateX = -normalizedY * 20; // 10deg max tilt
    const rotateY = normalizedX * 20;

    const mx = `${width - mouseX}px`;
    const my = `${height - mouseY}px`;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      transition: "none",
      ["--mx" as any]: mx,
      ["--my" as any]: my,
    });
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
      transition: "transform 400ms ease-out",
    });
  };

  const handleSurpriseMe = async () => {
    try {
      const q = query(collection(db, "posters"), limit(50));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const randomDoc = snapshot.docs[Math.floor(Math.random() * snapshot.docs.length)];
        router.push(`/shop/${randomDoc.id}`);
      }
    } catch (error) {
      console.error("Error fetching random poster:", error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Link copied to clipboard!", "success");
  };

  const shareText = `Check out this awesome poster: ${title}`;

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + window.location.href)}`, "_blank");
  };

  const handleTwitterShare = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="px-4 sm:px-6 py-6 border-b-4 border-black bg-[#A3FF12]">
        <Link href="/shop" className="inline-flex items-center gap-2 font-black uppercase text-black hover:translate-x-[-4px] transition-transform">
          <ArrowLeft strokeWidth={3} /> Back to Shop
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Interactive Poster Image Section */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={isMobile ? undefined : tiltStyle}
              className="relative aspect-[210/297] w-full max-w-[500px] mx-auto border-[6px] border-black bg-[#f0f0f0] shadow-[16px_16px_0_0_#000] overflow-hidden group"
            >
              <Image
                src={imagePath || "/placeholder.jpg"}
                alt={title}
                fill
                priority
                unoptimized={true}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-4 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-[1.08] pointer-events-none select-none"
                style={{ WebkitUserDrag: "none" } as React.CSSProperties}
              />
              

            </motion.div>

            {/* Surprise Me CTA */}
            <div className="max-w-[500px] mx-auto w-full mt-4">
              <button
                onClick={handleSurpriseMe}
                className={`${buttons.secondary} w-full text-lg py-4 flex items-center justify-center gap-3 bg-black text-[#A3FF12] border-4 border-black shadow-[6px_6px_0_0_#A3FF12] hover:bg-[#A3FF12] hover:text-black hover:shadow-[6px_6px_0_0_#000] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all`}
              >
                <Dices className="w-6 h-6" /> Surprise me with another
              </button>
            </div>
          </div>

          {/* Details Section */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-1/2 flex flex-col gap-8"
          >
            <div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-black leading-[0.9] mb-6">
                {title}
              </h1>

              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-3xl md:text-5xl font-black text-black bg-[#A3FF12] px-6 py-2 border-4 border-black shadow-[6px_6px_0_0_#000]">
                  ₹{price}
                </span>
                <span className="text-sm md:text-lg font-black uppercase tracking-widest text-white bg-black px-4 py-2 border-4 border-black">
                  Premium Print
                </span>
              </div>
            </div>

            {tags && tags.length > 0 && (
              <div>
                <h3 className="text-sm font-black uppercase text-black mb-3 tracking-widest border-b-4 border-black inline-block pb-1">Vibe & Categories</h3>
                <div className="flex gap-2 flex-wrap">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="border-4 border-black px-4 py-1.5 text-sm font-black uppercase text-black bg-white hover:bg-[#A3FF12] transition-colors cursor-default shadow-[2px_2px_0_0_#000]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-4 border-black p-6 bg-[#f9f9f9] shadow-[8px_8px_0_0_#A3FF12]">
              <h4 className="font-black uppercase text-lg mb-4 text-black underline decoration-4 decoration-black">Product Details</h4>
              <ul className="text-sm md:text-base font-bold text-black/80 space-y-3">
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-black"></div> High-quality archival ink on 300GSM paper</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-black"></div> Matte finish for zero glare</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-black"></div> Precise A4 dimensions (210 × 297 mm)</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-black"></div> Securely shipped in protective packaging</li>
              </ul>
            </div>

            {/* Add to Cart Actions */}
            <div className="mt-4">
              {quantity === 0 ? (
                <button
                  onClick={() => addToCart({ type: "poster", id, title, price, imagePath, tags })}
                  className={`${buttons.primary} w-full text-2xl py-6 shadow-[8px_8px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all`}
                >
                  ADD TO CART
                </button>
              ) : (
                <div className="flex items-center justify-between gap-4 border-4 border-black bg-white p-3 shadow-[8px_8px_0_0_#000]">
                  <button
                    onClick={() => decreaseQuantity(id)}
                    className="h-16 w-16 flex items-center justify-center border-4 border-black bg-[#A3FF12] text-black font-black text-3xl hover:bg-black hover:text-[#A3FF12] transition-colors"
                  >
                    −
                  </button>

                  <div className="flex flex-col items-center">
                    <span className="text-xs font-black uppercase text-black/40">In Cart</span>
                    <span className="text-5xl font-black text-black leading-none">
                      {quantity}
                    </span>
                  </div>

                  <button
                    onClick={() => increaseQuantity(id)}
                    className="h-16 w-16 flex items-center justify-center border-4 border-black bg-[#A3FF12] text-black font-black text-3xl hover:bg-black hover:text-[#A3FF12] transition-colors"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* Share Section */}
            <div className="mt-8 pt-8 border-t-8 border-black">
              <h4 className="font-black uppercase text-sm mb-4 text-black flex items-center gap-2">
                Ask someone to gift this to you <Gift className="w-5 h-5" />
              </h4>
              <div className="flex gap-4">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-2 border-4 border-black bg-white hover:bg-[#A3FF12] text-black font-black uppercase text-sm py-4 shadow-[4px_4px_0_0_#000] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
                >
                  <LinkIcon className="w-5 h-5" /> Copy Link
                </button>
                <button
                  onClick={handleWhatsAppShare}
                  className="flex-1 flex items-center justify-center gap-2 border-4 border-black bg-[#A3FF12] hover:bg-black hover:text-[#A3FF12] text-black font-black uppercase text-sm py-4 shadow-[4px_4px_0_0_#000] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
                >
                  <Smartphone className="w-5 h-5" /> WhatsApp
                </button>
                <button
                  onClick={handleTwitterShare}
                  className="flex-1 flex items-center justify-center gap-2 border-4 border-black bg-black text-white hover:text-[#A3FF12] font-black uppercase text-sm py-4 shadow-[4px_4px_0_0_#000] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
                >
                  <Twitter className="w-5 h-5 fill-current" /> Twitter
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}

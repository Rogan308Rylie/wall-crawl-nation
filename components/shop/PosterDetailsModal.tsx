"use client";

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/context/CartContext"
import { useToast } from "@/context/ToastContext"
import { buttons } from "@/lib/ui/buttons"
import { motion, AnimatePresence } from "framer-motion"
import { X, Gift, Link as LinkIcon, Smartphone, Twitter, Dices } from "lucide-react"
import { collection, getDocs, query, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useRouter, useSearchParams } from "next/navigation"

interface PosterDetailsModalProps {
  id: string;
  title: string;
  price: number;
  imagePath: string;
  tags?: string[];
  isOpen: boolean;
  onClose: () => void;
  prevPosterId?: string;
  nextPosterId?: string;
}

export default function PosterDetailsModal({
  id,
  title,
  price,
  imagePath,
  tags,
  isOpen,
  onClose,
  prevPosterId,
  nextPosterId
}: PosterDetailsModalProps) {
  const { cart, addToCart, increaseQuantity, decreaseQuantity } = useCart()
  const cartItem = cart.find((item) => item.id === id)
  const quantity = cartItem?.quantity || 0
  const [mounted, setMounted] = useState(false)
  const { showToast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSurpriseMe = async () => {
    try {
      const q = query(collection(db, "posters"), limit(50));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const randomDoc = snapshot.docs[Math.floor(Math.random() * snapshot.docs.length)];
        const params = new URLSearchParams(searchParams.toString());
        params.set("poster", randomDoc.id);
        router.push(`?${params.toString()}`, { scroll: false });
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

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // Calculate scrollbar width to prevent layout shift when scroll is locked
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white border-[6px] md:border-8 border-black w-[95vw] max-w-5xl max-h-[95vh] p-3 md:p-5 relative shadow-[12px_12px_0_0_#A3FF12] md:shadow-[20px_20px_0_0_#A3FF12] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-2xl md:text-3xl text-black hover:text-[#A3FF12] transition font-black hover:rotate-90 z-30"
              aria-label="Close details"
            >
              <X className="w-8 h-8" strokeWidth={3} />
            </button>

            {/* Navigation Arrows */}
            {prevPosterId && (
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("poster", prevPosterId);
                  router.push(`?${params.toString()}`, { scroll: false });
                }}
                className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 bg-black text-[#A3FF12] p-2 border-4 border-black hover:bg-[#A3FF12] hover:text-black hover:scale-110 transition-all z-20 shadow-[4px_4px_0_0_#000] hidden sm:block"
                aria-label="Previous Poster"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
            )}

            {nextPosterId && (
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("poster", nextPosterId);
                  router.push(`?${params.toString()}`, { scroll: false });
                }}
                className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 bg-black text-[#A3FF12] p-2 border-4 border-black hover:bg-[#A3FF12] hover:text-black hover:scale-110 transition-all z-20 shadow-[4px_4px_0_0_#000] hidden sm:block"
                aria-label="Next Poster"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            )}
            {/* Content with Transition */}
            <AnimatePresence mode="wait">
              <motion.div
                key={id}
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-4 md:gap-6 h-full overflow-y-auto overflow-x-hidden p-1 mt-2 relative"
              >
                {/* Poster Image Area */}
              <div className="flex flex-col gap-4">
                <div className="relative aspect-[210/297] w-[85%] md:w-[75%] max-w-[320px] mx-auto border-4 border-black bg-[#f0f0f0] shadow-[8px_8px_0_0_#000] overflow-hidden group">
                  <Image
                    src={imagePath || "/placeholder.jpg"}
                    alt={title}
                    fill
                    priority
                    unoptimized={true}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain p-2 drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
                    style={{ WebkitUserDrag: "none" } as React.CSSProperties}
                  />
                  {/* Transparent protection overlay */}
                  <div
                    className="absolute inset-0 z-10"
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>

                {/* Surprise Me Button (Full size) */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleSurpriseMe}
                    className={`${buttons.secondary} w-full`}
                  >
                    <Dices className="w-6 h-6" /> Surprise me
                  </button>

                  {/* Mobile Navigation Arrows */}
                  <div className="flex sm:hidden w-full gap-4">
                    {prevPosterId && (
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(searchParams.toString());
                          params.set("poster", prevPosterId);
                          router.push(`?${params.toString()}`, { scroll: false });
                        }}
                        className="flex-1 flex items-center justify-center bg-black text-[#A3FF12] py-2 border-4 border-black hover:bg-[#A3FF12] hover:text-black transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                      </button>
                    )}
                    {nextPosterId && (
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(searchParams.toString());
                          params.set("poster", nextPosterId);
                          router.push(`?${params.toString()}`, { scroll: false });
                        }}
                        className="flex-1 flex items-center justify-center bg-black text-[#A3FF12] py-2 border-4 border-black hover:bg-[#A3FF12] hover:text-black transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Poster Info */}
              <div className="flex flex-col justify-start pt-2 pr-2 pb-2">
                <div className="flex flex-col items-start mb-2 md:mb-4 pr-12 md:pr-16">
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#A3FF12] bg-black px-2 py-1 mb-2 inline-block">
                    Quick View
                  </span>
                  <h2 className="text-2xl md:text-4xl font-black uppercase text-black leading-none tracking-tight">
                    {title}
                  </h2>
                  <Link href={`/shop/${id}`} className="mt-3 text-xs md:text-sm font-black uppercase text-black underline decoration-4 decoration-[#A3FF12] hover:text-[#A3FF12] hover:bg-black hover:no-underline px-2 py-1 transition-all">
                    Go to detail view &rarr;
                  </Link>
                </div>

                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <span className="text-xl md:text-3xl font-black text-black bg-[#A3FF12] px-3 py-1.5 md:py-2 border-4 border-black shadow-[4px_4px_0_0_#000]">
                    ₹{price}
                  </span>
                  <span className="text-xs md:text-sm font-black uppercase text-black border-4 border-black px-2 md:px-3 py-1 bg-white">
                    Premium Print
                  </span>
                </div>

                {tags && tags.length > 0 && (
                  <div className="mb-4 md:mb-6">
                    <h3 className="text-[10px] md:text-xs font-black uppercase text-black/40 mb-2 tracking-widest">Tags / Categories</h3>
                    <div className="flex gap-1.5 md:gap-2 flex-wrap">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="border-2 border-black px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-black uppercase text-black bg-white hover:bg-[#A3FF12] transition-colors cursor-default"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3 md:space-y-4">
                  <div className="border-4 border-black p-3 md:p-4 bg-[#f9f9f9]">
                    <h4 className="font-black uppercase text-xs md:text-sm mb-1.5 md:mb-2 text-black underline decoration-4 decoration-[#A3FF12]">Product Details</h4>
                    <ul className="text-[10px] md:text-xs font-bold text-black/80 space-y-0.5 md:space-y-1">
                      <li>• High-quality archival ink on 300GSM paper</li>
                      <li>• Matte finish for zero glare</li>
                      <li>• Precise A4 dimensions (210 × 297 mm)</li>
                      <li>• Securely shipped in protective packaging</li>
                    </ul>
                  </div>

                  {/* Quantity and Cart Actions */}
                  {quantity === 0 ? (
                    <button
                      onClick={() => addToCart({ type: "poster", id, title, price, imagePath, tags })}
                      className={`${buttons.primary} w-full text-lg md:text-xl py-2.5 md:py-3 shadow-[6px_6px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all`}
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <div className="flex items-center justify-between gap-3 border-4 md:border-6 border-black bg-white p-2 md:p-3 shadow-[6px_6px_0_0_#000]">
                      <button
                        onClick={() => decreaseQuantity(id)}
                        className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center border-4 border-black bg-[#A3FF12] text-black font-black text-xl md:text-2xl hover:bg-black hover:text-[#A3FF12] transition-colors"
                      >
                        −
                      </button>

                      <div className="flex flex-col items-center">
                        <span className="text-[10px] md:text-xs font-black uppercase text-black/40">In Cart</span>
                        <span className="text-2xl md:text-3xl font-black text-black leading-none">
                          {quantity}
                        </span>
                      </div>

                      <button
                        onClick={() => increaseQuantity(id)}
                        className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center border-4 border-black bg-[#A3FF12] text-black font-black text-xl md:text-2xl hover:bg-black hover:text-[#A3FF12] transition-colors"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>

                {/* Share Section moved below cart */}
                <div className="mt-4 pt-4 border-t-4 border-black/10">
                  <h4 className="font-black uppercase text-[10px] md:text-xs mb-2 text-black/60 flex items-center gap-2">
                    Ask someone to gift this to you <Gift className="w-3 h-3" />
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="flex-1 flex items-center justify-center gap-1.5 border-2 border-black bg-white hover:bg-[#A3FF12] text-black font-black uppercase text-[10px] py-2 shadow-[2px_2px_0_0_#000] active:translate-y-px active:translate-x-px active:shadow-none transition-all"
                    >
                      <LinkIcon className="w-3.5 h-3.5" /> <span className="hidden lg:inline">Copy Link</span><span className="lg:hidden">Copy</span>
                    </button>
                    <button
                      onClick={handleWhatsAppShare}
                      className="flex-1 flex items-center justify-center gap-1.5 border-2 border-black bg-[#A3FF12] hover:bg-black hover:text-[#A3FF12] text-black font-black uppercase text-[10px] py-2 shadow-[2px_2px_0_0_#000] active:translate-y-px active:translate-x-px active:shadow-none transition-all"
                    >
                      <Smartphone className="w-3.5 h-3.5" /> <span className="hidden lg:inline">WhatsApp</span><span className="lg:hidden">WA</span>
                    </button>
                    <button
                      onClick={handleTwitterShare}
                      className="flex-1 flex items-center justify-center gap-1.5 border-2 border-black bg-black text-white hover:text-[#A3FF12] font-black uppercase text-[10px] py-2 shadow-[2px_2px_0_0_#000] active:translate-y-px active:translate-x-px active:shadow-none transition-all"
                    >
                      <Twitter className="w-3.5 h-3.5 fill-current" /> <span className="hidden lg:inline">Twitter</span><span className="lg:hidden">X</span>
                    </button>
                  </div>
                </div>
              </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

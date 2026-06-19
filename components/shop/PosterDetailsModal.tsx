"use client";

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { useCart } from "@/context/CartContext"
import { buttons } from "@/lib/ui/buttons"
import { motion, AnimatePresence } from "framer-motion"

interface PosterDetailsModalProps {
  id: string;
  title: string;
  price: number;
  imagePath: string;
  tags?: string[];
  isOpen: boolean;
  onClose: () => void;
}

export default function PosterDetailsModal({
  id,
  title,
  price,
  imagePath,
  tags,
  isOpen,
  onClose
}: PosterDetailsModalProps) {
  const { cart, addToCart, increaseQuantity, decreaseQuantity } = useCart()
  const cartItem = cart.find((item) => item.id === id)
  const quantity = cartItem?.quantity || 0
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

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
            className="bg-white border-8 border-black w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-10 relative shadow-[20px_20px_0_0_#A3FF12]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 md:right-8 md:top-8 text-3xl md:text-4xl text-black hover:text-[#A3FF12] transition font-black hover:rotate-90"
              aria-label="Close details"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-8 md:mt-0">
              {/* Poster Image */}
              <div className="relative aspect-[210/297] border-4 border-black bg-[#f0f0f0] shadow-[12px_12px_0_0_#000] overflow-hidden group">
                <Image
                  src={imagePath || "/placeholder.jpg"}
                  alt={title}
                  fill
                  unoptimized
                  className="object-contain p-2 drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
                  style={{ WebkitUserDrag: "none" } as React.CSSProperties}
                />
                {/* Transparent protection overlay — blocks right-click, drag, and long-press save */}
                <div
                  className="absolute inset-0 z-10"
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                />
              </div>

              {/* Poster Info */}
              <div className="flex flex-col justify-center">
                <h2 className="text-3xl md:text-5xl font-black uppercase text-black leading-none tracking-tight mb-4">
                  {title}
                </h2>

                <div className="flex items-center gap-4 mb-8">
                  <span className="text-2xl md:text-4xl font-black text-black bg-[#A3FF12] px-4 py-2 border-4 border-black shadow-[6px_6px_0_0_#000]">
                    ₹{price}
                  </span>
                  <span className="text-sm md:text-base font-black uppercase text-black border-4 border-black px-3 py-1 bg-white">
                    Premium Print
                  </span>
                </div>

                {tags && tags.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-xs font-black uppercase text-black/40 mb-3 tracking-widest">Tags / Categories</h3>
                    <div className="flex gap-2 flex-wrap">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="border-2 border-black px-3 py-1 text-xs md:text-sm font-black uppercase text-black bg-white hover:bg-[#A3FF12] transition-colors cursor-default"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="border-4 border-black p-4 bg-[#f9f9f9]">
                    <h4 className="font-black uppercase text-sm mb-2 text-black underline decoration-4 decoration-[#A3FF12]">Product Details</h4>
                    <ul className="text-xs md:text-sm font-bold text-black/80 space-y-1">
                      <li>• High-quality archival ink on 300GSM paper</li>
                      <li>• Matte finish for zero glare</li>
                      <li>• Precise A4 dimensions (210 × 297 mm)</li>
                      <li>• Securely shipped in protective packaging</li>
                    </ul>
                  </div>

                  {/* Quantity and Cart Actions */}
                  {quantity === 0 ? (
                    <button
                      onClick={() => addToCart({ type: "poster", id, title, price, imagePath })}
                      className={`${buttons.primary} w-full text-xl py-4 shadow-[8px_8px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all`}
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <div className="flex items-center justify-between gap-4 border-6 border-black bg-white p-3 shadow-[8px_8px_0_0_#000]">
                      <button
                        onClick={() => decreaseQuantity(id)}
                        className="h-12 w-12 flex items-center justify-center border-4 border-black bg-[#A3FF12] text-black font-black text-2xl hover:bg-black hover:text-[#A3FF12] transition-colors"
                      >
                        −
                      </button>

                      <div className="flex flex-col items-center">
                        <span className="text-xs font-black uppercase text-black/40">In Cart</span>
                        <span className="text-3xl font-black text-black leading-none">
                          {quantity}
                        </span>
                      </div>

                      <button
                        onClick={() => increaseQuantity(id)}
                        className="h-12 w-12 flex items-center justify-center border-4 border-black bg-[#A3FF12] text-black font-black text-2xl hover:bg-black hover:text-[#A3FF12] transition-colors"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

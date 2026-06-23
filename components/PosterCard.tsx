"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { buttons } from "@/lib/ui/buttons";
import PosterDetailsModal from "./shop/PosterDetailsModal";

type PosterCardProps = {
  id: string;
  title: string;
  price: number;
  imagePath: string;
  tags?: string[];
};

export default function PosterCard({
  id,
  title,
  price,
  imagePath,
  tags,
}: PosterCardProps) {
  const { cart, addToCart, increaseQuantity, decreaseQuantity } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const cardRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const cartItem = cart.find((item) => item.id === id);
  const quantity = cartItem?.quantity || 0;

  useEffect(() => {
    if (searchParams.get("poster") === id) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [searchParams, id]);

  const openModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("poster", id);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("poster");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    setIsMobile(window.matchMedia("(hover: none)").matches);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !cardRef.current) return;

    const target = e.target as HTMLElement;
    const isOverCTA = target.closest('.card-cta-container') || target.tagName === 'BUTTON';

    if (isOverCTA) {
      // Reset tilt and specular when hovering CTA controls
      setTiltStyle({
        transform: "perspective(600px) rotateX(0deg) rotateY(0deg)",
        transition: "transform 200ms ease-out",
        ["--mx" as any]: "50%",
        ["--my" as any]: "50%",
      });
      return;
    }

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const normalizedX = (mouseX / width) - 0.5;
    const normalizedY = (mouseY / height) - 0.5;

    // Max tilt = 8deg on each axis
    const rotateX = -normalizedY * 16;
    const rotateY = normalizedX * 16;

    // specular highlight shifts opposite to the tilt direction
    const mx = `${width - mouseX}px`;
    const my = `${height - mouseY}px`;

    setTiltStyle({
      transform: `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      transition: "none",
      ["--mx" as any]: mx,
      ["--my" as any]: my,
    });
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setTiltStyle({
      transform: "perspective(600px) rotateX(0deg) rotateY(0deg)",
      transition: "transform 400ms ease-out",
    });
  };

  return (
    <>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={isMobile ? undefined : tiltStyle}
        className={`
          group
          relative
          flex
          flex-col
          gap-3
          border-4
          border-black
          bg-white
          p-3
          shadow-[6px_6px_0_0_#A3FF12]
          ${isMobile
            ? "poster-card-mobile-tap transition-all duration-200 active:scale-[1.02]"
            : "transition-transform duration-200"
          }
        `}
      >
        {/* Poster frame */}
        <div
          onClick={openModal}
          data-cursor="poster"
          className="
      relative
      w-full
      aspect-[210/297]
      bg-[#f0f0f0]
      flex
      items-center
      justify-center
      overflow-hidden
      border-4
      border-black
      cursor-zoom-in
    "
        >
          <Image
            src={imagePath || "/placeholder.jpg"}
            alt={title || "Poster image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 300px"
            className="
      object-contain
      transition-transform
      duration-500
      group-hover:scale-105
      drop-shadow-[0_15px_30px_rgba(0,0,0,0.3)]
      pointer-events-none
      select-none
    "
            style={{ WebkitUserDrag: "none" } as React.CSSProperties}
          />

          {/* Transparent protection overlay - blocks right-click, drag, and long-press save */}
          <div
            className="absolute inset-0 z-20"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />

          {/* Specular light highlight overlay */}
          {!isMobile && (
            <div
              className="absolute inset-0 pointer-events-none z-30 overflow-hidden"
              style={{
                background: "radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.08), transparent 60%)",
              }}
            />
          )}

          {/* Overlay to hint interaction */}
          <div className="absolute inset-0 z-10 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="bg-white border-2 border-black px-3 py-1 text-[10px] font-black uppercase text-black transform rotate-2">
              Detail view
            </span>
          </div>
        </div>

        <div onClick={openModal} data-cursor="poster" className="cursor-pointer group/info">
          <div className="flex items-start justify-between gap-1">
            <h3 className={`flex-1 ${title.length > 25 ? "text-[10px] sm:text-xs" :
                title.length > 15 ? "text-xs sm:text-sm" :
                  "text-sm sm:text-base"
              } font-black uppercase leading-tight tracking-wider text-black group-hover/info:text-black break-words`}>
              {title}
            </h3>
            <span className="shrink-0 text-xs sm:text-sm font-black text-black bg-[#A3FF12] border-2 border-black px-1.5 shadow-[2px_2px_0_0_#000]">
              ₹{price}
            </span>
          </div>
        </div>

        {/* CTA - Morphs between Add to Cart and Quantity Controls */}
        {quantity === 0 ? (
          <button
            onClick={() => addToCart({ type: "poster", id, title, price, imagePath })}
            className={`${buttons.primary} card-cta-container mt-auto w-full text-[10px] sm:text-xs py-1.5 sm:py-2 whitespace-nowrap shadow-[4px_4px_0_0_#000] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all`}
          >
            Add to Cart
          </button>
        ) : (
          <div className="card-cta-container mt-auto flex items-center justify-between gap-2 border-4 border-black bg-white p-1 shadow-[4px_4px_0_0_#000]">
            <button
              onClick={() => decreaseQuantity(id)}
              className="h-7 w-7 flex items-center justify-center border-2 border-black bg-[#A3FF12] text-black font-black text-sm hover:bg-black hover:text-[#A3FF12] transition-colors"
            >
              −
            </button>

            <span
              key={quantity}
              className="flex-1 text-center text-sm font-black text-black animate-pop"
            >
              {quantity}
            </span>

            <button
              onClick={() => increaseQuantity(id)}
              className="h-7 w-7 flex items-center justify-center border-2 border-black bg-[#A3FF12] text-black font-black text-sm hover:bg-black hover:text-[#A3FF12] transition-colors"
            >
              +
            </button>
          </div>
        )}
      </div>

      <PosterDetailsModal
        id={id}
        title={title}
        price={price}
        imagePath={imagePath}
        tags={tags}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}

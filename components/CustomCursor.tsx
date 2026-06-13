"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const [cursorType, setCursorType] = useState<"default" | "hover" | "poster">("default");
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  const cursorRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Check if mobile / touch device
    const mediaQuery = window.matchMedia("(hover: none)");
    setIsMobile(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  useEffect(() => {
    if (isMobile) return;

    // Show cursor when mouse moves
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeaveWindow = () => {
      setIsVisible(false);
    };

    const handleMouseEnterWindow = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeaveWindow);
    document.addEventListener("mouseenter", handleMouseEnterWindow);

    // Event delegation for cursor types
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const hoverElement = target.closest('a, button, [role="button"], input[type="submit"], input[type="button"], select, label[for], .cursor-pointer, [data-cursor="hover"]');
      const posterCard = target.closest('[data-cursor="poster"]');

      if (hoverElement) {
        setCursorType("hover");
      } else if (posterCard) {
        setCursorType("poster");
      } else {
        setCursorType("default");
      }
    };

    document.addEventListener("mouseover", handleMouseOver);

    // Smooth movement loop using RAF
    const updatePosition = () => {
      // 0.3 lerp factor gives extremely responsive, fluid yet smooth movement (snappy, not sluggish)
      const lerpFactor = 0.3;
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * lerpFactor;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * lerpFactor;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      rafId.current = requestAnimationFrame(updatePosition);
    };

    rafId.current = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeaveWindow);
      document.removeEventListener("mouseenter", handleMouseEnterWindow);
      document.removeEventListener("mouseover", handleMouseOver);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isMobile, isVisible]);

  if (isMobile) return null;

  // Sizes:
  // default: 12px (w-3 h-3)
  // hover: 28px (w-7 h-7)
  // poster: 50px (w-[50px] h-[50px])
  let sizeClass = "w-3 h-3";
  if (cursorType === "hover") sizeClass = "w-7 h-7";
  if (cursorType === "poster") sizeClass = "w-[50px] h-[50px]";

  return (
    <div
      ref={cursorRef}
      className={`fixed top-0 left-0 pointer-events-none z-[9999] rounded-full bg-white mix-blend-difference flex items-center justify-center -translate-x-1/2 -translate-y-1/2 ${sizeClass} ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        transitionProperty: "width, height, opacity",
        transitionDuration: "200ms",
        transitionTimingFunction: "ease-out",
      }}
    >
      {cursorType === "poster" && (
        <span className="text-[10px] font-black tracking-widest text-black select-none uppercase animate-pop pointer-events-none">
          VIEW
        </span>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SecretCodes() {
  const [isBatman, setIsBatman] = useState(false);
  const [isThanos, setIsThanos] = useState(false);
  const bufferRef = useRef<string>("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      bufferRef.current += e.key.toUpperCase();
      if (bufferRef.current.length > 10) {
        bufferRef.current = bufferRef.current.slice(-10);
      }

      // Check for BATMAN
      if (bufferRef.current.endsWith("BATMAN")) {
        setIsBatman(true);
        setTimeout(() => setIsBatman(false), 3000);
        bufferRef.current = ""; // Reset buffer
      }

      // Check for THANOS
      if (bufferRef.current.endsWith("THANOS")) {
        setIsThanos(true);
        setTimeout(() => setIsThanos(false), 2000); // Gauntlet disappears after 2s

        // Delay the dust effect until after the snap (1 second delay)
        setTimeout(() => {
          const posters = document.querySelectorAll('.poster-card');
          const posterArray = Array.from(posters);
          
          // Randomly sort and pick half
          posterArray.sort(() => Math.random() - 0.5);
          const half = Math.floor(posterArray.length / 2);
          
          for (let i = 0; i < half; i++) {
            const el = posterArray[i] as HTMLElement;
            // Apply snap effect
            el.style.transition = "all 2s cubic-bezier(0.25, 0.1, 0.25, 1)";
            el.style.filter = "blur(10px) grayscale(100%) opacity(0%)";
            el.style.transform = "scale(0.8) translateY(-40px)";
            
            // Reset after 5 seconds
            setTimeout(() => {
              el.style.transition = "all 1s cubic-bezier(0.25, 0.1, 0.25, 1)";
              el.style.filter = "none";
              el.style.transform = "none";
              
              // Clean up inline styles after transition
              setTimeout(() => {
                el.style.transition = "";
                el.style.filter = "";
                el.style.transform = "";
              }, 1000);
            }, 5000);
          }
        }, 1000);

        bufferRef.current = ""; // Reset buffer
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {isBatman && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center pointer-events-none"
        >
            {/* Simple Bat-Signal */}
            <svg
              viewBox="0 0 100 100"
              className="w-64 h-64 sm:w-96 sm:h-96 fill-black drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] z-10"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse cx="50" cy="50" rx="45" ry="25" fill="#FCE205" />
              <path d="M 50 35 L 53 45 L 60 40 C 65 40 75 45 80 50 C 75 60 60 65 50 65 C 40 65 25 60 20 50 C 25 45 35 40 40 40 L 47 45 Z" fill="black"/>
              <path d="M 48 25 L 48 35 L 52 35 L 52 25 Z" fill="black" />
            </svg>
        </motion.div>
      )}

      {isThanos && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none bg-black/40"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1, 1] }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="w-[160px] h-[160px] sm:w-[240px] sm:h-[240px] relative drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]">
              <style>
                {`
                  .thanos-sprite {
                    width: 80px;
                    height: 80px;
                    background-image: url('/assets/thanos_snap.png');
                    background-repeat: no-repeat;
                    background-position: left center;
                    animation: playSnap 2.5s steps(47) forwards;
                    transform: scale(2);
                    transform-origin: top left;
                  }
                  @media (min-width: 640px) {
                    .thanos-sprite {
                      transform: scale(3);
                    }
                  }
                  @keyframes playSnap {
                    0% { background-position: 0 center; }
                    100% { background-position: -3760px center; }
                  }
                `}
              </style>
              <div className="thanos-sprite" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

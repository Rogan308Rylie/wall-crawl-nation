"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { PartyPopper } from "lucide-react";

export default function ThankYouPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(20);
  const [orderSummary, setOrderSummary] = useState<any[]>([]);
  const [isDestructing, setIsDestructing] = useState(false);

  useEffect(() => {
    // Read the order summary from session storage
    const stored = sessionStorage.getItem("lastOrderSummary");
    if (stored) {
      try {
        setOrderSummary(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to parse order summary");
      }
    }
  }, []);

  useEffect(() => {
    if (countdown <= 0 && !isDestructing) {
      setIsDestructing(true);
      // Wait for animation to finish before redirecting
      setTimeout(() => {
        sessionStorage.removeItem("lastOrderSummary");
        router.push("/");
      }, 1500); // 1.5 seconds for explosion animation
      return;
    }

    if (!isDestructing) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown, isDestructing, router]);

  const totalAmount = orderSummary.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <AnimatePresence>
        {isDestructing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0, 1, 1], backgroundColor: ["#ff0000", "#ffffff", "#000000", "#ffffff"] }}
            transition={{ duration: 1.5, times: [0, 0.2, 0.4, 0.8, 1] }}
            className="fixed inset-0 z-50 pointer-events-none mix-blend-exclusion"
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={isDestructing ? {
          x: [0, -30, 30, -30, 30, -40, 40, 0],
          y: [0, 30, -30, 30, -30, 40, -40, 0],
          scale: [1, 1.05, 1.1, 1.15, 1.2, 4, 0],
          opacity: [1, 1, 1, 1, 1, 0, 0],
          filter: [
            "contrast(100%)",
            "contrast(200%) invert(100%)",
            "contrast(300%) invert(0%)",
            "contrast(400%) invert(100%)",
            "blur(5px) brightness(200%)",
            "blur(20px) brightness(500%)",
            "blur(50px) brightness(1000%)"
          ]
        } : {}}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 relative z-10 overflow-hidden"
      >
        <div className="border-8 border-black p-8 sm:p-12 bg-white shadow-[16px_16px_0_0_#A3FF12] max-w-3xl w-full">
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-4xl sm:text-5xl font-black uppercase text-black tracking-tighter">Payment Successful</h1>
            <button
              onClick={() => {
                confetti({
                  particleCount: 150,
                  spread: 100,
                  origin: { y: 0.6 },
                  colors: ['#A3FF12', '#000000', '#FFFFFF']
                });
              }}
              className="p-2 border-4 border-black bg-[#A3FF12] hover:bg-black hover:text-[#A3FF12] transition-colors shadow-[4px_4px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
              title="Celebrate!"
            >
              <PartyPopper className="w-8 h-8 md:w-10 md:h-10" strokeWidth={3} />
            </button>
          </div>

          <p className="text-xl font-bold text-black uppercase mb-8">
            Here is what you ordered....
          </p>

          {orderSummary.length > 0 && (
            <div className="mb-8 space-y-4">
              {orderSummary.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#f0f0f0] p-4 border-4 border-black gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-12 border-2 border-black bg-white overflow-hidden hidden sm:block">
                      <Image
                        src={(item.type === "poster" ? item.imagePath : item.coverImage) || "/placeholder.jpg"}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="font-bold uppercase text-black">
                      {item.title} × {item.quantity}
                    </span>
                  </div>
                  <span className="font-black text-xl text-black bg-[#A3FF12] px-2 py-1 border-2 border-black self-end sm:self-auto">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
              <div className="border-t-8 border-black pt-6 flex justify-between font-black text-2xl uppercase text-black items-center mt-6">
                <span>Total</span>
                <span className="text-[#A3FF12] bg-black px-4 py-2 drop-shadow-[4px_4px_0_#A3FF12]">₹{totalAmount}</span>
              </div>
            </div>
          )}

          <div className="border-4 border-black p-4 sm:p-6 bg-[#f0f0f0] text-center shadow-[8px_8px_0_0_#000] mt-8">
            <p className="text-lg sm:text-xl font-bold text-black uppercase animate-pulse">
              You can now leave this page or it will self destruct in{" "}
              <span className={`px-3 py-1 text-2xl inline-block ${isDestructing ? 'bg-red-600 text-white animate-bounce' : 'bg-black text-[#A3FF12]'}`}>
                {isDestructing ? "BOOM!" : countdown}
              </span>
              {" "}seconds
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

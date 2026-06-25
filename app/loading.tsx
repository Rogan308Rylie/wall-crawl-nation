"use client";

import { useEffect, useState } from "react";

const LOADING_PHRASES = [
  "Assembling the Avengers...",
  "Warming up the DeLorean (Requires 1.21 Gigawatts)...",
  "Hacking into the Matrix...",
  "Waiting for Goku to finish charging his attack...",
  "Waiting for Rizul to fix the servers...",
  "Downloading more RAM...",
];

export default function Loading() {
  const [phrase, setPhrase] = useState(LOADING_PHRASES[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhrase(LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);
    }, 2000); // Change phrase every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6">
      <div className="border-4 border-black bg-white p-8 shadow-[12px_12px_0_0_#A3FF12] text-center max-w-lg w-full">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 border-8 border-[#f0f0f0] border-t-[#A3FF12] border-r-black rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl sm:text-2xl font-black uppercase text-black animate-pulse">
          {phrase}
        </h2>
      </div>
    </div>
  );
}

"use client";

import { Skull } from "lucide-react";

export default function SelfDestructButton() {
  const handleSelfDestruct = () => {
    window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
  };

  return (
    <button
      onClick={handleSelfDestruct}
      className="fixed bottom-6 right-6 z-50 bg-red-600 text-white font-black text-sm uppercase tracking-tighter w-24 h-24 rounded-full border-4 border-black shadow-[6px_6px_0_0_#000] hover:bg-red-700 hover:scale-105 active:scale-95 active:shadow-none flex flex-col items-center justify-center gap-1 transition-all group"
      title="Seriously, DO NOT PUSH"
    >
      <Skull className="w-8 h-8 group-hover:animate-bounce" />
      <span className="leading-none text-center">DO NOT<br/>PUSH</span>
    </button>
  );
}

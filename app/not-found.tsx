import Link from "next/link";
import { buttons } from "@/lib/ui/buttons";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-[120px] leading-none font-black text-black drop-shadow-[8px_8px_0_#A3FF12] mb-4">
        404
      </h1>
      <div className="border-4 border-black bg-white p-4 sm:p-8 shadow-[12px_12px_0_0_#000] max-w-full lg:max-w-4xl w-full flex flex-col items-center justify-center text-center overflow-hidden">
        <h2 className="text-[clamp(14px,3vw,30px)] whitespace-nowrap font-black uppercase tracking-widest text-black mb-4 text-center">
          The TVA pruned this timeline.
        </h2>
        <p className="text-[clamp(10px,2vw,18px)] whitespace-nowrap font-bold text-black uppercase mb-8 text-center">
          (Or Rizul accidentally deleted it while trying to fix a bug.)
        </p>
        <Link href="/" className={`${buttons.primary} w-full sm:w-auto text-center justify-center`}>
          Return to the Sacred Timeline
        </Link>
      </div>
    </div>
  );
}

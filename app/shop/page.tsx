import ShopClient from "@/components/ShopClient";
import { Suspense } from "react";

export default async function ShopPage() {
  await new Promise(r => setTimeout(r, 1000));
  
  return (
    <Suspense fallback={<div className="p-12 text-center text-2xl font-black uppercase text-black">Loading Shop...</div>}>
      <ShopClient />
    </Suspense>
  );
}

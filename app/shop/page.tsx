import { Metadata } from "next";
import ShopClient from "@/components/ShopClient";

export const metadata: Metadata = {
  title: "Shop Posters",
  description: "Browse our collection of premium, limited edition pop culture posters and wall art. Filter by your favorite tags to find the perfect addition to your room.",
  openGraph: {
    title: "Shop Posters | Wall Crawl Nation",
    description: "Browse our collection of premium pop culture posters and wall art.",
    url: "https://wall-crawl-nation.vercel.app/shop",
  },
};
import { Suspense } from "react";

export default async function ShopPage() {
  await new Promise(r => setTimeout(r, 1000));
  
  return (
    <Suspense fallback={<div className="p-12 text-center text-2xl font-black uppercase text-black">Loading Shop...</div>}>
      <ShopClient />
    </Suspense>
  );
}

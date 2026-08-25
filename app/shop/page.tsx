import { Metadata } from "next";
import ShopClient from "@/components/ShopClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Shop Premium Posters",
  description: "Browse our collection of premium, limited edition pop culture posters and wall art. Featuring aesthetics like vintage, dark academia, retro, anime, marvel, and minimalist. Find the perfect addition to your room.",
  openGraph: {
    title: "Shop Premium Posters | Wall Crawl Nation",
    description: "Browse our extensive collection of pop culture posters and aesthetic wall art. From vintage to anime, we have it all.",
    url: "https://wall-crawl-nation.vercel.app/shop",
  },
};

export default async function ShopPage() {
  await new Promise(r => setTimeout(r, 1000));
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Wall Crawl Nation Poster Collection",
    description: "A curated collection of premium wall art, covering aesthetics from vintage and retro to anime, gaming, and minimalist.",
    url: "https://wall-crawl-nation.vercel.app/shop",
    isPartOf: {
      "@type": "WebSite",
      name: "Wall Crawl Nation",
      url: "https://wall-crawl-nation.vercel.app/"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<div className="p-12 text-center text-2xl font-black uppercase text-black">Loading Shop...</div>}>
        <ShopClient />
      </Suspense>
    </>
  );
}

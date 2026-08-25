import { Metadata } from "next";
import CustomOrderClient from "@/components/shop/CustomOrderClient";

export const metadata: Metadata = {
  title: "Custom Posters & Polaroids",
  description: "Upload your own designs and we'll print them as premium A4 posters for just ₹40. Or get custom polaroid prints. Fast, easy, and high quality.",
  openGraph: {
    title: "Custom Posters & Polaroids | Wall Crawl Nation",
    description: "Print your own designs! Custom A4 posters for ₹40 and polaroid photos.",
    url: "https://wall-crawl-nation.vercel.app/custom-order",
  }
};

export default function CustomOrderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Custom Poster Printing",
    provider: {
      "@type": "Organization",
      name: "Wall Crawl Nation"
    },
    areaServed: {
      "@type": "Country",
      name: "India"
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Custom Printing Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Custom A4 Poster Print"
          },
          price: "40.00",
          priceCurrency: "INR"
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Custom Polaroid Photos"
          }
        }
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CustomOrderClient />
    </>
  );
}

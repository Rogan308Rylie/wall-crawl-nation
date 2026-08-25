import { notFound } from "next/navigation";
import { getAdminDb } from "@/lib/firebaseAdmin";
import PosterDetailClient from "@/components/shop/PosterDetailClient";
import { Metadata } from "next";

type Poster = {
  id: string;
  title: string;
  price: number;
  imagePath: string;
  tags?: string[];
  isActive?: boolean;
};

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const db = getAdminDb();
    const docSnap = await db.collection("posters").doc(id).get();
    
    if (!docSnap.exists) {
      return { title: "Poster Not Found" };
    }
    
    const poster = docSnap.data() as Poster;
    
    return {
      title: `${poster.title} | Premium Wall Art`,
      description: `Buy ${poster.title} premium poster. High-quality archival ink on 300GSM paper. Enhance your room aesthetic with Wall Crawl Nation.`,
      openGraph: {
        title: poster.title,
        description: `Premium wall art: ${poster.title}`,
        images: [poster.imagePath || "/assets/og-image-placeholder.jpg"],
        url: `https://wall-crawl-nation.vercel.app/shop/${id}`,
        type: "website",
      },
    };
  } catch (error) {
    return { title: "Wall Crawl Nation Poster" };
  }
}

export default async function PosterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let poster: Poster | null = null;
  
  try {
    const db = getAdminDb();
    const docSnap = await db.collection("posters").doc(id).get();
    
    if (docSnap.exists) {
      poster = { id: docSnap.id, ...docSnap.data() } as Poster;
    }
  } catch (error) {
    console.error("Error fetching poster:", error);
  }

  if (!poster || (poster.isActive === false)) {
    notFound();
  }

  // Generate JSON-LD schema for this product to show up on Google Shopping
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: poster.title,
    image: poster.imagePath,
    description: `Premium wall art: ${poster.title}. High-quality archival ink on 300GSM paper.`,
    brand: {
      "@type": "Brand",
      name: "Wall Crawl Nation",
    },
    offers: {
      "@type": "Offer",
      url: `https://wall-crawl-nation.vercel.app/shop/${id}`,
      priceCurrency: "INR",
      price: poster.price,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PosterDetailClient
        id={poster.id}
        title={poster.title}
        price={poster.price}
        imagePath={poster.imagePath}
        tags={poster.tags}
      />
    </>
  );
}

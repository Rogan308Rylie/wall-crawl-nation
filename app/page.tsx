import { Metadata } from "next";
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "Wall Crawl Nation | Redefining Spaces with Bold Aesthetics",
  description: "Shop premium wall art, custom A4 posters, and aesthetic decor inspired by pop culture. Featuring exclusive designs, museum quality prints, and polaroids.",
  openGraph: {
    title: "Wall Crawl Nation | Redefining Spaces with Bold Aesthetics",
    description: "Shop premium wall art, custom A4 posters, and aesthetic decor inspired by pop culture.",
    url: "https://wall-crawl-nation.vercel.app/",
  }
};

export default function HomePage() {
  return <HomeClient />;
}
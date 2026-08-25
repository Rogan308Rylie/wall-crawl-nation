import { MetadataRoute } from 'next';
import { getAdminDb } from '@/lib/firebaseAdmin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://wall-crawl-nation.vercel.app";

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/custom-order`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  try {
    const db = getAdminDb();
    const snapshot = await db.collection("posters").where("isActive", "==", true).get();
    
    snapshot.forEach((doc) => {
      routes.push({
        url: `${baseUrl}/shop/${doc.id}`,
        lastModified: new Date(), // Or use a specific 'updatedAt' timestamp if available in your schema
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }

  return routes;
}

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://wall-crawl-nation.vercel.app";

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/cart', '/checkout', '/login', '/signup', '/thank-you'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

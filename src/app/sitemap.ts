import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://work.krd';
  const locales = ['en', 'ar', 'ckb'];

  // Public pages that should be in sitemap
  const publicPages = [
    '', // home
    '/billing',
    '/privacy',
    '/terms',
  ];

  const sitemap: MetadataRoute.Sitemap = [];

  // Add pages for each locale
  for (const locale of locales) {
    for (const page of publicPages) {
      sitemap.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1.0 : 0.8,
      });
    }
  }

  return sitemap;
}

import { MetadataRoute } from 'next';
import { getAllPostSlugs } from '@/lib/blog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://work.krd';
  const locales = ['en', 'ar', 'ckb'];

  const sitemap: MetadataRoute.Sitemap = [];

  // Add root homepage
  sitemap.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1.0,
    alternates: {
      languages: {
        en: `${baseUrl}/en`,
        ar: `${baseUrl}/ar`,
        ckb: `${baseUrl}/ckb`,
        'x-default': `${baseUrl}/en`,
      } as Record<string, string>,
    },
  });

  // Public pages (excluding billing — it's behind auth)
  const publicPages = [
    '', // locale home
    '/privacy',
    '/terms',
  ];

  for (const locale of locales) {
    for (const page of publicPages) {
      sitemap.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 0.9 : 0.5,
      });
    }
  }

  // Blog index
  sitemap.push({
    url: `${baseUrl}/blog`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  });

  // Blog posts (with real publishedAt dates)
  const { prisma } = await import('@/lib/prisma');
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true, publishedAt: true, updatedAt: true },
  });
  for (const post of posts) {
    sitemap.push({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt || new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  return sitemap;
}

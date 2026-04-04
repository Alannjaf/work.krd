import { MetadataRoute } from 'next';
import { getAllCitySlugs } from '@/lib/cities';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://work.krd';

  const sitemap: MetadataRoute.Sitemap = [];

  // Homepage
  sitemap.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1.0,
  });

  // Public pages (actual routes that exist)
  const publicPages = [
    { path: '/services', changeFreq: 'weekly' as const, priority: 0.9 },
    { path: '/blog', changeFreq: 'weekly' as const, priority: 0.8 },
    { path: '/privacy', changeFreq: 'monthly' as const, priority: 0.3 },
    { path: '/terms', changeFreq: 'monthly' as const, priority: 0.3 },
  ];

  for (const page of publicPages) {
    sitemap.push({
      url: `${baseUrl}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFreq,
      priority: page.priority,
    });
  }

  const { prisma } = await import('@/lib/prisma');

  // Jobs listing page
  sitemap.push({
    url: `${baseUrl}/jobs`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  });

  // Individual job pages
  const jobs = await prisma.job.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });
  for (const job of jobs) {
    if (job.slug) {
      sitemap.push({
        url: `${baseUrl}/jobs/${job.slug}`,
        lastModified: job.updatedAt,
        changeFrequency: 'daily',
        priority: 0.6,
      });
    }
  }

  // City landing pages (programmatic SEO)
  for (const citySlug of getAllCitySlugs()) {
    sitemap.push({
      url: `${baseUrl}/${citySlug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }

  // Blog posts (with real publishedAt dates)
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

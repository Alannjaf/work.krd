import { MetadataRoute } from 'next';

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

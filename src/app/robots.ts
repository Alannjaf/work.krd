import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/', '/onboarding/', '/billing/', '/resume-builder/', '/clear-cookies/'],
      },
    ],
    sitemap: 'https://work.krd/sitemap.xml',
  }
}

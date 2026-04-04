import { getAllPosts } from '@/lib/blog'
import type { Metadata } from 'next'
import { generateHreflangAlternates } from '@/lib/seo'
import { BlogPageClient } from './blog-page-client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Tips, guides, and insights on resume writing, career development, and job hunting in English, Arabic, and Kurdish.',
  openGraph: {
    title: 'Blog | Work.krd',
    description:
      'Tips, guides, and insights on resume writing, career development, and job hunting in English, Arabic, and Kurdish.',
    type: 'website',
    url: 'https://work.krd/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Work.krd',
    description:
      'Tips, guides, and insights on resume writing, career development, and job hunting.',
  },
  alternates: generateHreflangAlternates('/blog'),
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return <BlogPageClient posts={posts} />
}

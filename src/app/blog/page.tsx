import { getAllPosts } from '@/lib/blog'
import type { Metadata } from 'next'
import { BlogPageClient } from './blog-page-client'

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
  alternates: {
    canonical: 'https://work.krd/blog',
  },
}

export default function BlogPage() {
  const posts = getAllPosts()

  return <BlogPageClient posts={posts} />
}

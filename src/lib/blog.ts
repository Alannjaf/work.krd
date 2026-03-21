import { prisma } from '@/lib/prisma'
import readingTime from 'reading-time'

export interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  author: string
  lang: 'en' | 'ar' | 'ckb'
  tags?: string[]
  content: string
  readingTime: string
}

export interface BlogPostMetadata {
  slug: string
  title: string
  date: string
  excerpt: string
  author: string
  lang: 'en' | 'ar' | 'ckb'
  tags?: string[]
  readingTime: string
}

/**
 * Get all blog post slugs (published only)
 */
export async function getAllPostSlugs(): Promise<string[]> {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return posts.map((p) => p.slug)
}

/**
 * Get a single blog post by slug (published only for public)
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  })

  if (!post || !post.published) {
    return null
  }

  const readTime = readingTime(post.content)

  return {
    slug: post.slug,
    title: post.title,
    date: (post.publishedAt || post.createdAt).toISOString(),
    excerpt: post.excerpt,
    author: post.author,
    lang: post.lang as 'en' | 'ar' | 'ckb',
    tags: post.tags,
    content: post.content,
    readingTime: readTime.text,
  }
}

/**
 * Get all blog posts metadata (without content, published only)
 */
export async function getAllPosts(): Promise<BlogPostMetadata[]> {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      author: true,
      lang: true,
      tags: true,
      content: true,
      publishedAt: true,
      createdAt: true,
    },
  })

  return posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    date: (post.publishedAt || post.createdAt).toISOString(),
    excerpt: post.excerpt,
    author: post.author,
    lang: post.lang as 'en' | 'ar' | 'ckb',
    tags: post.tags,
    readingTime: readingTime(post.content).text,
  }))
}

/**
 * Get posts by language (published only)
 */
export async function getPostsByLanguage(lang: 'en' | 'ar' | 'ckb'): Promise<BlogPostMetadata[]> {
  const allPosts = await getAllPosts()
  return allPosts.filter((post) => post.lang === lang)
}

/**
 * Get posts by tag (published only)
 */
export async function getPostsByTag(tag: string): Promise<BlogPostMetadata[]> {
  const allPosts = await getAllPosts()
  return allPosts.filter((post) => post.tags?.includes(tag))
}
